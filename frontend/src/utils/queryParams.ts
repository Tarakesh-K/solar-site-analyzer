export function queryParamsBuilder<T extends Record<string, unknown>>(filters: T): string {
  const parts: string[] = []

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return

    // Handle rangeExactFilter separately
    if (key === 'rangeExactFilter' && Array.isArray(value)) {
      value.forEach((range) => {
        const rangeSegments: string[] = []

        Object.entries(range as Record<string, unknown>).forEach(([k, v]) => {
          if (v !== null && v !== undefined && k !== 'mode') {
            rangeSegments.push(`${k}:${v}`)
          }
        })

        if (rangeSegments.length > 0) {
          parts.push(`q=${rangeSegments.join(',')}`)
        }
      })
      return
    }

    // Everything else -> normal key=value
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  })

  // Just join with & — DO NOT add leading /?
  return parts.join('&')
}
