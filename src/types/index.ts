export type LogLevel = 'Error' | 'Warning' | 'Info' | 'Trace'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  sourceFile: string
  method: string
  lineNumber: number | null
  message: string
  fullText: string
  logArea: LogArea
  logDate: string
  sortKey: string
}

export interface LogIssue {
  id: string
  level: LogLevel
  sourceFile: string
  method: string
  message: string
  occurrences: number
  entries: LogEntry[]
  logArea: LogArea
}

export type LogArea = string

export interface LogFile {
  path: string
  area: LogArea
  version: string
  date: string
  content: string
}

export interface AnalysisResult {
  files: LogFile[]
  issues: LogIssue[]
  entries: LogEntry[]
  summary: AnalysisSummary
}

export interface AnalysisSummary {
  totalEntries: number
  errorCount: number
  warningCount: number
  exceptionCount: number
  byArea: Record<string, { errors: number; warnings: number }>
  bySourceFile: Record<string, { errors: number; warnings: number }>
}
