import { ref } from 'vue'
import JSZip from 'jszip'
import type { LogFile, LogArea } from '@/types'

export function useZipExtractor() {
  const isExtracting = ref(false)
  const error = ref<string | null>(null)
  const logFiles = ref<LogFile[]>([])

  function classifyArea(path: string): LogArea | null {
    if (path.startsWith('CmdPal/PowerToysExtension/')) return 'PowerToysExtension'
    if (path.startsWith('CmdPal/ModuleInterface/')) return 'ModuleInterface'
    if (path.startsWith('CmdPal/Logs/')) return 'CmdPal'
    return null
  }

  function extractMetadata(path: string, _area: LogArea): { version: string; date: string } {
    const parts = path.split('/')
    // Pattern: CmdPal/{area}/Logs/{version}/{filename}.log
    // or: CmdPal/Logs/{version}/{filename}.log
    let version = 'unknown'
    let date = 'unknown'

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'Logs' && i + 1 < parts.length) {
        version = parts[i + 1]
        if (i + 2 < parts.length) {
          const filename = parts[i + 2]
          const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
          if (dateMatch) date = dateMatch[1]
        }
        break
      }
    }

    return { version, date }
  }

  async function extractZip(file: File): Promise<LogFile[]> {
    isExtracting.value = true
    error.value = null
    logFiles.value = []

    try {
      const zip = await JSZip.loadAsync(file)
      const results: LogFile[] = []

      const logEntries = Object.entries(zip.files).filter(([path, entry]) => {
        return !entry.dir && path.startsWith('CmdPal/') && path.endsWith('.log')
      })

      for (const [path, entry] of logEntries) {
        const area = classifyArea(path)
        if (!area) continue

        const content = await entry.async('string')
        const { version, date } = extractMetadata(path, area)

        results.push({ path, area, version, date, content })
      }

      logFiles.value = results
      return results
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to extract zip file'
      return []
    } finally {
      isExtracting.value = false
    }
  }

  return {
    isExtracting,
    error,
    logFiles,
    extractZip,
  }
}
