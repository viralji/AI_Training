import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { slides } from '../data/slides'
import Sidebar from '../components/Sidebar'
import SlideRenderer from '../components/SlideRenderer'
import { api } from '../services/api'
import { getBackendUrl, getSocketUrl } from '../utils/config'
import './Dashboard.css'

// Helper function to find chapter for a slide
const findChapterForSlide = (slideId) => {
  if (slideId.startsWith('chapter-')) return slideId
  
  for (const chapter of slides) {
    for (const item of chapter.items) {
      if (item.id === slideId) {
        return chapter.id
      }
    }
  }
  return 'chapter-1' // default
}

const TrainerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { chapterId, slideId } = useParams()
  
  const activeSlide = slideId || chapterId || 'chapter-1'
  
  const [searchTerm, setSearchTerm] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [assignments, setAssignments] = useState([])
  const [socket, setSocket] = useState(null)
  const [startedAssignments, setStartedAssignments] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load existing submissions from database
  const loadSubmissions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${getBackendUrl()}/api/submissions/assignment/${activeSlide}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const dbSubmissions = await response.json()
        // Convert database format to frontend format
        const formattedSubmissions = dbSubmissions.map(sub => ({
          slideId: activeSlide, // Use the current active slide
          content: sub.content,
          submittedAt: sub.submitted_at,
          traineeName: sub.name,
          score: sub.score,
          ai_feedback: sub.ai_feedback,
          image_path: sub.image_path
        }))
        setSubmissions(formattedSubmissions)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
  }

  // Load assignment status from database
  const loadAssignmentStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${getBackendUrl()}/api/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const assignments = await response.json()
        // Find active assignments and set them as started
        const activeAssignments = assignments
          .filter(assignment => assignment.status === 'active')
          .map(assignment => assignment.slide_id)
        setStartedAssignments(activeAssignments)
      }
    } catch (error) {
      console.error('Error loading assignment status:', error)
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'trainer') {
      navigate('/login')
    }

    // Load existing submissions
    loadSubmissions()
    
    // Load assignment status
    loadAssignmentStatus()
    
    // Setup Socket.io
    const newSocket = io(getSocketUrl())
    newSocket.emit('join-training')
    setSocket(newSocket)

    // Listen for submission events
    newSocket.on('submission:received', (data) => {
      setSubmissions(prev => {
        // Check if already added
        const exists = prev.find(s => s.slideId === data.slideId && s.content === data.content)
        if (!exists) {
          return [...prev, data]
        }
        return prev
      })
    })

    // Listen for AI scoring events (LIVE SCORING)
    newSocket.on('submission:scored', (data) => {
      console.log('[TrainerDashboard] 📊 Received submission:scored event:', {
        submissionId: data.id,
        score: data.score,
        user: data.name || data.email,
        assignment: data.assignment_title || activeSlide
      })
      
      // Reload submissions from database to get the latest scores
      // This ensures we get the most up-to-date submission with score
      loadSubmissions()
      
      console.log('[TrainerDashboard] ✅ Reloaded submissions after scoring update')
    })

    // Listen for assignment reset events
    newSocket.on('assignment:reset', (data) => {
      // Clear submissions for this assignment
      setSubmissions(prev => prev.filter(sub => sub.slideId !== data.slideId))
      // Remove from started assignments
      setStartedAssignments(prev => prev.filter(id => id !== data.slideId))
    })

    return () => {
      newSocket.emit('leave-training')
      newSocket.close()
    }
  }, [user, navigate])

  // Reload submissions when active slide changes
  useEffect(() => {
    if (user && user.role === 'trainer') {
      loadSubmissions()
    }
  }, [activeSlide])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleStartAssignment = async (slideId) => {
    const backendUrl = getBackendUrl()
    const url = `${backendUrl}/api/assignments/${slideId}/start`
    
    try {
      // Check if already started
      if (startedAssignments.includes(slideId)) {
        alert('Assignment already started!')
        return
      }

      const token = localStorage.getItem('token')
      
      console.log(`[Assignment Start] Attempting to start assignment: ${slideId}`)
      console.log(`[Assignment Start] URL: ${url}`)
      console.log(`[Assignment Start] Backend URL: ${backendUrl}`)
      
      let response
      let errorData = null
      
      // Setup timeout (30 seconds)
      const timeoutController = new AbortController()
      const timeoutId = setTimeout(() => timeoutController.abort(), 30000)
      
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: timeoutController.signal
        })
        clearTimeout(timeoutId)
      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        // Check if it's a timeout
        const isTimeout = fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')
        
        // Network errors, timeout, etc.
        const networkErrorMsg = `
Failed to connect to backend server.

Error Type: ${isTimeout ? 'Timeout Error' : (fetchError.name || 'Network Error')}
Error Message: ${isTimeout ? 'Request timed out after 30 seconds' : (fetchError.message || 'Unknown network error')}

Possible causes:
- Backend server is not running
- Network connectivity issue
- CORS configuration problem
- Firewall blocking the request
- Backend URL is incorrect: ${backendUrl}

Please check:
1. Backend server is running on ${backendUrl}
2. Network connectivity is working
3. Check browser console for CORS errors

Timestamp: ${new Date().toISOString()}
Assignment: ${slideId}
        `
        console.error('[Assignment Start Error] Network/Fetch Error:', fetchError)
        console.error('[Assignment Start Error] Details:', {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack,
          url: url,
          backendUrl: backendUrl,
          slideId: slideId
        })
        alert(networkErrorMsg)
        return
      }
      
      // Try to parse error response
      if (!response.ok) {
        try {
          errorData = await response.json()
        } catch (parseError) {
          // If JSON parse fails, get text
          const errorText = await response.text()
          errorData = { error: errorText }
        }
        
        const errorMsg = `
Failed to start assignment: ${slideId}

HTTP Status: ${response.status} ${response.statusText}
Error Code: ${errorData.code || 'UNKNOWN'}
Error Message: ${errorData.error || errorData.errorMessage || 'Unknown error'}

Additional Details:
${errorData.slideId ? `- Slide ID: ${errorData.slideId}` : ''}
${errorData.assignmentId ? `- Assignment ID: ${errorData.assignmentId}` : ''}
${errorData.currentStatus ? `- Current Status: ${errorData.currentStatus}` : ''}
${errorData.databaseError ? `- Database Error: ${errorData.databaseError}` : ''}
${errorData.errorType ? `- Error Type: ${errorData.errorType}` : ''}
${errorData.timestamp ? `- Server Time: ${errorData.timestamp}` : ''}

Request URL: ${url}
Backend URL: ${backendUrl}
Timestamp: ${new Date().toISOString()}

Possible causes:
${response.status === 404 ? '- Assignment not found in database' : ''}
${response.status === 400 ? '- Assignment is already active' : ''}
${response.status === 401 ? '- Authentication failed (token expired?)' : ''}
${response.status === 403 ? '- Insufficient permissions (not a trainer?)' : ''}
${response.status === 500 ? '- Server error - check backend logs' : ''}

Please check backend logs for more details.
        `
        
        console.error('[Assignment Start Error] HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: url,
          slideId: slideId
        })
        
        alert(errorMsg.trim())
        return
      }
      
      const responseData = await response.json()
      console.log('[Assignment Start] Success:', responseData)
      
      // Add to started assignments
      setStartedAssignments(prev => [...prev, slideId])
      
      alert(`✅ Assignment ${slideId} started successfully for all trainees!`)
    } catch (error) {
      // Catch any unexpected errors
      const unexpectedErrorMsg = `
Unexpected error starting assignment: ${slideId}

Error Type: ${error.constructor?.name || 'Unknown'}
Error Message: ${error.message || 'Unknown error'}

Stack Trace:
${error.stack || 'No stack trace available'}

Timestamp: ${new Date().toISOString()}
URL: ${url || 'Not determined'}
Backend URL: ${backendUrl || 'Not determined'}

Please check browser console and backend logs for more details.
      `
      
      console.error('[Assignment Start Error] Unexpected Error:', error)
      console.error('[Assignment Start Error] Full Error Object:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        slideId: slideId
      })
      
      alert(unexpectedErrorMsg.trim())
    }
  }

  const handleResetAssignment = async (slideId) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to reset assignment ${slideId}?\n\nThis will:\n• Delete ALL submissions for this assignment\n• Reset the assignment status to "not started"\n• Allow trainees to submit again\n\nThis action cannot be undone!`
      )
      
      if (!confirmed) {
        return
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`${getBackendUrl()}/api/assignments/${slideId}/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to reset assignment: ${response.status} - ${errorText}`)
      }
      
      const responseData = await response.json()
      
      // Remove from started assignments
      setStartedAssignments(prev => prev.filter(id => id !== slideId))
      
      // Clear submissions for this assignment
      setSubmissions(prev => prev.filter(sub => sub.slideId !== slideId))
      
      alert(`Assignment ${slideId} has been reset!\n\nDeleted ${responseData.deletedSubmissions} submissions.\nThe assignment can now be started fresh.`)
    } catch (error) {
      console.error('Failed to reset assignment:', error)
      alert(`Failed to reset assignment: ${error.message}`)
    }
  }

  const isAssignmentSlide = (slideId) => {
    return slideId && slideId.startsWith('slide-5') || slideId === 'slide-2a'
  }

  const handleSlideChange = (newSlideId) => {
    // Determine if it's a chapter or slide
    const isChapter = slides.some(ch => ch.id === newSlideId)
    
    if (isChapter) {
      navigate(`/trainer/${newSlideId}`)
    } else {
      const chapter = findChapterForSlide(newSlideId)
      navigate(`/trainer/${chapter}/${newSlideId}`)
    }
  }

  return (
    <div className="dashboard">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <Sidebar 
        slides={slides}
        activeSlide={activeSlide}
        onSlideChange={(newSlideId) => {
          handleSlideChange(newSlideId)
          setSidebarOpen(false)
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isOpen={sidebarOpen}
      />
      <main className="content">
        <div className="header">
          <h2>Welcome, {user?.name}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <SlideRenderer 
          slideId={activeSlide}
          isAssignment={isAssignmentSlide(activeSlide)}
          userRole="trainer"
          submissions={submissions.filter(s => s.slideId === activeSlide)}
          isStarted={startedAssignments.includes(activeSlide)}
          onStartAssignment={handleStartAssignment}
          onResetAssignment={handleResetAssignment}
        />
      </main>
    </div>
  )
}

export default TrainerDashboard

