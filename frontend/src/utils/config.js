// Get backend base URL (without /api)
export const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'
  // Remove /api if present
  return apiUrl.replace('/api', '') || 'http://localhost:3002'
}

// Get API URL
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3002/api'
}

// Get Socket URL
export const getSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || getBackendUrl()
}

