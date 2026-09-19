import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlignJustify,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  CircleDashed,
  CircleX,
  Columns2,
  Eye,
  EyeOff,
  GripHorizontal,
  GripVertical,
  Languages,
  List,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Minus,
  Moon,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Send,
  Settings2,
  Sun,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const MESSAGES = {
  zh: {
    adminShort: '管理',
    brandPublicLabel: 'Pulse 状态首页',
    brandAdminLabel: 'Pulse 管理首页',
    skipStatus: '跳到服务状态',
    skipAdmin: '跳到监测列表',
    openAdmin: '管理员登录',
    viewPublic: '查看公开状态页',
    settings: '设置',
    logout: '退出登录',
    close: '关闭',
    cancel: '取消',
    save: '保存',
    saving: '保存中',
    retry: '重试',
    loading: '正在加载',
    requestFailed: '请求未完成，请稍后重试。',
    switchNight: '切换到夜间模式',
    switchDay: '切换到日间模式',
    switchEnglish: '切换到 English',
    switchChinese: 'Switch to 简体中文',
    displayPreferences: '显示偏好',
    timelineDensity: '时间线样式',
    standardTimeline: '标准时间线',
    fineTimeline: '更细时间线',
    continuousTimeline: '连续细线',
    columnLayout: '列表列数',
    singleColumn: '单列',
    doubleColumn: '双列',
    statusUp: '正常',
    statusDown: '故障',
    statusUnknown: '等待数据',
    overallUp: '所有服务运行正常',
    overallDown: '检测到服务异常',
    overallUnknown: '正在确认服务状态',
    noMonitors: '尚未添加监测站点',
    fallbackTitle: '服务状态',
    updatedAt: '更新于 {time}',
    fetchingStatus: '正在获取最新状态',
    noPublicStatus: '暂无公开状态',
    service: '服务',
    last24Hours: '最近 24 小时',
    uptime: '可用率',
    historySummary: '最近 24 小时：{up} 段正常，{down} 段故障，{unknown} 段无数据',
    segmentLabel: '{time} - {status}',
    neverChecked: '尚未检测',
    noTime: '尚无时间',
    justNow: '刚刚',
    firstCheckPending: '等待首次有效探测',
    probeFailed: '探测失败',
    latencyAt: '{latency} ms · {time}',
    errorAt: '{error} · {time}',
    uptimeAt: '{uptime} 可用 · {time}',
    poweredBy: 'Powered by Pulse',
    backStatus: '返回状态页',
    loginTitle: '管理员登录',
    username: '用户名',
    password: '密码',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    signingIn: '登录中',
    signIn: '登录',
    addMonitor: '添加站点',
    editMonitor: '编辑站点',
    monitorName: '自定义名称',
    monitorUrl: '网页地址',
    monitorUrlHelp: '支持公开的 HTTP/HTTPS 网站，使用标准端口。',
    interval: '探测间隔',
    everyMinute: '每 1 分钟',
    every5Minutes: '每 5 分钟',
    every10Minutes: '每 10 分钟',
    every30Minutes: '每 30 分钟',
    everyHour: '每 1 小时',
    tags: '标签',
    tagsHelp: '用逗号或换行分隔，最多 10 个；每个标签不超过 24 个字符。',
    tagsPlaceholder: '生产, API, 亚太',
    tagInvalid: '标签需要 1-24 个中英文字符、数字或 ._-，最多 10 个。',
    enableProbe: '启用探测',
    enableProbeHelp: '关闭后不会出现在公开状态页',
    settingsTitle: '设置',
    currentAccount: '当前账户',
    publicPage: '公开页面',
    pageTitle: '页面标题',
    saveTitle: '保存标题',
    changePassword: '修改密码',
    currentPassword: '当前密码',
    nextPassword: '新密码',
    passwordHelp: '至少 12 个字符，且不能包含用户名。',
    updatePassword: '更新密码',
    telegram: 'Telegram 通知',
    telegramDescription: '站点故障和恢复时通过 Telegram Bot 发送通知。',
    telegramEnabled: '启用通知',
    telegramEnabledHelp: '保存后，新状态变化会发送到指定会话。',
    chatId: 'Chat ID',
    botToken: 'Bot Token',
    tokenConfiguredPlaceholder: '已配置；留空可继续使用当前 Token',
    tokenNewPlaceholder: '输入 Bot Token',
    telegramConfigured: 'Bot 与会话已配置',
    telegramNotConfigured: '尚未完整配置',
    saveTelegram: '保存 Telegram',
    testTelegram: '发送测试消息',
    testingTelegram: '正在测试',
    deleteMonitorTitle: '删除站点',
    deleteMonitorText: '确定删除“{name}”及其全部历史记录？',
    delete: '删除',
    deleting: '删除中',
    bulkDeleteTitle: '批量删除站点',
    bulkDeleteText: '确定删除选中的 {count} 个站点及其全部历史记录？此操作无法撤销。',
    statusManagement: '状态管理',
    monitors: '监测',
    noAdminMonitors: '还没有监测站点',
    addFirstMonitor: '添加第一个站点',
    manageTools: '监测筛选与批量操作',
    filterByTag: '按标签筛选',
    allTags: '全部标签',
    untagged: '无标签',
    selectFiltered: '全选筛选结果',
    selectedCount: '已选择 {count} 项',
    bulkPause: '批量暂停',
    bulkResume: '批量恢复',
    bulkCheck: '批量立即探测',
    bulkDelete: '批量删除',
    noFilterResults: '没有符合当前标签的站点',
    clearFilter: '清除筛选',
    reorderUnavailable: '筛选时暂不可排序；清除筛选后可拖动或使用键盘排序。',
    dragMonitor: '拖动 {name} 排序',
    dragDisabled: '筛选时不能调整顺序',
    selectMonitor: '选择 {name}',
    paused: '已暂停',
    checkMonitor: '立即探测 {name}',
    checkNow: '立即探测',
    pauseMonitor: '暂停 {name}',
    resumeMonitor: '启用 {name}',
    pause: '暂停探测',
    resume: '启用探测',
    editMonitorNamed: '编辑 {name}',
    edit: '编辑',
    deleteMonitorNamed: '删除 {name}',
    monitorUpdated: '站点已更新',
    monitorAdded: '站点已添加，正在首次探测',
    monitorPaused: '探测已暂停',
    monitorResumed: '探测已启用',
    probeComplete: '探测已完成',
    monitorDeleted: '站点已删除',
    titleSaved: '页面标题已保存',
    telegramSaved: 'Telegram 设置已保存',
    telegramTestSent: '测试消息已发送',
    orderSaved: '站点顺序已保存',
    bulkPaused: '已暂停 {count} 个站点',
    bulkResumed: '已恢复 {count} 个站点',
    bulkChecked: '已提交 {count} 个站点探测',
    bulkDeleted: '已删除 {count} 个站点',
  },
  en: {
    adminShort: 'Admin',
    brandPublicLabel: 'Pulse status home',
    brandAdminLabel: 'Pulse admin home',
    skipStatus: 'Skip to service status',
    skipAdmin: 'Skip to monitor list',
    openAdmin: 'Administrator sign in',
    viewPublic: 'View public status page',
    settings: 'Settings',
    logout: 'Sign out',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving',
    retry: 'Retry',
    loading: 'Loading',
    requestFailed: 'The request could not be completed. Please try again.',
    switchNight: 'Switch to night mode',
    switchDay: 'Switch to day mode',
    switchEnglish: 'Switch to English',
    switchChinese: 'Switch to Simplified Chinese',
    displayPreferences: 'Display preferences',
    timelineDensity: 'Timeline style',
    standardTimeline: 'Standard timeline',
    fineTimeline: 'Finer timeline',
    continuousTimeline: 'Continuous line',
    columnLayout: 'List columns',
    singleColumn: 'Single column',
    doubleColumn: 'Two columns',
    statusUp: 'Operational',
    statusDown: 'Outage',
    statusUnknown: 'Awaiting data',
    overallUp: 'All services are operational',
    overallDown: 'A service disruption was detected',
    overallUnknown: 'Confirming current service status',
    noMonitors: 'No monitors have been added',
    fallbackTitle: 'Service status',
    updatedAt: 'Updated {time}',
    fetchingStatus: 'Fetching the latest status',
    noPublicStatus: 'No public status is available',
    service: 'Service',
    last24Hours: 'Last 24 hours',
    uptime: 'Uptime',
    historySummary: 'Last 24 hours: {up} operational, {down} outage, {unknown} no-data intervals',
    segmentLabel: '{time} - {status}',
    neverChecked: 'Not checked yet',
    noTime: 'No timestamp',
    justNow: 'just now',
    firstCheckPending: 'Waiting for the first valid check',
    probeFailed: 'Probe failed',
    latencyAt: '{latency} ms · {time}',
    errorAt: '{error} · {time}',
    uptimeAt: '{uptime} uptime · {time}',
    poweredBy: 'Powered by Pulse',
    backStatus: 'Back to status page',
    loginTitle: 'Administrator sign in',
    username: 'Username',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    signingIn: 'Signing in',
    signIn: 'Sign in',
    addMonitor: 'Add monitor',
    editMonitor: 'Edit monitor',
    monitorName: 'Display name',
    monitorUrl: 'Website URL',
    monitorUrlHelp: 'Public HTTP/HTTPS websites on standard ports are supported.',
    interval: 'Check interval',
    everyMinute: 'Every minute',
    every5Minutes: 'Every 5 minutes',
    every10Minutes: 'Every 10 minutes',
    every30Minutes: 'Every 30 minutes',
    everyHour: 'Every hour',
    tags: 'Tags',
    tagsHelp: 'Separate with commas or new lines. Up to 10 tags, 24 characters each.',
    tagsPlaceholder: 'production, api, apac',
    tagInvalid: 'Tags may contain 1-24 letters, numbers, CJK characters, or ._-; maximum 10.',
    enableProbe: 'Enable checks',
    enableProbeHelp: 'Disabled monitors are hidden from the public page',
    settingsTitle: 'Settings',
    currentAccount: 'Current account',
    publicPage: 'Public page',
    pageTitle: 'Page title',
    saveTitle: 'Save title',
    changePassword: 'Change password',
    currentPassword: 'Current password',
    nextPassword: 'New password',
    passwordHelp: 'Use at least 12 characters and do not include your username.',
    updatePassword: 'Update password',
    telegram: 'Telegram notifications',
    telegramDescription: 'Send outage and recovery notifications through a Telegram bot.',
    telegramEnabled: 'Enable notifications',
    telegramEnabledHelp: 'After saving, new status changes are sent to this chat.',
    chatId: 'Chat ID',
    botToken: 'Bot Token',
    tokenConfiguredPlaceholder: 'Configured; leave blank to keep the current token',
    tokenNewPlaceholder: 'Enter the bot token',
    telegramConfigured: 'Bot and chat are configured',
    telegramNotConfigured: 'Configuration is incomplete',
    saveTelegram: 'Save Telegram',
    testTelegram: 'Send test message',
    testingTelegram: 'Testing',
    deleteMonitorTitle: 'Delete monitor',
    deleteMonitorText: 'Delete “{name}” and all of its history?',
    delete: 'Delete',
    deleting: 'Deleting',
    bulkDeleteTitle: 'Delete selected monitors',
    bulkDeleteText: 'Delete the selected {count} monitors and all of their history? This cannot be undone.',
    statusManagement: 'Status management',
    monitors: 'Monitors',
    noAdminMonitors: 'No monitors yet',
    addFirstMonitor: 'Add the first monitor',
    manageTools: 'Monitor filters and bulk actions',
    filterByTag: 'Filter by tag',
    allTags: 'All tags',
    untagged: 'Untagged',
    selectFiltered: 'Select filtered results',
    selectedCount: '{count} selected',
    bulkPause: 'Pause selected',
    bulkResume: 'Resume selected',
    bulkCheck: 'Check selected now',
    bulkDelete: 'Delete selected',
    noFilterResults: 'No monitors match this tag',
    clearFilter: 'Clear filter',
    reorderUnavailable: 'Reordering is unavailable while filtering. Clear the filter to drag or use the keyboard.',
    dragMonitor: 'Reorder {name}',
    dragDisabled: 'Clear the filter to reorder',
    selectMonitor: 'Select {name}',
    paused: 'Paused',
    checkMonitor: 'Check {name} now',
    checkNow: 'Check now',
    pauseMonitor: 'Pause {name}',
    resumeMonitor: 'Resume {name}',
    pause: 'Pause checks',
    resume: 'Resume checks',
    editMonitorNamed: 'Edit {name}',
    edit: 'Edit',
    deleteMonitorNamed: 'Delete {name}',
    monitorUpdated: 'Monitor updated',
    monitorAdded: 'Monitor added; running its first check',
    monitorPaused: 'Checks paused',
    monitorResumed: 'Checks resumed',
    probeComplete: 'Check complete',
    monitorDeleted: 'Monitor deleted',
    titleSaved: 'Page title saved',
    telegramSaved: 'Telegram settings saved',
    telegramTestSent: 'Test message sent',
    orderSaved: 'Monitor order saved',
    bulkPaused: '{count} monitors paused',
    bulkResumed: '{count} monitors resumed',
    bulkChecked: 'Queued checks for {count} monitors',
    bulkDeleted: '{count} monitors deleted',
  },
}

