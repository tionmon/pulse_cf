CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT OR IGNORE INTO settings(key, value) VALUES
  ('site_title', '服务状态'),
  ('telegram_enabled', '0'),
  ('telegram_token', ''),
  ('telegram_chat_id', '');

CREATE TABLE IF NOT EXISTS monitors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  interval_seconds INTEGER NOT NULL,
  timeout_ms INTEGER NOT NULL DEFAULT 10000,
  enabled INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  next_check_at INTEGER NOT NULL,
  last_checked_at INTEGER,
  status TEXT NOT NULL DEFAULT 'unknown',
  http_status INTEGER,
  latency_ms INTEGER,
  error_code TEXT,
  error_message TEXT
);
CREATE INDEX IF NOT EXISTS monitors_due_idx ON monitors(enabled, next_check_at);

CREATE TABLE IF NOT EXISTS checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  monitor_id TEXT NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  checked_at INTEGER NOT NULL,
  status TEXT NOT NULL,
  http_status INTEGER,
  latency_ms INTEGER,
  error_code TEXT,
  error_message TEXT
);
CREATE INDEX IF NOT EXISTS checks_monitor_time_idx ON checks(monitor_id, checked_at);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  csrf_hash TEXT NOT NULL,
  username TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_started INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);
