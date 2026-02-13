export const API_ENDPOINTS = {
  SITES: {
    BASE: '/sites/',
    DETAILS: (id: number) => `/sites/${id}/`,
  },
  STATISTICS: {
    BASE: '/sites/statistics/',
  },
  ENDPOINTS: {
    BASE: '/sites/export/'
  },
}