const EN_ERROR_MAP = new Map([
  ['用户名或密码错误', 'Invalid username or password.'],
  ['尝试次数过多，请稍后再试', 'Too many attempts. Please wait and try again.'],
  ['请求来源校验失败，请刷新页面后重试', 'The page security check failed. Refresh and try again.'],
  ['登录已失效，请重新登录', 'Your session expired. Please sign in again.'],
  ['安全令牌已失效，请刷新页面后重试', 'Your security token expired. Refresh and try again.'],
  ['名称需要 1-60 个字符', 'The name must be between 1 and 60 characters.'],
  ['请选择有效的探测间隔', 'Choose a valid check interval.'],
  ['每个监测站点最多设置 10 个标签', 'Each monitor can have up to 10 tags.'],
  ['标签需要 1-24 个中英文字符、数字或 ._-', 'Tags may contain 1-24 letters, numbers, CJK characters, or ._-'],
  ['监测站点不存在', 'That monitor no longer exists.'],
  ['请至少选择一个监测站点', 'Select at least one monitor.'],
  ['排序列表必须完整包含全部监测站点，且不能重复', 'The monitor order changed. Refresh and try again.'],
  ['页面标题需要 1-60 个字符', 'The page title must be between 1 and 60 characters.'],
  ['启用 Telegram 通知前请填写 Bot Token 和 Chat ID', 'Enter a Bot Token and Chat ID before enabling Telegram.'],
  ['请先配置 Telegram Bot Token 和 Chat ID', 'Configure a Telegram Bot Token and Chat ID first.'],
  ['Telegram 通知服务不可用', 'The Telegram notification service is unavailable.'],
  ['Telegram API 请求失败', 'Telegram rejected the request. Check the bot token and chat ID.'],
  ['Telegram API 请求超时', 'The Telegram request timed out. Try again.'],
  ['Telegram API 网络请求失败', 'Pulse could not reach Telegram. Try again.'],
  ['Telegram 测试消息发送失败', 'The Telegram test message could not be sent.'],
])

