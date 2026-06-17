import type { LogEntry, LogLevel, LogFile } from '@/types'

// Main/Extension format: [HH:mm:ss.ticks] [Level] SourceFile::Method::Line
const MAIN_LOG_PATTERN = /^\[(\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]\s+\[(error|warning|info|trace)\]\s+(.+?)::(.+?)::(\d+)\s*$/i

// ModuleInterface format: [YYYY-MM-DD HH:mm:ss.ffffff] [p-PID] [t-TID] [level] message
const MODULE_LOG_PATTERN = /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+)\]\s+\[p-\d+\]\s+\[t-\d+\]\s+\[(error|warning|info|trace)\]\s+(.+)$/i

// Generic fallback for other module log lines that still follow a timestamp + level + message structure.
const GENERIC_LOG_PATTERN = /^\[(\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]\s+\[(error|warning|info|trace)\]\s+(.*)$/i

function normalizeLevel(level: string): LogLevel {
  const l = level.toLowerCase()
  if (l === 'error') return 'Error'
  if (l === 'warning') return 'Warning'
  if (l === 'trace') return 'Trace'
  return 'Info'
}

export function useLogParser() {
  function parseLogFile(logFile: LogFile): LogEntry[] {
    const lines = logFile.content.split('\n')
    const entries: LogEntry[] = []
    let currentEntry: LogEntry | null = null

    for (const line of lines) {
      const trimmed = line.trimEnd()
      if (!trimmed) continue

      const mainMatch = trimmed.match(MAIN_LOG_PATTERN)
      if (mainMatch) {
        if (currentEntry) entries.push(currentEntry)
        currentEntry = {
          timestamp: mainMatch[1],
          level: normalizeLevel(mainMatch[2]),
          sourceFile: mainMatch[3],
          method: mainMatch[4],
          lineNumber: parseInt(mainMatch[5], 10),
          message: '',
          fullText: trimmed,
          logArea: logFile.area,
          logDate: '',
          sortKey: '',
        }
        continue
      }

      const moduleMatch = trimmed.match(MODULE_LOG_PATTERN)
      if (moduleMatch) {
        if (currentEntry) entries.push(currentEntry)
        currentEntry = {
          timestamp: moduleMatch[1],
          level: normalizeLevel(moduleMatch[2]),
          sourceFile: '',
          method: '',
          lineNumber: null,
          message: moduleMatch[3],
          fullText: trimmed,
          logArea: logFile.area,
          logDate: '',
          sortKey: '',
        }
        continue
      }

      const fallbackMatch = trimmed.match(GENERIC_LOG_PATTERN)
      if (fallbackMatch) {
        if (currentEntry) entries.push(currentEntry)
        currentEntry = {
          timestamp: fallbackMatch[1],
          level: normalizeLevel(fallbackMatch[2]),
          sourceFile: '',
          method: '',
          lineNumber: null,
          message: fallbackMatch[3],
          fullText: trimmed,
          logArea: logFile.area,
          logDate: '',
          sortKey: '',
        }
        continue
      }

      if (currentEntry) {
        const continuation = trimmed.startsWith('    ') ? trimmed.slice(4) : trimmed
        if (!currentEntry.message) {
          currentEntry.message = continuation
        } else {
          currentEntry.message += '\n' + continuation
        }
        currentEntry.fullText += '\n' + trimmed
      }
    }

    if (currentEntry) entries.push(currentEntry)
    return entries
  }

  return { parseLogFile }
}
