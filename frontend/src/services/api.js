import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

export const api = {
  // Assignment endpoints
  startAssignment: async (assignmentId) => {
    const response = await axios.post(
      `${API_URL}/assignments/${assignmentId}/start`,
      {},
      getAuthHeaders()
    )
    return response.data
  },

  endAssignment: async (assignmentId) => {
    const response = await axios.post(
      `${API_URL}/assignments/${assignmentId}/end`,
      {},
      getAuthHeaders()
    )
    return response.data
  },

  getAssignments: async () => {
    const response = await axios.get(
      `${API_URL}/assignments`,
      getAuthHeaders()
    )
    return response.data
  },

  // Submission endpoints
  submitAssignment: async (assignmentId, content, submissionTime, imageFile = null) => {
    const formData = new FormData()
    formData.append('assignment_id', assignmentId)
    formData.append('content', content)
    formData.append('submission_time', submissionTime)
    
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const response = await axios.post(
      `${API_URL}/submissions`,
      formData,
      {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  getSubmissions: async (assignmentId) => {
    const response = await axios.get(
      `${API_URL}/submissions/assignment/${assignmentId}`,
      getAuthHeaders()
    )
    return response.data
  },

  scoreSubmissions: async (assignmentId) => {
    const response = await axios.post(
      `${API_URL}/submissions/score/${assignmentId}`,
      {},
      getAuthHeaders()
    )
    return response.data
  },

  getLeaderboard: async (assignmentId) => {
    const response = await axios.get(
      `${API_URL}/submissions/leaderboard/${assignmentId}`,
      getAuthHeaders()
    )
    return response.data
  }
}






