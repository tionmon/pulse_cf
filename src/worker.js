const COOKIE = '__Host-pulse_session'
const INTERVALS = new Set([60, 300, 600, 1800, 3600])
const DAY = 86400000
const SESSION_TTL = 7 * DAY
const te = new TextEncoder()

const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } })
}
function fail(message, status = 400) { return json({ error: message }, status) }
function now() { return Date.now() }
function randomToken(bytes = 32) {
  const a = crypto.getRandomValues(new Uint8Array(bytes))
  return btoa(String.fromCharCode(...a)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}
async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', te.encode(value))
  return [...new Uint8Array(digest)].map((n) => n.toString(16).padStart(2, '0')).join('')
}
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
function cookieMap(value = '') {
  return Object.fromEntries(value.split(';').map((x) => x.trim().split('=').map(decodeURIComponent)).filter((x) => x.length === 2))
}
function sameOrigin(request) {
  const origin = request.headers.get('origin')
  return origin && origin === new URL(request.url).origin
}
async function body(request) {
  const length = Number(request.headers.get('content-length') || 0)
  if (length > 16384) throw Object.assign(new Error('请求内容过大'), { status: 413 })
  return request.json()
}
function tags(value) {
  if (!Array.isArray(value)) throw new Error('标签必须是字符串数组')
  const result = [...new Set(value.map((x) => String(x).trim()).filter(Boolean))]
  if (result.length > 10 || result.some((x) => x.length > 24 || !/^[\p{Script=Han}A-Za-z0-9._-]+$/u.test(x))) throw new Error('标签格式不正确')
  return result
}
function target(value) {
  let u
  try { u = new URL(value) } catch { throw new Error('请输入有效的 HTTP(S) URL') }
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) throw new Error('仅支持不含凭据的 HTTP(S) URL')
  const h = u.hostname.toLowerCase().replace(/\.$/, '')
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || h === '0.0.0.0' || h === '::1' || /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)) throw new Error('不允许监控本地或私有网络地址')
  u.hash = ''
  return u.toString()
}
function monitorInput(value = {}) {
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  const intervalSeconds = Number(value.intervalSeconds)
  if (!name || name.length > 60) throw new Error('名称需要 1-60 个字符')
  if (!INTERVALS.has(intervalSeconds)) throw new Error('请选择有效的探测间隔')
  return { name, url: target(value.url), tags: tags(value.tags || []), intervalSeconds, enabled: value.enabled !== false }
}
function mapMonitor(row) {
  return row && {
    id: row.id, name: row.name, url: row.url, tags: JSON.parse(row.tags_json || '[]'),
    intervalSeconds: row.interval_seconds, timeoutMs: row.timeout_ms, enabled: Boolean(row.enabled),
    position: row.position, createdAt: row.created_at, updatedAt: row.updated_at,
    nextCheckAt: row.next_check_at, lastCheckedAt: row.last_checked_at, status: row.status,
    httpStatus: row.http_status, latencyMs: row.latency_ms, errorCode: row.error_code, errorMessage: row.error_message,
  }
}
async function setting(env, key, fallback = '') {
  return (await env.DB.prepare('SELECT value FROM settings WHERE key=?').bind(key).first())?.value ?? fallback
}
async function setSetting(env, key, value) {
  await env.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key, String(value)).run()
}
async function session(request, env) {
  const raw = cookieMap(request.headers.get('cookie'))[COOKIE]
  if (!raw) return null
  const hash = await sha256(raw)
  const row = await env.DB.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?').bind(hash, now()).first()
  if (!row || now() - row.last_seen_at > DAY) return null
  await env.DB.prepare('UPDATE sessions SET last_seen_at=? WHERE token_hash=?').bind(now(), hash).run()
  return { ...row, raw }
}
async function requireAdmin(request, env, csrf = false) {
  if (request.method !== 'GET' && !sameOrigin(request)) throw Object.assign(new Error('请求来源校验失败，请刷新页面后重试'), { status: 403 })
  const current = await session(request, env)
  if (!current) throw Object.assign(new Error('登录已失效，请重新登录'), { status: 401 })
  if (csrf && !safeEqual(current.csrf_hash, await sha256(request.headers.get('x-csrf-token') || ''))) throw Object.assign(new Error('安全令牌已失效，请刷新页面后重试'), { status: 403 })
  return current
}
async function passwordMatches(env, supplied) {
  const stored = await setting(env, 'admin_password_hash')
  if (stored) return safeEqual(stored, await sha256(supplied))
  return safeEqual(String(env.ADMIN_PASSWORD || ''), supplied)
}
async function history(env, monitorId, timestamp) {
  const start = timestamp - DAY
  const checks = (await env.DB.prepare('SELECT checked_at,status FROM checks WHERE monitor_id=? AND checked_at>=? ORDER BY checked_at').bind(monitorId, start).all()).results
  const width = DAY / 48
  const buckets = Array.from({ length: 48 }, (_, i) => ({ status: 'unknown', from: Math.round(start + i * width), to: Math.round(start + (i + 1) * width), total: 0, up: 0 }))
  for (const c of checks) {
    const bucket = buckets[Math.min(47, Math.max(0, Math.floor((c.checked_at - start) / width)))]
    bucket.total++
    if (c.status === 'up') bucket.up++
    bucket.status = c.status === 'down' ? 'down' : bucket.status === 'down' ? 'down' : 'up'
  }
  return { buckets, uptime: checks.length ? checks.filter((x) => x.status === 'up').length / checks.length * 100 : null, samples: checks.length }
}
async function view(env, row, privateView, timestamp) {
  const m = mapMonitor(row)
  const stale = !m.lastCheckedAt || timestamp - m.lastCheckedAt > Math.max(120000, m.intervalSeconds * 2500)
  const status = stale ? 'unknown' : m.status
  const h = await history(env, m.id, timestamp)
  const result = { id: m.id, name: m.name, tags: m.tags, status, enabled: m.enabled, lastCheckedAt: m.lastCheckedAt, httpStatus: status === 'unknown' ? null : m.httpStatus, latencyMs: status === 'unknown' ? null : m.latencyMs, errorCode: status === 'down' ? m.errorCode : null, errorMessage: status === 'down' ? m.errorMessage : null, uptime: h.uptime, samples: h.samples, history: h.buckets }
  if (privateView) Object.assign(result, { url: m.url, intervalSeconds: m.intervalSeconds, timeoutMs: m.timeoutMs, createdAt: m.createdAt, updatedAt: m.updatedAt, nextCheckAt: m.nextCheckAt })
  return result
}
async function statusPayload(env, privateView = false) {
  const timestamp = now()
  const rows = (await env.DB.prepare(`SELECT * FROM monitors ${privateView ? '' : 'WHERE enabled=1'} ORDER BY position,created_at`).all()).results
  const monitors = await Promise.all(rows.map((row) => view(env, row, privateView, timestamp)))
  if (privateView) return { siteTitle: await setting(env, 'site_title', '服务状态'), telegram: await telegramSettings(env), monitors, generatedAt: timestamp }
  const overall = !monitors.length ? 'unknown' : monitors.some((x) => x.status === 'down') ? 'down' : monitors.some((x) => x.status === 'unknown') ? 'unknown' : 'up'
  return { siteTitle: await setting(env, 'site_title', '服务状态'), overall, monitors, generatedAt: timestamp }
}
async function telegramSettings(env, withToken = false) {
  const enabled = await setting(env, 'telegram_enabled') === '1'
  const botToken = await setting(env, 'telegram_token')
  const chatId = await setting(env, 'telegram_chat_id')
  return { enabled, configured: Boolean(botToken && chatId), chatId, ...(withToken ? { botToken } : {}) }
}
async function sendTelegram(env, text) {
  const t = await telegramSettings(env, true)
  if (!t.configured) throw new Error('Telegram 尚未配置')
  const response = await fetch(`https://api.telegram.org/bot${t.botToken}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: t.chatId, text, disable_web_page_preview: true }) })
  if (!response.ok) throw new Error('Telegram 消息发送失败')
}
async function probe(env, row) {
  const m = mapMonitor(row)
  const started = performance.now()
  let result
  try {
    const response = await fetch(m.url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(m.timeoutMs), headers: { 'user-agent': 'Pulse-CF/1.0' } })
    const latencyMs = Math.round(performance.now() - started)
    result = response.ok ? { status: 'up', httpStatus: response.status, latencyMs, errorCode: null, errorMessage: null } : { status: 'down', httpStatus: response.status, latencyMs, errorCode: `http_${response.status}`, errorMessage: `HTTP ${response.status}` }
    if (response.body) await response.body.cancel().catch(() => {})
  } catch (error) {
    result = { status: 'down', httpStatus: null, latencyMs: Math.round(performance.now() - started), errorCode: error?.name === 'TimeoutError' ? 'timeout' : 'fetch_failed', errorMessage: String(error?.message || '请求失败').slice(0, 240) }
  }
  const timestamp = now()
  await env.DB.batch([
    env.DB.prepare('INSERT INTO checks(monitor_id,checked_at,status,http_status,latency_ms,error_code,error_message) VALUES(?,?,?,?,?,?,?)').bind(m.id, timestamp, result.status, result.httpStatus, result.latencyMs, result.errorCode, result.errorMessage),
    env.DB.prepare('UPDATE monitors SET next_check_at=?,last_checked_at=?,status=?,http_status=?,latency_ms=?,error_code=?,error_message=? WHERE id=?').bind(timestamp + m.intervalSeconds * 1000, timestamp, result.status, result.httpStatus, result.latencyMs, result.errorCode, result.errorMessage, m.id),
  ])
  if ((m.status !== 'down' && result.status === 'down') || (m.status === 'down' && result.status === 'up')) {
    const t = await telegramSettings(env)
    if (t.enabled && t.configured) await sendTelegram(env, result.status === 'up' ? `✅ ${m.name} 已恢复\n${m.url}\n${result.latencyMs} ms` : `🚨 ${m.name} 不可用\n${m.url}\n${result.errorMessage || result.errorCode}`).catch(() => {})
  }
  return result
}
async function scheduled(env) {
  const rows = (await env.DB.prepare('SELECT * FROM monitors WHERE enabled=1 AND next_check_at<=? ORDER BY next_check_at LIMIT 10').bind(now()).all()).results
  await Promise.all(rows.map((row) => probe(env, row)))
  await env.DB.batch([
    env.DB.prepare('DELETE FROM checks WHERE checked_at<?').bind(now() - 90 * DAY),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at<? OR last_seen_at<?').bind(now(), now() - DAY),
  ])
}
async function api(request, env) {
  const u = new URL(request.url)
  const p = u.pathname
  if (p === '/api/health' && request.method === 'GET') return json({ ok: true, scheduler: 'cron', time: now() })
  if (p === '/api/public/status' && request.method === 'GET') return json(await statusPayload(env), 200, { 'cache-control': 'no-cache' })
  if (p === '/api/auth/session' && request.method === 'GET') {
    const s = await session(request, env)
    if (!s) return json({ authenticated: false })
    const csrfToken = randomToken()
    await env.DB.prepare('UPDATE sessions SET csrf_hash=? WHERE token_hash=?').bind(await sha256(csrfToken), s.token_hash).run()
    return json({ authenticated: true, username: s.username, csrfToken })
  }
  if (p === '/api/auth/login' && request.method === 'POST') {
    if (!sameOrigin(request)) return fail('请求来源校验失败，请刷新页面后重试', 403)
    const data = await body(request)
    const username = String(data.username || '').trim()
    const key = await sha256(`${request.headers.get('cf-connecting-ip') || 'unknown'}:${username.toLowerCase()}`)
    const attempt = await env.DB.prepare('SELECT * FROM login_attempts WHERE key=?').bind(key).first()
    if (attempt?.blocked_until > now()) return fail('尝试次数过多，请稍后再试', 429)
    if (username !== 'admin' || !(await passwordMatches(env, String(data.password || '')))) {
      const attempts = attempt && now() - attempt.window_started < 900000 ? attempt.attempts + 1 : 1
      await env.DB.prepare('INSERT INTO login_attempts(key,attempts,window_started,blocked_until) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET attempts=excluded.attempts,window_started=excluded.window_started,blocked_until=excluded.blocked_until').bind(key, attempts, now(), attempts >= 5 ? now() + 900000 : 0).run()
      return fail('用户名或密码错误', 401)
    }
    await env.DB.prepare('DELETE FROM login_attempts WHERE key=?').bind(key).run()
    const token = randomToken(), csrfToken = randomToken(), timestamp = now()
    await env.DB.prepare('INSERT INTO sessions(token_hash,csrf_hash,username,created_at,last_seen_at,expires_at) VALUES(?,?,?,?,?,?)').bind(await sha256(token), await sha256(csrfToken), 'admin', timestamp, timestamp, timestamp + SESSION_TTL).run()
    return json({ authenticated: true, username: 'admin', csrfToken }, 200, { 'set-cookie': `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL / 1000}` })
  }
  if (p === '/api/auth/logout' && request.method === 'POST') {
    const s = await requireAdmin(request, env, true)
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(s.token_hash).run()
    return new Response(null, { status: 204, headers: { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` } })
  }
  if (p === '/api/admin/status' && request.method === 'GET') { await requireAdmin(request, env); return json(await statusPayload(env, true)) }
  await requireAdmin(request, env, true)
  if (p === '/api/admin/monitors' && request.method === 'POST') {
    const m = monitorInput(await body(request)), timestamp = now(), id = crypto.randomUUID()
    const pos = (await env.DB.prepare('SELECT COALESCE(MAX(position),-1)+1 AS value FROM monitors').first()).value
    await env.DB.prepare('INSERT INTO monitors(id,name,url,tags_json,interval_seconds,enabled,position,created_at,updated_at,next_check_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id, m.name, m.url, JSON.stringify(m.tags), m.intervalSeconds, m.enabled ? 1 : 0, pos, timestamp, timestamp, timestamp).run()
    const row = await env.DB.prepare('SELECT * FROM monitors WHERE id=?').bind(id).first()
    return json({ monitor: await view(env, row, true, timestamp) }, 201)
  }
  if (p === '/api/admin/monitors/order' && request.method === 'PUT') {
    const ids = (await body(request)).ids
    if (!Array.isArray(ids)) return fail('ids 必须是数组')
    const rows = (await env.DB.prepare('SELECT id FROM monitors').all()).results
    if (ids.length !== rows.length || new Set(ids).size !== ids.length || rows.some((x) => !ids.includes(x.id))) return fail('排序列表必须完整包含全部监控站点')
    await env.DB.batch(ids.map((id, i) => env.DB.prepare('UPDATE monitors SET position=?,updated_at=? WHERE id=?').bind(i, now(), id)))
    return json({ monitors: (await statusPayload(env, true)).monitors })
  }
  if (p === '/api/admin/monitors/bulk' && request.method === 'POST') {
    const data = await body(request), ids = data.ids
    if (!Array.isArray(ids) || !ids.length) return fail('请至少选择一个监控站点')
    if (data.action === 'check') { const rows = (await env.DB.prepare(`SELECT * FROM monitors WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results; await Promise.all(rows.map((x) => probe(env, x))); return json({ action: 'check', queued: rows.length }, 202) }
    if (!['delete', 'pause', 'resume'].includes(data.action)) return fail('不支持的批量操作')
    const statements = ids.map((id) => data.action === 'delete' ? env.DB.prepare('DELETE FROM monitors WHERE id=?').bind(id) : env.DB.prepare(`UPDATE monitors SET enabled=?,updated_at=?${data.action === 'resume' ? ',next_check_at=?' : ''} WHERE id=?`).bind(...(data.action === 'resume' ? [1, now(), now(), id] : [0, now(), id])))
    await env.DB.batch(statements)
    return json({ action: data.action, affected: ids.length })
  }
  const match = p.match(/^\/api\/admin\/monitors\/([^/]+)(\/check)?$/)
  if (match) {
    const id = decodeURIComponent(match[1]), row = await env.DB.prepare('SELECT * FROM monitors WHERE id=?').bind(id).first()
    if (!row) return fail('监控站点不存在', 404)
    if (match[2] && request.method === 'POST') return json({ result: await probe(env, row) })
    if (request.method === 'DELETE') { await env.DB.prepare('DELETE FROM monitors WHERE id=?').bind(id).run(); return new Response(null, { status: 204 }) }
    if (request.method === 'PUT') {
      const m = monitorInput(await body(request)), changed = m.url !== row.url, timestamp = now()
      await env.DB.prepare(`UPDATE monitors SET name=?,url=?,tags_json=?,interval_seconds=?,enabled=?,updated_at=?,next_check_at=?,last_checked_at=${changed ? 'NULL' : 'last_checked_at'},status=${changed ? "'unknown'" : 'status'} WHERE id=?`).bind(m.name, m.url, JSON.stringify(m.tags), m.intervalSeconds, m.enabled ? 1 : 0, timestamp, changed || (m.enabled && !row.enabled) ? timestamp : row.next_check_at, id).run()
      const next = await env.DB.prepare('SELECT * FROM monitors WHERE id=?').bind(id).first()
      return json({ monitor: await view(env, next, true, timestamp) })
    }
  }
  if (p === '/api/admin/settings' && request.method === 'PUT') { const title = String((await body(request)).siteTitle || '').trim(); if (!title || title.length > 60) return fail('页面标题需要 1-60 个字符'); await setSetting(env, 'site_title', title); return json({ siteTitle: title }) }
  if (p === '/api/admin/telegram' && request.method === 'PUT') {
    const data = await body(request), current = await telegramSettings(env, true), token = String(data.botToken || current.botToken || '').trim(), chat = String(data.chatId ?? current.chatId ?? '').trim()
    if (data.enabled && (!token || !chat)) return fail('启用 Telegram 通知前请填写 Bot Token 和 Chat ID')
    await env.DB.batch([env.DB.prepare("UPDATE settings SET value=? WHERE key='telegram_enabled'").bind(data.enabled ? '1' : '0'), env.DB.prepare("UPDATE settings SET value=? WHERE key='telegram_token'").bind(token), env.DB.prepare("UPDATE settings SET value=? WHERE key='telegram_chat_id'").bind(chat)])
    return json({ telegram: await telegramSettings(env) })
  }
  if (p === '/api/admin/telegram/test' && request.method === 'POST') { await sendTelegram(env, '✅ Pulse CF 测试消息发送成功'); return json({ ok: true }) }
  if (p === '/api/admin/password' && request.method === 'POST') {
    const data = await body(request), next = String(data.nextPassword || '')
    if (!(await passwordMatches(env, String(data.currentPassword || '')))) return fail('当前密码不正确')
    if (next.length < 12 || next.length > 256) return fail('新密码至少需要 12 个字符')
    await setSetting(env, 'admin_password_hash', await sha256(next)); await env.DB.prepare('DELETE FROM sessions').run()
    return json({ reauthenticate: true }, 200, { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` })
  }
  return fail('接口不存在', 404)
}

export default {
  async fetch(request, env) {
    try {
      const path = new URL(request.url).pathname
      if (path.startsWith('/api/')) return await api(request, env)
      return env.ASSETS.fetch(request)
    } catch (error) {
      console.error(error)
      return fail(error?.message || '服务器内部错误', error?.status || 500)
    }
  },
  async scheduled(_event, env, ctx) { ctx.waitUntil(scheduled(env)) },
}
