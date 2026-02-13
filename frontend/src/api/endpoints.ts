export const API_ENDPOINTS = {
  SITES: {
    BASE: '/sites/',
    DETAILS: (id: number) => `/sites/${id}/`,
  },
  STATISTICS: {
    BASE: '/sites/statistics/',
  },
  EXPORT: {
    BASE: '/sites/export/',
  },
  ANALYZE: {
    BASE: '/sites/analyze/',
  },
}
