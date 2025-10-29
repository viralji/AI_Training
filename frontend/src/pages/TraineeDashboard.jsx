import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { slides } from '../data/slides'
import Sidebar from '../components/Sidebar'
import SlideRenderer from '../components/SlideRenderer'
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

const TraineeDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { chapterId, slideId } = useParams()
  
  const activeSlide = slideId || chapterId || 'chapter-1'
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeAssignments, setActiveAssignments] = useState([])
  const [socket, setSocket] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lastAlertedAssignment, setLastAlertedAssignment] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'trainee') {
      navigate('/login')
    }

    // Function to load active assignments from database
    const loadActiveAssignments = async () => {
      try {
        const token = localStorage.getItem('token')
        const backendUrl = getBackendUrl()
        const response = await fetch(`${backendUrl}/api/assignments/status/active`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const activeAssignmentsFromDB = await response.json()
          // Extract slideId from assignments
          const slideIds = activeAssignmentsFromDB.map(a => a.slide_id)
          console.log('[TraineeDashboard] Loaded active assignments from database:', slideIds)
          setActiveAssignments(slideIds)
        } else {
          console.warn('[TraineeDashboard] Failed to load active assignments from database')
        }
      } catch (error) {
        console.error('[TraineeDashboard] Error loading active assignments:', error)
      }
    }

    // Load active assignments from database first
    loadActiveAssignments()

    // Setup Socket.io
    const newSocket = io(getSocketUrl())
    newSocket.emit('join-training')
    setSocket(newSocket)

    // Listen for active assignments when joining (for users who log in late)
    newSocket.on('active-assignments', (data) => {
      if (data.assignments && data.assignments.length > 0) {
        console.log('[TraineeDashboard] Received active assignments from socket:', data.assignments)
        setActiveAssignments(data.assignments)
      }
    })

    // Listen for assignment started events
    newSocket.on('assignment:started', (data) => {
      setActiveAssignments(prev => {
        if (!prev.includes(data.slideId)) {
          return [...prev, data.slideId]
        }
        return prev
      })
      
      // Only show alert if we haven't already alerted for this assignment
      if (lastAlertedAssignment !== data.slideId) {
        alert(`Assignment ${data.slideId} has started!`)
        setLastAlertedAssignment(data.slideId)
      }
    })

    // Listen for assignment reset events
    newSocket.on('assignment:reset', (data) => {
      setActiveAssignments(prev => prev.filter(id => id !== data.slideId))
      // Clear localStorage for the reset assignment
      const submissionKey = `submission_${data.slideId}_${user.email}`
      localStorage.removeItem(submissionKey)
    })

    return () => {
      newSocket.emit('leave-training')
      newSocket.close()
    }
  }, [user, navigate])

  const handleSubmission = useCallback(async (slideId, submissionData) => {
    const currentSocket = socket
    if (currentSocket) {
      // Send via Socket.io for real-time display
      currentSocket.emit('submission:send', {
        slideId,
        content: submissionData.content,
        submittedAt: submissionData.submittedAt,
        timeLeft: submissionData.timeLeft,
        traineeName: user.name
      })
    }
    
    // Also save to database via API (for AI scoring and persistence)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${getBackendUrl()}/api/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assignment_id: slideId,
          content: submissionData.content,
          submission_time: submissionData.submittedAt
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to save submission to database:', errorText)
      }
    } catch (error) {
      console.error('Error saving submission:', error)
    }
  }, [socket, user.name])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAssignmentSlide = (slideId) => {
    return slideId && slideId.startsWith('slide-5') || slideId === 'slide-2a'
  }

  const handleSlideChange = (newSlideId) => {
    // Determine if it's a chapter or slide
    const isChapter = slides.some(ch => ch.id === newSlideId)
    
    if (isChapter) {
      navigate(`/trainee/${newSlideId}`)
    } else {
      const chapter = findChapterForSlide(newSlideId)
      navigate(`/trainee/${chapter}/${newSlideId}`)
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
          userRole="trainee"
          isActive={activeAssignments.includes(activeSlide)}
          onStartAssignment={() => {}}
          onSubmission={handleSubmission}
          userEmail={user?.email || ''}
        />
      </main>
    </div>
  )
}

export default TraineeDashboard