const STATUS_META = {
  up: { label: 'statusUp', overall: 'overallUp', Icon: CircleCheck },
  down: { label: 'statusDown', overall: 'overallDown', Icon: CircleX },
  unknown: { label: 'statusUnknown', overall: 'overallUnknown', Icon: CircleDashed },
}

const INTERVALS = [
  { value: 60, label: 'everyMinute' },
  { value: 300, label: 'every5Minutes' },
  { value: 600, label: 'every10Minutes' },
  { value: 1800, label: 'every30Minutes' },
  { value: 3600, label: 'everyHour' },
]

const PreferencesContext = createContext(null)

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(payload.error || '', response.status)
  return payload
}

function storedValue(key, fallback, allowed) {
  try {
    const value = window.localStorage.getItem(key)
    return allowed.includes(value) ? value : fallback
  } catch {
    return fallback
  }
}

function interpolate(message, values = {}) {
  return message.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}

function usePreferences() {
  return useContext(PreferencesContext)
}

function friendlyError(error, language, t) {
  const message = typeof error?.message === 'string' ? error.message.trim() : ''
  if (!message || /failed to fetch|networkerror|network request failed/i.test(message)) return t('requestFailed')
  if (language === 'zh') return message || t('requestFailed')
  if (EN_ERROR_MAP.has(message)) return EN_ERROR_MAP.get(message)
  return t('requestFailed')
}

