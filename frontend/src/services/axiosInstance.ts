import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.defaults.headers.common['Accept'] = 'application/json'

export default apiClient
