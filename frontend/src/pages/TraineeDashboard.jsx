import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [approvalStatus, setApprovalStatus] = useState(null) // null = checking, true = approved, false = pending
  const [checkingStatus, setCheckingStatus] = useState(false)
  const approvalStatusRef = useRef(null)

  // Check approval status function
  const checkApproval = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setCheckingStatus(true)
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        setApprovalStatus(false)
        setCheckingStatus(false)
        navigate('/login')
        return false
      }

      const backendUrl = getBackendUrl()
      
      // Use dedicated status check endpoint
      const response = await fetch(`${backendUrl}/api/users/check-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle different response formats - check for truthy values
        // Be very explicit about what we accept
        const isApproved = data.approved === true || 
                          data.approved === 1 || 
                          data.approved === 'true' || 
                          data.approved === '1' ||
                          (typeof data.approved === 'number' && data.approved > 0) ||
                          (typeof data.approved === 'string' && data.approved.toLowerCase() === 'true') ||
                          Boolean(data.approved)
        
        const isEnabled = data.enabled === true || 
                         data.enabled === 1 || 
                         data.enabled === 'true' || 
                         data.enabled === '1' ||
                         (typeof data.enabled === 'number' && data.enabled > 0) ||
                         (typeof data.enabled === 'string' && data.enabled.toLowerCase() === 'true') ||
                         Boolean(data.enabled)
        
        if (isApproved && isEnabled) {
          setApprovalStatus(true)
          approvalStatusRef.current = true
          setCheckingStatus(false)
          return true
        } else {
          setApprovalStatus(false)
          approvalStatusRef.current = false
          setCheckingStatus(false)
          return false
        }
      } else if (response.status === 403) {
        // Access denied - not approved
        await response.json().catch(() => ({}))
        setApprovalStatus(false)
        approvalStatusRef.current = false
        setCheckingStatus(false)
        return false
      } else {
        // Other errors
        await response.text().catch(() => 'Unknown error')
        setApprovalStatus(false)
        approvalStatusRef.current = false
        setCheckingStatus(false)
        return false
      }
    } catch (error) {
      console.error('[TraineeDashboard] Error checking approval:', error)
      // Network errors - show error state
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setApprovalStatus(false)
        approvalStatusRef.current = false
      } else {
        setApprovalStatus(false)
        approvalStatusRef.current = false
      }
      setCheckingStatus(false)
      return false
    }
  }, [navigate])

  // Check approval status on mount
  useEffect(() => {
    if (!user || user.role !== 'trainee') {
      navigate('/login')
      return
    }

    // If user object already has approval status (from login), use it
    if (user.approved !== undefined && user.enabled !== undefined) {
      const isApproved = Boolean(user.approved) && Boolean(user.enabled)
      if (isApproved) {
        setApprovalStatus(true)
        approvalStatusRef.current = true
        return
      }
    }

    // Otherwise check immediately
    checkApproval(false).then(isApproved => {
      if (isApproved) {
      }
    })

    // Check every 3 seconds if not approved (so user sees update when trainer approves)
    const interval = setInterval(() => {
      if (approvalStatus === false) {
        checkApproval(false)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user, navigate, checkApproval])

  useEffect(() => {
    // Only load assignments if user is approved
    if (!user || user.role !== 'trainee' || approvalStatus !== true) {
      return
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
          setActiveAssignments(slideIds)
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

  // Show pending approval message
  if (approvalStatus === false) {
    return (
      <div className="dashboard">
        <main className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'linear-gradient(135deg, #1a2430 0%, #0f141a 100%)',
            borderRadius: '12px',
            border: '1px solid #2a3441',
            maxWidth: '600px',
            margin: '20px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ color: '#f59e0b', marginBottom: '15px' }}>Account Pending Approval</h2>
            <p style={{ color: '#9fb2c3', marginBottom: '30px', lineHeight: '1.6' }}>
              Your account is pending trainer approval. You will be able to access the training resources once a trainer approves your account.
            </p>
            <p style={{ color: '#9fb2c3', fontSize: '14px', marginBottom: '20px' }}>
              Please contact the trainer to request approval.
            </p>
            <p style={{ color: '#9fb2c3', fontSize: '12px', marginBottom: '15px', fontStyle: 'italic' }}>
              Status will refresh automatically. If you were just approved, please wait a few seconds or refresh the page.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              {checkingStatus && (
                <p style={{ color: '#3bb6ff', fontSize: '14px', marginBottom: '10px' }}>
                  Checking status...
                </p>
              )}
              <button 
                onClick={async () => {
                  const result = await checkApproval(true)
                  if (result) {
                    alert('✅ You are approved! Refreshing page...')
                    window.location.reload()
                  } else {
                    alert('❌ Still pending approval. Please contact the trainer.')
                  }
                }}
                disabled={checkingStatus}
                style={{
                  padding: '10px 20px',
                  backgroundColor: checkingStatus ? '#666' : '#3bb6ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: checkingStatus ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '150px'
                }}
              >
                {checkingStatus ? '⏳ Checking...' : '🔄 Check Status'}
              </button>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show loading while checking approval
  if (approvalStatus === null) {
    return (
      <div className="dashboard">
        <main className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ color: '#9fb2c3', fontSize: '16px' }}>Checking access...</div>
        </main>
      </div>
    )
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