function relativeTime(value, language, t) {
  if (!value) return t('neverChecked')
  const seconds = Math.max(0, Math.round((Date.now() - value) / 1000))
  if (seconds < 10) return t('justNow')
  const locale = language === 'zh' ? 'zh-CN' : 'en'
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
  if (seconds < 60) return formatter.format(-seconds, 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return formatter.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return formatter.format(-hours, 'hour')
  return formatter.format(-Math.floor(hours / 24), 'day')
}

function timeLabel(value, language, t) {
  if (!value) return t('noTime')
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function uptimeLabel(value) {
  if (value === null || value === undefined) return '--'
  return `${value.toFixed(value >= 99 ? 2 : 1)}%`
}

function parseTags(value) {
  const result = []
  const seen = new Set()
  for (const rawTag of value.split(/[,，\n]+/)) {
    const tag = rawTag.trim()
    if (!tag || seen.has(tag)) continue
    if (!/^[\p{Script=Han}A-Za-z0-9._-]{1,24}$/u.test(tag) || result.length >= 10) return null
    seen.add(tag)
    result.push(tag)
  }
  return result
}

function Brand({ admin = false }) {
  const { t } = usePreferences()
  return (
    <a className="brand" href={admin ? '/admin' : '/'} aria-label={t(admin ? 'brandAdminLabel' : 'brandPublicLabel')}>
      <Activity size={18} strokeWidth={2} aria-hidden="true" />
      <span>pulse</span>
      {admin && <small>{t('adminShort')}</small>}
    </a>
  )
}

function ThemeLanguageControls() {
  const { language, setLanguage, theme, setTheme, t } = usePreferences()
  const night = theme === 'night'
  return (
    <div className="preference-actions" aria-label={t('displayPreferences')}>
      <button
        className="icon-button"
        type="button"
        onClick={() => setTheme(night ? 'day' : 'night')}
        aria-label={t(night ? 'switchDay' : 'switchNight')}
        title={t(night ? 'switchDay' : 'switchNight')}
      >
        {night ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      </button>
      <button
        className="icon-button language-button"
        type="button"
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        aria-label={t(language === 'zh' ? 'switchEnglish' : 'switchChinese')}
        title={t(language === 'zh' ? 'switchEnglish' : 'switchChinese')}
      >
        <Languages size={17} aria-hidden="true" />
        <span>{language === 'zh' ? 'EN' : '中'}</span>
      </button>
    </div>
  )
}

function PublicViewControls() {
  const { columns, density, setColumns, setDensity, t } = usePreferences()
  return (
    <div className="public-view-toolbar" aria-label={t('displayPreferences')}>
      <div className="view-control-group" role="group" aria-label={t('timelineDensity')}>
        <button
          className="icon-button"
          type="button"
          aria-pressed={density === 'standard'}
          onClick={() => setDensity('standard')}
          aria-label={t('standardTimeline')}
          title={t('standardTimeline')}
        >
          <AlignJustify size={18} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-pressed={density === 'fine'}
          onClick={() => setDensity('fine')}
          aria-label={t('fineTimeline')}
          title={t('fineTimeline')}
        >
          <GripHorizontal size={18} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-pressed={density === 'continuous'}
          onClick={() => setDensity('continuous')}
          aria-label={t('continuousTimeline')}
          title={t('continuousTimeline')}
        >
          <Minus size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="view-control-group" role="group" aria-label={t('columnLayout')}>
        <button
          className="icon-button"
          type="button"
          aria-pressed={columns === 'single'}
          onClick={() => setColumns('single')}
          aria-label={t('singleColumn')}
          title={t('singleColumn')}
        >
          <List size={18} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-pressed={columns === 'double'}
          onClick={() => setColumns('double')}
          aria-label={t('doubleColumn')}
          title={t('doubleColumn')}
        >
          <Columns2 size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status = 'unknown' }) {
  const { t } = usePreferences()
  const meta = STATUS_META[status] || STATUS_META.unknown
  const Icon = meta.Icon
  return (
    <span className={`status-badge status-${status}`}>
      <Icon size={15} aria-hidden="true" />
      {t(meta.label)}
    </span>
  )
}

function Timeline({ history = [] }) {
  const { language, t } = usePreferences()
  const counts = history.reduce((result, bucket) => {
    const status = STATUS_META[bucket.status] ? bucket.status : 'unknown'
    result[status] += 1
    return result
  }, { up: 0, down: 0, unknown: 0 })
  const summary = t('historySummary', counts)

  return (
    <div className="timeline" role="img" aria-label={summary}>
      {history.map((bucket, index) => {
        const status = STATUS_META[bucket.status] ? bucket.status : 'unknown'
        return (
          <span
            className={`timeline-segment segment-${status}`}
            key={`${bucket.from}-${index}`}
            title={t('segmentLabel', {
              time: timeLabel(bucket.from, language, t),
              status: t(STATUS_META[status].label),
            })}
          />
        )
      })}
    </div>
  )
}

function PageLoader() {
  const { t } = usePreferences()
  return (
    <main className="page-loader" aria-label={t('loading')}>
      <LoaderCircle className="spin" size={24} aria-hidden="true" />
    </main>
  )
}

function monitorNote(monitor, language, t, admin = false) {
  const checked = relativeTime(monitor.lastCheckedAt, language, t)
  if (monitor.status === 'down') {
    return t('errorAt', { error: monitor.errorMessage || t('probeFailed'), time: checked })
  }
  if (monitor.status === 'unknown') return t('firstCheckPending')
  if (admin) return t('uptimeAt', { uptime: uptimeLabel(monitor.uptime), time: checked })
  return t('latencyAt', { latency: monitor.latencyMs ?? '--', time: checked })
}

function PublicPage() {
  const { columns, density, language, t } = usePreferences()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true)
    try {
      const next = await api('/api/public/status')
      setData(next)
      setError('')
    } catch (requestError) {
      setError(friendlyError(requestError, language, t))
    } finally {
      setRefreshing(false)
    }
  }, [language, t])

  useEffect(() => {
    load()
    const timer = setInterval(() => load(true), 30_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  useEffect(() => {
    document.title = `${data?.siteTitle || t('fallbackTitle')} · Pulse`
  }, [data?.siteTitle, t])

  const overall = data?.overall || 'unknown'
  const overallMeta = STATUS_META[overall] || STATUS_META.unknown
  const OverallIcon = overallMeta.Icon
  const monitors = data?.monitors || []

  return (
    <div className="public-page">
      <a className="skip-link" href="#status-content">{t('skipStatus')}</a>
      <header className="public-header shell">
        <Brand />
        <div className="header-utilities">
          <ThemeLanguageControls />
          <a className="icon-button quiet-button" href="/admin" aria-label={t('openAdmin')} title={t('openAdmin')}>
            <LockKeyhole size={17} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main className="public-main shell" id="status-content">
        <section className="status-intro" aria-labelledby="page-title">
          <p className={`overall-line status-${overall}`}>
            <OverallIcon size={18} aria-hidden="true" />
            {monitors.length ? t(overallMeta.overall) : t('noMonitors')}
          </p>
          <h1 id="page-title">{data?.siteTitle || t('fallbackTitle')}</h1>
          <p className="updated-at" aria-live="polite">
            {data
              ? t('updatedAt', { time: relativeTime(data.generatedAt, language, t) })
              : t('fetchingStatus')}
          </p>
        </section>

        {error && !data && (
          <section className="request-state" role="alert">
            <CircleX size={20} aria-hidden="true" />
            <p>{error}</p>
            <button className="text-button" type="button" onClick={() => load()} disabled={refreshing}>
              <RefreshCw className={refreshing ? 'spin' : ''} size={16} aria-hidden="true" />
              {t('retry')}
            </button>
          </section>
        )}

        {data && monitors.length === 0 && (
          <section className="empty-state">
            <span className="empty-line" aria-hidden="true" />
            <p>{t('noPublicStatus')}</p>
          </section>
        )}

        {monitors.length > 0 && (
          <section
            className={`monitor-list public-monitor-list layout-${columns} density-${density}`}
            aria-label={t('fallbackTitle')}
          >
            <div className="public-list-toolbar">
              <div className="list-caption" aria-hidden="true">
                <span>{t('service')}</span>
                <span>{t('last24Hours')}</span>
                <span>{t('uptime')}</span>
              </div>
              <PublicViewControls />
            </div>
            <div className="public-monitor-grid">
              {monitors.map((monitor) => (
                <article className="public-monitor-row" key={monitor.id}>
                  <div className="monitor-identity">
                    <h2>{monitor.name}</h2>
                    <StatusBadge status={monitor.status} />
                  </div>
                  <div className="timeline-wrap">
                    <Timeline history={monitor.history} />
                    <p className="monitor-note">{monitorNote(monitor, language, t)}</p>
                  </div>
                  <strong className="uptime-value">{uptimeLabel(monitor.uptime)}</strong>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="public-footer shell">
        <span>{t('poweredBy')}</span>
      </footer>
    </div>
  )
}

function LoginPage({ onLogin }) {
  const { language, t } = usePreferences()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const session = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      onLogin(session)
    } catch (requestError) {
      setError(friendlyError(requestError, language, t))
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    document.title = `${t('loginTitle')} · Pulse`
  }, [t])

  return (
    <main className="login-page">
      <div className="login-header">
        <Brand admin />
        <ThemeLanguageControls />
      </div>
      <section className="login-panel" aria-labelledby="login-title">
        <a className="back-link" href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          {t('backStatus')}
        </a>
        <h1 id="login-title">{t('loginTitle')}</h1>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="username">{t('username')}</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">{t('password')}</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className="field-icon-button"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={t(showPassword ? 'hidePassword' : 'showPassword')}
                title={t(showPassword ? 'hidePassword' : 'showPassword')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <p className="form-error" role="alert">{error}</p>
          <button className="primary-button login-button" type="submit" disabled={submitting}>
            {submitting ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
            {t(submitting ? 'signingIn' : 'signIn')}
          </button>
        </form>
      </section>
    </main>
  )
}

function Modal({ title, onClose, children, size = 'normal' }) {
  const { t } = usePreferences()
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      className={`modal modal-${size}`}
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-inner">
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label={t('close')} title={t('close')}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}

function MonitorEditor({ monitor, onClose, onSave }) {
  const { language, t } = usePreferences()
  const [values, setValues] = useState({
    name: monitor?.name || '',
    url: monitor?.url || '',
    intervalSeconds: monitor?.intervalSeconds || 300,
    enabled: monitor?.enabled ?? true,
  })
  const [tagsText, setTagsText] = useState((monitor?.tags || []).join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function change(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    const tags = parseTags(tagsText)
    if (!tags) {
      setError(t('tagInvalid'))
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({ ...values, tags })
      onClose()
    } catch (requestError) {
      setError(friendlyError(requestError, language, t))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={t(monitor ? 'editMonitor' : 'addMonitor')} onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="monitor-name">{t('monitorName')}</label>
          <input
            id="monitor-name"
            maxLength={60}
            required
            autoFocus
            value={values.name}
            onChange={(event) => change('name', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="monitor-url">{t('monitorUrl')}</label>
          <input
            id="monitor-url"
            type="url"
            inputMode="url"
            spellCheck="false"
            required
            value={values.url}
            onChange={(event) => change('url', event.target.value)}
          />
          <small>{t('monitorUrlHelp')}</small>
        </div>
        <div className="field">
          <label htmlFor="monitor-tags">{t('tags')}</label>
          <textarea
            id="monitor-tags"
            rows="2"
            value={tagsText}
            placeholder={t('tagsPlaceholder')}
            onChange={(event) => setTagsText(event.target.value)}
          />
          <small>{t('tagsHelp')}</small>
        </div>
        <div className="field">
          <label htmlFor="monitor-interval">{t('interval')}</label>
          <select
            id="monitor-interval"
            value={values.intervalSeconds}
            onChange={(event) => change('intervalSeconds', Number(event.target.value))}
          >
            {INTERVALS.map((interval) => (
              <option value={interval.value} key={interval.value}>{t(interval.label)}</option>
            ))}
          </select>
        </div>
        <label className="switch-row" htmlFor="monitor-enabled">
          <span>
            <strong>{t('enableProbe')}</strong>
            <small>{t('enableProbeHelp')}</small>
          </span>
          <input
            id="monitor-enabled"
            type="checkbox"
            checked={values.enabled}
            onChange={(event) => change('enabled', event.target.checked)}
          />
        </label>
        <p className="form-error" role="alert">{error}</p>
        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onClose}>{t('cancel')}</button>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}
            {t(saving ? 'saving' : 'save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function SettingsModal({
  data,
  username,
  onClose,
  onSaveTitle,
  onChangePassword,
  onSaveTelegram,
  onTestTelegram,
}) {
  const { language, t } = usePreferences()
  const initialTelegram = data.telegram || { enabled: false, configured: false, chatId: '' }
  const [siteTitle, setSiteTitle] = useState(data.siteTitle)
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [telegramEnabled, setTelegramEnabled] = useState(initialTelegram.enabled)
  const [telegramChatId, setTelegramChatId] = useState(initialTelegram.chatId || '')
  const [telegramToken, setTelegramToken] = useState('')
  const [telegramConfigured, setTelegramConfigured] = useState(initialTelegram.configured)
  const [titleBusy, setTitleBusy] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [telegramBusy, setTelegramBusy] = useState(false)
  const [telegramTesting, setTelegramTesting] = useState(false)
  const [titleError, setTitleError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [telegramError, setTelegramError] = useState('')

  async function saveTitle(event) {
    event.preventDefault()
    setTitleBusy(true)
    setTitleError('')
    try {
      await onSaveTitle(siteTitle)
    } catch (requestError) {
      setTitleError(friendlyError(requestError, language, t))
    } finally {
      setTitleBusy(false)
    }
  }

  async function changePassword(event) {
    event.preventDefault()
    setPasswordBusy(true)
    setPasswordError('')
    try {
      await onChangePassword({ currentPassword, nextPassword })
    } catch (requestError) {
      setPasswordError(friendlyError(requestError, language, t))
      setPasswordBusy(false)
    }
  }

  async function saveTelegram(event) {
    event.preventDefault()
    setTelegramBusy(true)
    setTelegramError('')
    try {
      const result = await onSaveTelegram({
        enabled: telegramEnabled,
        chatId: telegramChatId,
        ...(telegramToken.trim() ? { botToken: telegramToken.trim() } : {}),
      })
      setTelegramConfigured(result?.telegram?.configured ?? telegramConfigured)
      setTelegramToken('')
    } catch (requestError) {
      setTelegramError(friendlyError(requestError, language, t))
    } finally {
      setTelegramBusy(false)
    }
  }

  async function testTelegram() {
    setTelegramTesting(true)
    setTelegramError('')
    try {
      await onTestTelegram()
    } catch (requestError) {
      setTelegramError(friendlyError(requestError, language, t))
    } finally {
      setTelegramTesting(false)
    }
  }

  return (
    <Modal title={t('settingsTitle')} onClose={onClose} size="wide">
      <div className="settings-account">
        <span>{t('currentAccount')}</span>
        <strong>{username}</strong>
      </div>
      <form className="settings-section" onSubmit={saveTitle}>
        <h3>{t('publicPage')}</h3>
        <div className="field inline-field">
          <label htmlFor="site-title">{t('pageTitle')}</label>
          <input
            id="site-title"
            maxLength={60}
            required
            value={siteTitle}
            onChange={(event) => setSiteTitle(event.target.value)}
          />
        </div>
        <p className="form-error" role="alert">{titleError}</p>
        <div className="form-actions compact-actions">
          <button className="primary-button" type="submit" disabled={titleBusy}>
            {titleBusy ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}
            {t('saveTitle')}
          </button>
        </div>
      </form>

      <form className="settings-section" onSubmit={saveTelegram}>
        <div className="settings-heading-copy">
          <h3>{t('telegram')}</h3>
          <p>{t('telegramDescription')}</p>
        </div>
        <p className={`configuration-status status-${telegramConfigured ? 'up' : 'unknown'}`}>
          {telegramConfigured ? <CircleCheck size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}
          {t(telegramConfigured ? 'telegramConfigured' : 'telegramNotConfigured')}
        </p>
        <label className="switch-row" htmlFor="telegram-enabled">
          <span>
            <strong>{t('telegramEnabled')}</strong>
            <small>{t('telegramEnabledHelp')}</small>
          </span>
          <input
            id="telegram-enabled"
            type="checkbox"
            checked={telegramEnabled}
            onChange={(event) => setTelegramEnabled(event.target.checked)}
          />
        </label>
        <div className="settings-password-grid telegram-fields">
          <div className="field">
            <label htmlFor="telegram-chat-id">{t('chatId')}</label>
            <input
              id="telegram-chat-id"
              autoComplete="off"
              value={telegramChatId}
              onChange={(event) => setTelegramChatId(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="telegram-token">{t('botToken')}</label>
            <input
              id="telegram-token"
              type="password"
              autoComplete="new-password"
              value={telegramToken}
              placeholder={t(telegramConfigured ? 'tokenConfiguredPlaceholder' : 'tokenNewPlaceholder')}
              onChange={(event) => setTelegramToken(event.target.value)}
            />
          </div>
        </div>
        <p className="form-error" role="alert">{telegramError}</p>
        <div className="form-actions settings-split-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={testTelegram}
            disabled={!telegramConfigured || telegramTesting}
          >
            {telegramTesting ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />}
            {t(telegramTesting ? 'testingTelegram' : 'testTelegram')}
          </button>
          <button className="primary-button" type="submit" disabled={telegramBusy}>
            {telegramBusy ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}
            {t('saveTelegram')}
          </button>
        </div>
      </form>

      <form className="settings-section" onSubmit={changePassword}>
        <div className="settings-heading-row">
          <h3>{t('changePassword')}</h3>
          <button
            className="icon-button"
            type="button"
            onClick={() => setShowPasswords((visible) => !visible)}
            aria-label={t(showPasswords ? 'hidePassword' : 'showPassword')}
            title={t(showPasswords ? 'hidePassword' : 'showPassword')}
          >
            {showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <div className="settings-password-grid">
          <div className="field">
            <label htmlFor="current-password">{t('currentPassword')}</label>
            <input
              id="current-password"
              type={showPasswords ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="next-password">{t('nextPassword')}</label>
            <input
              id="next-password"
              type={showPasswords ? 'text' : 'password'}
              autoComplete="new-password"
              minLength={12}
              required
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
            />
            <small>{t('passwordHelp')}</small>
          </div>
        </div>
        <p className="form-error" role="alert">{passwordError}</p>
        <div className="form-actions compact-actions">
          <button className="primary-button" type="submit" disabled={passwordBusy}>
            {passwordBusy ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={17} />}
            {t('updatePassword')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ConfirmationDialog({ title, text, onClose, onConfirm }) {
  const { language, t } = usePreferences()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function confirm() {
    setDeleting(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (requestError) {
      setError(friendlyError(requestError, language, t))
      setDeleting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="confirm-body">
        <p>{text}</p>
        <p className="form-error" role="alert">{error}</p>
        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onClose}>{t('cancel')}</button>
          <button className="danger-button" type="button" onClick={confirm} disabled={deleting}>
            {deleting ? <LoaderCircle className="spin" size={17} /> : <Trash2 size={17} />}
            {t(deleting ? 'deleting' : 'delete')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function SelectAllControl({ checked, indeterminate, onChange }) {
  const { t } = usePreferences()
  const inputRef = useRef(null)
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <label className="selection-control">
      <input ref={inputRef} type="checkbox" checked={checked} onChange={onChange} />
      <span>{t('selectFiltered')}</span>
    </label>
  )
}

function SortableMonitorRow({
  monitor,
  dragDisabled,
  selected,
  onSelect,
  onCheck,
  onToggle,
  onEdit,
  onDelete,
  checking,
}) {
  const { language, t } = usePreferences()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: monitor.id,
    disabled: dragDisabled,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const dragTitle = t(dragDisabled ? 'dragDisabled' : 'dragMonitor', { name: monitor.name })

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`admin-monitor-row ${monitor.enabled ? '' : 'is-disabled'} ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="row-order-controls">
        <label className="row-checkbox" title={t('selectMonitor', { name: monitor.name })}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelect(monitor.id, event.target.checked)}
            aria-label={t('selectMonitor', { name: monitor.name })}
          />
        </label>
        <span className="drag-handle-wrap" title={dragTitle}>
          <button
            className="icon-button drag-handle"
            type="button"
            disabled={dragDisabled}
            aria-label={dragTitle}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} aria-hidden="true" />
          </button>
        </span>
      </div>
      <div className="admin-monitor-main">
        <div className="admin-monitor-name-row">
          <h2>{monitor.name}</h2>
          {monitor.enabled ? <StatusBadge status={monitor.status} /> : <span className="paused-label">{t('paused')}</span>}
        </div>
        <p className="monitor-url" title={monitor.url}>{monitor.url}</p>
        {(monitor.tags || []).length > 0 && (
          <div className="monitor-tags" aria-label={t('tags')}>
            {monitor.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        )}
      </div>
      <div className="admin-timeline">
        <Timeline history={monitor.history} />
        <p>{monitorNote(monitor, language, t, true)}</p>
      </div>
      <div className="monitor-actions">
        <button
          className="icon-button"
          type="button"
          onClick={() => onCheck(monitor)}
          disabled={checking}
          aria-label={t('checkMonitor', { name: monitor.name })}
          title={t('checkNow')}
        >
          <RefreshCw className={checking ? 'spin' : ''} size={17} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={() => onToggle(monitor)}
          aria-label={t(monitor.enabled ? 'pauseMonitor' : 'resumeMonitor', { name: monitor.name })}
          title={t(monitor.enabled ? 'pause' : 'resume')}
        >
          {monitor.enabled ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={() => onEdit(monitor)}
          aria-label={t('editMonitorNamed', { name: monitor.name })}
          title={t('edit')}
        >
          <Pencil size={17} aria-hidden="true" />
        </button>
        <button
          className="icon-button danger-icon-button"
          type="button"
          onClick={() => onDelete(monitor)}
          aria-label={t('deleteMonitorNamed', { name: monitor.name })}
          title={t('delete')}
        >
          <Trash2 size={17} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

function AdminPage({ session, onLogout }) {
  const { language, t } = usePreferences()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [checkingId, setCheckingId] = useState('')
  const [bulkBusy, setBulkBusy] = useState('')
  const [tagFilter, setTagFilter] = useState('__all__')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [toast, setToast] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const adminApi = useCallback(async (path, options = {}) => {
    try {
      return await api(path, {
        ...options,
        headers: {
          ...options.headers,
          ...(options.method && options.method !== 'GET' ? { 'X-CSRF-Token': session.csrfToken } : {}),
        },
      })
    } catch (requestError) {
      if (requestError.status === 401) onLogout()
      throw requestError
    }
  }, [onLogout, session.csrfToken])

  const load = useCallback(async (quiet = false) => {
    try {
      const next = await adminApi('/api/admin/status')
      setData(next)
      setSelectedIds((current) => new Set([...current].filter((id) => next.monitors.some((monitor) => monitor.id === id))))
      if (!quiet) setError('')
    } catch (requestError) {
      if (!quiet) setError(friendlyError(requestError, language, t))
    }
  }, [adminApi, language, t])

  useEffect(() => {
    document.title = `${t('monitors')} · Pulse`
    load()
    const timer = setInterval(() => load(true), 20_000)
    return () => clearInterval(timer)
  }, [load, t])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [tagFilter])

  const allTags = useMemo(() => {
    const tags = new Set()
    for (const monitor of data?.monitors || []) {
      for (const tag of monitor.tags || []) tags.add(tag)
    }
    return [...tags].sort((a, b) => a.localeCompare(b, language === 'zh' ? 'zh-CN' : 'en'))
  }, [data?.monitors, language])

  const filteredMonitors = useMemo(() => {
    const monitors = data?.monitors || []
    if (tagFilter === '__all__') return monitors
    if (tagFilter === '__untagged__') return monitors.filter((monitor) => !(monitor.tags || []).length)
    return monitors.filter((monitor) => (monitor.tags || []).includes(tagFilter))
  }, [data?.monitors, tagFilter])

  const selectedInOrder = (data?.monitors || []).filter((monitor) => selectedIds.has(monitor.id)).map((monitor) => monitor.id)
  const allFilteredSelected = filteredMonitors.length > 0 && filteredMonitors.every((monitor) => selectedIds.has(monitor.id))
  const someFilteredSelected = filteredMonitors.some((monitor) => selectedIds.has(monitor.id)) && !allFilteredSelected
  const dragDisabled = tagFilter !== '__all__'

  function toggleSelection(id, checked) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAllFiltered() {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allFilteredSelected) filteredMonitors.forEach((monitor) => next.delete(monitor.id))
      else filteredMonitors.forEach((monitor) => next.add(monitor.id))
      return next
    })
  }

  async function saveMonitor(values) {
    const path = editor?.monitor ? `/api/admin/monitors/${editor.monitor.id}` : '/api/admin/monitors'
    await adminApi(path, {
      method: editor?.monitor ? 'PUT' : 'POST',
      body: JSON.stringify(values),
    })
    await load(true)
    setToast(t(editor?.monitor ? 'monitorUpdated' : 'monitorAdded'))
    if (!editor?.monitor) setTimeout(() => load(true), 1200)
  }

  async function toggleMonitor(monitor) {
    try {
      await adminApi(`/api/admin/monitors/${monitor.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: monitor.name,
          url: monitor.url,
          intervalSeconds: monitor.intervalSeconds,
          enabled: !monitor.enabled,
          tags: monitor.tags || [],
        }),
      })
      await load(true)
      setToast(t(monitor.enabled ? 'monitorPaused' : 'monitorResumed'))
    } catch (requestError) {
      setToast(friendlyError(requestError, language, t))
    }
  }

  async function checkMonitor(monitor) {
    setCheckingId(monitor.id)
    try {
      await adminApi(`/api/admin/monitors/${monitor.id}/check`, { method: 'POST' })
      await load(true)
      setToast(t('probeComplete'))
    } catch (requestError) {
      setToast(friendlyError(requestError, language, t))
    } finally {
      setCheckingId('')
    }
  }

  async function deleteMonitor() {
    await adminApi(`/api/admin/monitors/${deleteTarget.id}`, { method: 'DELETE' })
    await load(true)
    setToast(t('monitorDeleted'))
  }

  async function runBulk(action) {
    if (!selectedInOrder.length) return
    setBulkBusy(action)
    try {
      const result = await adminApi('/api/admin/monitors/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedInOrder, action }),
      })
      const count = action === 'check' ? (result?.queued ?? selectedInOrder.length) : selectedInOrder.length
      await load(true)
      setSelectedIds(new Set())
      setToast(t({ pause: 'bulkPaused', resume: 'bulkResumed', check: 'bulkChecked', delete: 'bulkDeleted' }[action], { count }))
    } catch (requestError) {
      setToast(friendlyError(requestError, language, t))
      throw requestError
    } finally {
      setBulkBusy('')
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id || dragDisabled || !data) return
    const oldIndex = data.monitors.findIndex((monitor) => monitor.id === active.id)
    const newIndex = data.monitors.findIndex((monitor) => monitor.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const previous = data.monitors
    const reordered = arrayMove(previous, oldIndex, newIndex)
    setData((current) => ({ ...current, monitors: reordered }))
    try {
      await adminApi('/api/admin/monitors/order', {
        method: 'PUT',
        body: JSON.stringify({ ids: reordered.map((monitor) => monitor.id) }),
      })
      await load(true)
      setToast(t('orderSaved'))
    } catch (requestError) {
      setData((current) => ({ ...current, monitors: previous }))
      setToast(friendlyError(requestError, language, t))
    }
  }

  async function saveTitle(siteTitle) {
    await adminApi('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ siteTitle }) })
    await load(true)
    setToast(t('titleSaved'))
  }

  async function saveTelegram(values) {
    const result = await adminApi('/api/admin/telegram', { method: 'PUT', body: JSON.stringify(values) })
    await load(true)
    setToast(t('telegramSaved'))
    return result
  }

  async function testTelegram() {
    await adminApi('/api/admin/telegram/test', { method: 'POST' })
    setToast(t('telegramTestSent'))
  }

  async function changePassword(values) {
    await adminApi('/api/admin/password', { method: 'POST', body: JSON.stringify(values) })
    onLogout()
  }

  async function logout() {
    try {
      await adminApi('/api/auth/logout', { method: 'POST' })
    } finally {
      onLogout()
    }
  }

  if (!data && !error) return <PageLoader />

  return (
    <div className="admin-page">
      <a className="skip-link" href="#admin-content">{t('skipAdmin')}</a>
      <header className="admin-header">
        <div className="admin-shell admin-header-inner">
          <Brand admin />
          <div className="admin-header-actions">
            <ThemeLanguageControls />
            <a className="icon-button" href="/" aria-label={t('viewPublic')} title={t('viewPublic')}>
              <Activity size={18} aria-hidden="true" />
            </a>
            <button className="icon-button" type="button" onClick={() => setSettingsOpen(true)} aria-label={t('settings')} title={t('settings')}>
              <Settings2 size={18} aria-hidden="true" />
            </button>
            <button className="icon-button" type="button" onClick={logout} aria-label={t('logout')} title={t('logout')}>
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main admin-shell" id="admin-content">
        <div className="admin-title-row">
          <div>
            <p>{t('statusManagement')}</p>
            <h1>{t('monitors')}</h1>
          </div>
          <button className="primary-button" type="button" onClick={() => setEditor({ monitor: null })}>
            <Plus size={18} aria-hidden="true" />
            <span>{t('addMonitor')}</span>
          </button>
        </div>

        {error && (
          <section className="request-state compact-request-state" role="alert">
            <CircleX size={20} aria-hidden="true" />
            <p>{error}</p>
            <button className="text-button" type="button" onClick={() => load()}>
              <RefreshCw size={16} aria-hidden="true" />
              {t('retry')}
            </button>
          </section>
        )}

        {data && data.monitors.length === 0 && (
          <section className="admin-empty">
            <span className="empty-line" aria-hidden="true" />
            <h2>{t('noAdminMonitors')}</h2>
            <button className="text-button" type="button" onClick={() => setEditor({ monitor: null })}>
              <Plus size={16} aria-hidden="true" />
              {t('addFirstMonitor')}
            </button>
          </section>
        )}

        {data?.monitors.length > 0 && (
          <>
            <section className="admin-tools" aria-label={t('manageTools')}>
              <div className="tag-filter field">
                <label htmlFor="tag-filter"><Tag size={16} aria-hidden="true" />{t('filterByTag')}</label>
                <select id="tag-filter" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                  <option value="__all__">{t('allTags')}</option>
                  <option value="__untagged__">{t('untagged')}</option>
                  {allTags.map((tag) => <option value={tag} key={tag}>{tag}</option>)}
                </select>
              </div>
              <div className="bulk-selection">
                <SelectAllControl
                  checked={allFilteredSelected}
                  indeterminate={someFilteredSelected}
                  onChange={toggleAllFiltered}
                />
                <span className="selection-count" aria-live="polite">{t('selectedCount', { count: selectedIds.size })}</span>
              </div>
              <div className="bulk-actions">
                <button className="secondary-button" type="button" disabled={!selectedIds.size || bulkBusy} onClick={() => runBulk('pause')}>
                  <Pause size={16} aria-hidden="true" />{t('bulkPause')}
                </button>
                <button className="secondary-button" type="button" disabled={!selectedIds.size || bulkBusy} onClick={() => runBulk('resume')}>
                  <Play size={16} aria-hidden="true" />{t('bulkResume')}
                </button>
                <button className="secondary-button" type="button" disabled={!selectedIds.size || bulkBusy} onClick={() => runBulk('check')}>
                  {bulkBusy === 'check' ? <LoaderCircle className="spin" size={16} /> : <RefreshCw size={16} aria-hidden="true" />}
                  {t('bulkCheck')}
                </button>
                <button className="secondary-button danger-secondary-button" type="button" disabled={!selectedIds.size || bulkBusy} onClick={() => setBulkDeleteOpen(true)}>
                  <Trash2 size={16} aria-hidden="true" />{t('bulkDelete')}
                </button>
              </div>
              {dragDisabled && (
                <p className="reorder-note"><GripVertical size={16} aria-hidden="true" />{t('reorderUnavailable')}</p>
              )}
            </section>

            {filteredMonitors.length === 0 ? (
              <section className="admin-empty filter-empty">
                <h2>{t('noFilterResults')}</h2>
                <button className="text-button" type="button" onClick={() => setTagFilter('__all__')}>{t('clearFilter')}</button>
              </section>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredMonitors.map((monitor) => monitor.id)} strategy={verticalListSortingStrategy}>
                  <section className="admin-monitor-list" aria-label={t('monitors')}>
                    {filteredMonitors.map((monitor) => (
                      <SortableMonitorRow
                        key={monitor.id}
                        monitor={monitor}
                        dragDisabled={dragDisabled}
                        selected={selectedIds.has(monitor.id)}
                        onSelect={toggleSelection}
                        onCheck={checkMonitor}
                        onToggle={toggleMonitor}
                        onEdit={(target) => setEditor({ monitor: target })}
                        onDelete={setDeleteTarget}
                        checking={checkingId === monitor.id}
                      />
                    ))}
                  </section>
                </SortableContext>
              </DndContext>
            )}
          </>
        )}
      </main>

      <div className="toast" aria-live="polite" aria-atomic="true">{toast}</div>

      {editor && (
        <MonitorEditor monitor={editor.monitor} onClose={() => setEditor(null)} onSave={saveMonitor} />
      )}
      {settingsOpen && data && (
        <SettingsModal
          data={data}
          username={session.username}
          onClose={() => setSettingsOpen(false)}
          onSaveTitle={saveTitle}
          onChangePassword={changePassword}
          onSaveTelegram={saveTelegram}
          onTestTelegram={testTelegram}
        />
      )}
      {deleteTarget && (
        <ConfirmationDialog
          title={t('deleteMonitorTitle')}
          text={t('deleteMonitorText', { name: deleteTarget.name })}
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteMonitor}
        />
      )}
      {bulkDeleteOpen && (
        <ConfirmationDialog
          title={t('bulkDeleteTitle')}
          text={t('bulkDeleteText', { count: selectedIds.size })}
          onClose={() => setBulkDeleteOpen(false)}
          onConfirm={() => runBulk('delete')}
        />
      )}
    </div>
  )
}

function AdminGateway() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    api('/api/auth/session')
      .then((result) => setSession(result.authenticated ? result : null))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (!session) return <LoginPage onLogin={setSession} />
  return <AdminPage session={session} onLogout={() => setSession(null)} />
}

export default function App() {
  const [theme, setTheme] = useState(() => storedValue('pulse-theme', 'day', ['day', 'night']))
  const [language, setLanguage] = useState(() => storedValue('pulse-language', 'zh', ['zh', 'en']))
  const [density, setDensity] = useState(() => storedValue('pulse-timeline-density', 'standard', ['standard', 'fine', 'continuous']))
  const [columns, setColumns] = useState(() => storedValue('pulse-public-columns', 'single', ['single', 'double']))

  const t = useCallback((key, values) => {
    const message = MESSAGES[language][key] || MESSAGES.zh[key] || key
    return interpolate(message, values)
  }, [language])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#191714' : '#f7f5f0')
    try { window.localStorage.setItem('pulse-theme', theme) } catch { /* Preference storage is optional. */ }
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    try { window.localStorage.setItem('pulse-language', language) } catch { /* Preference storage is optional. */ }
  }, [language])

  useEffect(() => {
    try { window.localStorage.setItem('pulse-timeline-density', density) } catch { /* Preference storage is optional. */ }
  }, [density])

  useEffect(() => {
    try { window.localStorage.setItem('pulse-public-columns', columns) } catch { /* Preference storage is optional. */ }
  }, [columns])

  const preferences = useMemo(() => ({
    columns,
    density,
    language,
    setColumns,
    setDensity,
    setLanguage,
    setTheme,
    t,
    theme,
  }), [columns, density, language, t, theme])

  return (
    <PreferencesContext.Provider value={preferences}>
      {window.location.pathname.startsWith('/admin') ? <AdminGateway /> : <PublicPage />}
    </PreferencesContext.Provider>
  )
}
