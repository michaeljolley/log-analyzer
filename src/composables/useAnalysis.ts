import type { LogEntry, LogFile, LogIssue, LogArea, AnalysisResult, AnalysisSummary } from '@/types'
import { useLogParser } from './useLogParser'

export function useAnalysis() {
  const { parseLogFile } = useLogParser()

  function generateIssueKey(entry: LogEntry, area: LogArea): string {
    return `${area}::${entry.level}::${entry.sourceFile}::${entry.method}::${entry.message.slice(0, 100)}`
  }

  function analyze(logFiles: LogFile[]): AnalysisResult {
    const issueMap = new Map<string, LogIssue>()
    const allIssueEntries: LogEntry[] = []
    let totalEntries = 0
    let issueIdCounter = 0

    const summary: AnalysisSummary = {
      totalEntries: 0,
      errorCount: 0,
      warningCount: 0,
      exceptionCount: 0,
      byArea: {},
      bySourceFile: {},
    }

    for (const logFile of logFiles) {
      const entries = parseLogFile(logFile)
      totalEntries += entries.length

      for (const entry of entries) {
        entry.logArea = logFile.area
        entry.logDate = logFile.date
        entry.sortKey = `${logFile.date}T${entry.timestamp}`

        if (entry.level !== 'Error' && entry.level !== 'Warning') continue

        if (!summary.byArea[logFile.area]) {
          summary.byArea[logFile.area] = { errors: 0, warnings: 0 }
        }

        allIssueEntries.push(entry)

        if (entry.level === 'Error') {
          summary.errorCount++
          summary.byArea[logFile.area].errors++
        } else {
          summary.warningCount++
          summary.byArea[logFile.area].warnings++
        }

        if (entry.message.toLowerCase().includes('exception')) {
          summary.exceptionCount++
        }

        if (entry.sourceFile) {
          if (!summary.bySourceFile[entry.sourceFile]) {
            summary.bySourceFile[entry.sourceFile] = { errors: 0, warnings: 0 }
          }
          if (entry.level === 'Error') {
            summary.bySourceFile[entry.sourceFile].errors++
          } else {
            summary.bySourceFile[entry.sourceFile].warnings++
          }
        }

        const key = generateIssueKey(entry, logFile.area)
        const existing = issueMap.get(key)
        if (existing) {
          existing.occurrences++
          existing.entries.push(entry)
        } else {
          issueIdCounter++
          issueMap.set(key, {
            id: `issue-${issueIdCounter}`,
            level: entry.level,
            sourceFile: entry.sourceFile,
            method: entry.method,
            message: entry.message,
            occurrences: 1,
            entries: [entry],
            logArea: logFile.area,
          })
        }
      }
    }

    summary.totalEntries = totalEntries

    const issues = Array.from(issueMap.values()).sort((a, b) => {
      if (a.level !== b.level) return a.level === 'Error' ? -1 : 1
      return b.occurrences - a.occurrences
    })

    allIssueEntries.sort((a, b) => b.sortKey.localeCompare(a.sortKey))

    return { files: logFiles, issues, entries: allIssueEntries, summary }
  }

  return { analyze }
}
