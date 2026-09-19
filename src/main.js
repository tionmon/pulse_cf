import './styles.css'

const app = document.querySelector('#app')
let csrf = '', admin = false, state = null
const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
async function api(path, options = {}) {
  const r = await fetch(path, { credentials: 'same-origin', ...options, headers: { ...(options.body ? {'content-type':'application/json'} : {}), ...(csrf ? {'x-csrf-token':csrf} : {}), ...options.headers } })
  if (r.status === 204) return null
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || `请求失败 (${r.status})`)
  return data
}
function toast(message, bad = false) { const e = document.createElement('div'); e.className = `toast ${bad?'bad':''}`; e.textContent = message; document.body.append(e); setTimeout(() => e.remove(), 2800) }
const badge = s => `<span class="badge ${s}"><i></i>${s==='up'?'正常':s==='down'?'异常':'未知'}</span>`
const ago = v => v ? `${Math.max(0,Math.round((Date.now()-v)/60000))} 分钟前` : '尚未探测'
function card(m) {
  const bars = (m.history||[]).map(x=>`<b class="${x.status}"></b>`).join('')
  const tools = admin ? `<div class="actions"><button data-a="check" data-id="${m.id}">立即探测</button><button data-a="toggle" data-id="${m.id}">${m.enabled?'暂停':'恢复'}</button><button data-a="edit" data-id="${m.id}">编辑</button><button class="danger" data-a="delete" data-id="${m.id}">删除</button></div>` : ''
  return `<article class="card ${m.enabled?'':'disabled'}"><div class="head"><div><h3>${esc(m.name)}</h3>${admin?`<a href="${esc(m.url)}" target="_blank" rel="noreferrer">${esc(m.url)}</a>`:''}</div>${badge(m.status)}</div><div class="tags">${(m.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="metrics"><span><strong>${m.uptime==null?'—':m.uptime.toFixed(2)+'%'}</strong>可用率</span><span><strong>${m.latencyMs==null?'—':m.latencyMs+' ms'}</strong>延迟</span><span><strong>${m.httpStatus||'—'}</strong>HTTP</span><span><strong>${ago(m.lastCheckedAt)}</strong>上次探测</span></div><div class="timeline">${bars}</div>${m.status==='down'?`<p class="error">${esc(m.errorMessage||m.errorCode||'请求失败')}</p>`:''}${tools}</article>`
}
function render() {
  const overall = state.overall || (!state.monitors.length?'unknown':state.monitors.some(x=>x.status==='down')?'down':state.monitors.some(x=>x.status==='unknown')?'unknown':'up')
  app.innerHTML = `<header><a class="brand" href="#"><span>♥</span><b>Pulse CF</b></a><nav><button id="refresh">刷新</button>${admin?'<button id="settings">设置</button><button id="logout">退出</button>':'<button id="login">管理</button>'}</nav></header><main><section class="hero"><div><p>实时服务状态</p><h1>${esc(state.siteTitle)}</h1><small>${overall==='up'?'所有服务运行正常':overall==='down'?'部分服务出现异常':'服务状态等待确认'}</small></div><div class="orb ${overall}">${badge(overall)}</div></section>${admin?'<div class="toolbar"><div><h2>监控站点</h2><small>管理探测目标和运行状态</small></div><button class="primary" id="add">＋ 添加监控</button></div>':''}<section class="grid">${state.monitors.length?state.monitors.map(card).join(''):'<div class="empty">还没有监控站点</div>'}</section></main><footer>Powered by Cloudflare Workers · 数据每分钟更新</footer>`
  bind()
}
async function load() { try { state = await api(admin?'/api/admin/status':'/api/public/status'); render() } catch(e) { toast(e.message,true) } }
function modal(title, html) { const w=document.createElement('div'); w.className='modal-wrap'; w.innerHTML=`<div class="modal"><div class="modal-head"><h2>${title}</h2><button class="close">×</button></div>${html}</div>`; document.body.append(w); w.querySelector('.close').onclick=()=>w.remove(); w.onclick=e=>{if(e.target===w)w.remove()}; return w }
function login() {
  const m=modal('管理员登录','<form><label>用户名<input name="username" value="admin" required></label><label>密码<input name="password" type="password" required></label><button class="primary">登录</button></form>')
  m.querySelector('form').onsubmit=async e=>{e.preventDefault();try{const s=await api('/api/auth/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});csrf=s.csrfToken;admin=true;m.remove();await load();toast('登录成功')}catch(x){toast(x.message,true)}}
}
function editor(old=null) {
  const opts=[[60,'每分钟'],[300,'每 5 分钟'],[600,'每 10 分钟'],[1800,'每 30 分钟'],[3600,'每小时']]
  const m=modal(old?'编辑监控':'添加监控',`<form><label>名称<input name="name" maxlength="60" value="${esc(old?.name||'')}" required></label><label>网址<input name="url" type="url" value="${esc(old?.url||'')}" placeholder="https://example.com" required></label><label>标签<input name="tags" value="${esc((old?.tags||[]).join(', '))}" placeholder="生产, API"></label><label>探测间隔<select name="intervalSeconds">${opts.map(([v,l])=>`<option value="${v}" ${old?.intervalSeconds===v?'selected':''}>${l}</option>`).join('')}</select></label><label class="check"><input name="enabled" type="checkbox" ${old?.enabled!==false?'checked':''}> 启用监控</label><button class="primary">保存</button></form>`)
  m.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),d={name:f.get('name'),url:f.get('url'),tags:f.get('tags').split(/[,，]/).map(x=>x.trim()).filter(Boolean),intervalSeconds:Number(f.get('intervalSeconds')),enabled:f.has('enabled')};try{await api(old?`/api/admin/monitors/${old.id}`:'/api/admin/monitors',{method:old?'PUT':'POST',body:JSON.stringify(d)});m.remove();await load();toast('已保存')}catch(x){toast(x.message,true)}}
}
function settings() {
  const t=state.telegram||{},m=modal('系统设置',`<form><label>页面标题<input name="siteTitle" value="${esc(state.siteTitle)}" required></label><h3>Telegram 通知</h3><label>Bot Token<input name="botToken" type="password" placeholder="留空表示不修改"></label><label>Chat ID<input name="chatId" value="${esc(t.chatId||'')}"></label><label class="check"><input name="enabled" type="checkbox" ${t.enabled?'checked':''}> 启用异常与恢复通知</label><button class="primary">保存设置</button></form>`)
  m.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api('/api/admin/settings',{method:'PUT',body:JSON.stringify({siteTitle:f.get('siteTitle')})});await api('/api/admin/telegram',{method:'PUT',body:JSON.stringify({botToken:f.get('botToken'),chatId:f.get('chatId'),enabled:f.has('enabled')})});m.remove();await load();toast('设置已保存')}catch(x){toast(x.message,true)}}
}
function bind() {
  document.querySelector('#refresh').onclick=load
  document.querySelector('#login')?.addEventListener('click',login)
  document.querySelector('#add')?.addEventListener('click',()=>editor())
  document.querySelector('#settings')?.addEventListener('click',settings)
  document.querySelector('#logout')?.addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST'});admin=false;csrf='';await load()}catch(e){toast(e.message,true)}})
  document.querySelectorAll('[data-a]').forEach(b=>b.onclick=async()=>{const m=state.monitors.find(x=>x.id===b.dataset.id),a=b.dataset.a;if(a==='edit')return editor(m);if(a==='delete'&&!confirm(`确定删除“${m.name}”？`))return;try{if(a==='check')await api(`/api/admin/monitors/${m.id}/check`,{method:'POST'});if(a==='delete')await api(`/api/admin/monitors/${m.id}`,{method:'DELETE'});if(a==='toggle')await api(`/api/admin/monitors/${m.id}`,{method:'PUT',body:JSON.stringify({name:m.name,url:m.url,tags:m.tags,intervalSeconds:m.intervalSeconds,enabled:!m.enabled})});await load();toast('操作成功')}catch(e){toast(e.message,true)}})
}
async function init(){try{const s=await api('/api/auth/session');if(s.authenticated){admin=true;csrf=s.csrfToken}}catch{}await load();setInterval(load,60000)}
init()
