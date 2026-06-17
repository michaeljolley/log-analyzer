import { ref } from 'vue'
import JSZip from 'jszip'
import type { LogFile, LogArea } from '@/types'

export function useZipExtractor() {
  const isExtracting = ref(false)
  const error = ref<string | null>(null)
  const logFiles = ref<LogFile[]>([])
  const modules = ref<string[]>([])

  function classifyModule(path: string): LogArea | null {
    const [moduleName] = path.split('/')
    return moduleName && moduleName.trim() ? moduleName : null
  }

  function extractMetadata(path: string): { version: string; date: string } {
    const parts = path.split('/')
    const logsIndex = parts.findIndex((part) => part === 'Logs')

    let version = 'unknown'
    let date = 'unknown'

    if (logsIndex >= 0 && logsIndex + 1 < parts.length) {
      version = parts[logsIndex + 1]
      const filename = parts[logsIndex + 2] ?? ''
      const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) date = dateMatch[1]
    }

    return { version, date }
  }

  async function extractZip(file: File): Promise<{ files: LogFile[]; modules: string[] }> {
    isExtracting.value = true
    error.value = null
    logFiles.value = []
    modules.value = []

    try {
      const zip = await JSZip.loadAsync(file)
      const results: LogFile[] = []

      const logEntries = Object.entries(zip.files).filter(([path, entry]) => {
        return !entry.dir && path.endsWith('.log')
      })

      for (const [path, entry] of logEntries) {
        const area = classifyModule(path)
        if (!area) continue

        const content = await entry.async('string')
        const { version, date } = extractMetadata(path)

        results.push({ path, area, version, date, content })
      }

      const discoveredModules = [...new Set(results.map((item) => item.area))].sort((a, b) => a.localeCompare(b))
      logFiles.value = results
      modules.value = discoveredModules

      return { files: results, modules: discoveredModules }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to extract zip file'
      return { files: [], modules: [] }
    } finally {
      isExtracting.value = false
    }
  }

  return {
    isExtracting,
    error,
    logFiles,
    modules,
    extractZip,
  }
}
