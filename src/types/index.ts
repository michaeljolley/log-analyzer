export type LogLevel = 'Error' | 'Warning' | 'Info' | 'Trace'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  sourceFile: string
  method: string
  lineNumber: number | null
  message: string
  fullText: string
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

export type LogArea = 'CmdPal' | 'ModuleInterface' | 'PowerToysExtension'

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
  summary: AnalysisSummary
}

export interface AnalysisSummary {
  totalEntries: number
  errorCount: number
  warningCount: number
  exceptionCount: number
  byArea: Record<LogArea, { errors: number; warnings: number }>
  bySourceFile: Record<string, { errors: number; warnings: number }>
}
