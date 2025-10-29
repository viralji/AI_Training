import { useState, useEffect } from 'react'
import { slideContent } from '../data/slideContent'
import { io } from 'socket.io-client'
import { getBackendUrl, getSocketUrl } from '../utils/config'
import './SlideRenderer.css'

const SlideRenderer = ({ slideId, isAssignment, userRole, isActive, onStartAssignment, onResetAssignment, onSubmission, submissions = [], isStarted = false, userEmail = '' }) => {
  const content = slideContent[slideId]
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes default
  const [submission, setSubmission] = useState('')
  const [timerRunning, setTimerRunning] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [submissionDetails, setSubmissionDetails] = useState(null)

  // Helper function to get score range for color coding
  const getScoreRange = (score) => {
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  // Create unique key per user and slide
  const submissionKey = `submission_${slideId}_${userEmail}`

  // Check if already submitted on mount
  useEffect(() => {
    const existingSubmission = localStorage.getItem(submissionKey)
    if (existingSubmission) {
      setAlreadySubmitted(true)
      setSubmissionDetails(JSON.parse(existingSubmission))
    } else {
      // Clear submission state if no localStorage entry
      setAlreadySubmitted(false)
      setSubmissionDetails(null)
    }
  }, [slideId, submissionKey])

  // Listen for assignment reset events to clear localStorage
  useEffect(() => {
    if (userRole === 'trainee' && onSubmission) {
      // This is a trainee dashboard, set up Socket.io listener
      const socket = io(getSocketUrl())
      socket.emit('join-training')
      
      socket.on('assignment:reset', (data) => {
        if (data.slideId === slideId) {
          // Clear localStorage for this assignment
          localStorage.removeItem(submissionKey)
          setAlreadySubmitted(false)
          setSubmissionDetails(null)
          setSubmission('')
          setTimerRunning(false)
          setTimeLeft(content.timeLimit || 300)
        }
      })
      
      return () => {
        socket.emit('leave-training')
        socket.close()
      }
    }
  }, [slideId, submissionKey, userRole, onSubmission, content.timeLimit])

  // Initialize timer when assignment becomes active
  useEffect(() => {
    if (isActive && content.type === 'assignment' && content.timeLimit) {
      // Check if user already has a submission with time remaining
      const existingSubmission = localStorage.getItem(submissionKey)
      if (existingSubmission) {
        const subData = JSON.parse(existingSubmission)
        // Don't restart timer if already submitted
        return
      }
      // Only reset timer if starting fresh
      setTimeLeft(content.timeLimit)
      setTimerRunning(true)
    }
  }, [isActive, content, submissionKey])

  // Timer countdown
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timerRunning, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }


  const handleSubmit = async () => {
    const submissionData = {
      content: submission,
      submittedAt: new Date().toISOString(),
      timeLeft: timeLeft
    }
    
    // Store in localStorage with user-specific key
    localStorage.setItem(submissionKey, JSON.stringify(submissionData))
    
    // Send to trainer via Socket.io (for real-time display)
    if (onSubmission) {
      onSubmission(slideId, submissionData)
    }
    
    // Only save to database via API if we're not in trainee dashboard
    // (trainee dashboard handles its own API calls)
    if (userRole !== 'trainee') {
      try {
        const formData = new FormData()
        formData.append('assignment_id', slideId)
        formData.append('content', submission)
        formData.append('submission_time', submissionData.submittedAt)
        
        const token = localStorage.getItem('token')
        
        const response = await fetch(`${getBackendUrl()}/api/submissions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to save submission to database:', errorText)
        }
      } catch (error) {
        console.error('Error saving submission:', error)
      }
    }
    
    setAlreadySubmitted(true)
    setSubmissionDetails(submissionData)
    alert('Submission received!')
    setSubmission('')
    setTimerRunning(false)
  }
  
  if (!content) {
    return <div className="empty">Slide not found</div>
  }

  const renderContent = () => {
    switch (content.type) {
      case 'table':
        return (
          <table>
            <thead>
              <tr>
                {content.table.headers.map((header, idx) => (
                  <th key={idx}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.table.rows.map((row, idx) => (
                <tr key={idx} className={idx === content.table.highlightRow ? 'highlight' : ''}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )

      case 'matrix':
        return (
          <div className="matrix">
            {content.matrix.map((item, idx) => (
              <div key={idx} className="row">
                <div className="cell">
                  <h4>{item.topic}</h4>
                  {item.description}
                </div>
                <div className="cell">
                  <span className="pill">THEN</span> {item.then}
                </div>
                <div className="cell">
                  <span className="pill now">NOW</span> {item.now}
                </div>
              </div>
            ))}
          </div>
        )

      case 'grid-2':
      case 'grid-3':
      case 'grid-4':
      case 'grid-5':
      case 'grid-6':
        return (
          <div className={content.type}>
            {content.panels.map((panel, idx) => (
              <div key={idx} className={`panel ${panel.highlight ? 'highlight-panel' : ''}`}>
                {panel.image && (
                  <img src={panel.image} alt={panel.title} className="panel-image" />
                )}
                {panel.images && panel.images.length > 0 && (
                  <div className="panel-images">
                    {panel.images.map((imageUrl, imgIdx) => (
                      <img 
                        key={imgIdx} 
                        src={imageUrl} 
                        alt={`${panel.title} example ${imgIdx + 1}`}
                        className="panel-image"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                <h3>{panel.title}</h3>
                {panel.timeframe && (
                  <p className="timeframe">{panel.timeframe}</p>
                )}
                {panel.points && (
                  content.type === 'grid-4' || content.type === 'grid-6' ? (
                    <div className="points-content">
                      {panel.points.map((point, pointIdx) => (
                        <p key={pointIdx} dangerouslySetInnerHTML={{ __html: point }} />
                      ))}
                    </div>
                  ) : (
                    <ul className="clean">
                      {panel.points.map((point, pointIdx) => (
                        <li key={pointIdx} dangerouslySetInnerHTML={{ __html: point }} />
                      ))}
                    </ul>
                  )
                )}
                {panel.now && (
                  <div className="now-section">
                    <p className="now-label">Now:</p>
                    <p className="now-content">{panel.now}</p>
                  </div>
                )}
              </div>
            ))}
            {content.callout && (
              <div className="callout-section">
                <div className="callout-items">
                  {content.callout.items.map((item, idx) => (
                    <div key={idx} className="callout-item" dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'assignment':
        if (userRole === 'trainer') {
          return (
            <div className="assignment-trainer">
              <div className="panel">
                <h3>Assignment Instructions</h3>
                <div className="instruction" dangerouslySetInnerHTML={{ __html: content.instruction }} />
                <div className="trainer-controls">
                  <button 
                    className="btn" 
                    onClick={() => onStartAssignment(slideId)}
                    disabled={isStarted}
                  >
                    {isStarted ? '✓ Assignment Already Started' : 'Start Assignment for All Trainees'}
                  </button>
                  {isStarted && onResetAssignment && (
                    <button 
                      className="btn btn-danger" 
                      onClick={() => onResetAssignment(slideId)}
                      style={{
                        marginLeft: '10px',
                        backgroundColor: '#ef4444',
                        borderColor: '#ef4444'
                      }}
                    >
                      🔄 Reset Assignment
                    </button>
                  )}
                </div>
                <div className="submissions-panel">
                  <h3>Live Submissions ({submissions.filter(s => s.slideId === slideId).length})</h3>
                  <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                    {submissions.length === 0 ? (
                      <div className="empty">No responses yet...</div>
                    ) : (
                      submissions.map((sub, idx) => (
                        <div key={idx} style={{padding: '8px', borderBottom: '1px dashed var(--border)'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                            <strong style={{color: 'var(--accent)'}}>{sub.traineeName || 'Trainee'}</strong>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                              {/* AI Score Badge */}
                              {sub.score && (
                                <div className={`ai-score-badge score-${getScoreRange(sub.score)}`}>
                                  🤖 {sub.score}/10
                                </div>
                              )}
                              <span style={{color: 'var(--muted)', fontSize: '12px'}}>
                                {new Date(sub.submittedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div style={{fontSize: '13px', color: 'var(--text)', marginTop: '4px'}}>{sub.content}</div>
                          
                          {/* AI Feedback */}
                          {sub.ai_feedback && (
                            <div className="ai-feedback" style={{marginTop: '8px', padding: '6px', background: 'rgba(59, 182, 255, 0.1)', borderRadius: '4px', fontSize: '12px'}}>
                              <strong style={{color: 'var(--accent)'}}>AI Feedback:</strong> {sub.ai_feedback}
                            </div>
                          )}
                          
                          {/* Display submitted image if available */}
                          {sub.image_path && (
                            <div style={{marginTop: '8px'}}>
                              <img 
                                src={`${getBackendUrl()}/${sub.image_path}`} 
                                alt="Submitted image" 
                                style={{
                                  maxWidth: '150px', 
                                  maxHeight: '150px', 
                                  borderRadius: '4px',
                                  border: '1px solid var(--border)'
                                }} 
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="assignment-trainee">
              <div className="panel">
                <h3>Assignment Prompt</h3>
                <div className="instruction" dangerouslySetInnerHTML={{ __html: content.instruction }} />
                
                {alreadySubmitted ? (
                  <div className="submitted-status">
                    <div className="success-badge">✅ Submitted Successfully</div>
                    <div className="submission-details">
                      <p><strong>Submitted At:</strong> {new Date(submissionDetails.submittedAt).toLocaleString()}</p>
                      <p><strong>Time Remaining:</strong> {formatTime(submissionDetails.timeLeft)}</p>
                      <div className="submitted-content">
                        <strong>Your Submission:</strong>
                        <div className="submitted-text">{submissionDetails.content}</div>
                      </div>
                    </div>
                  </div>
                ) : !isActive ? (
                  <div className="waiting-status">
                    <div className="clock">{formatTime(0)}</div>
                    <span className="status" style={{color: 'var(--warn)'}}>⏳ Waiting for assignment to start</span>
                  </div>
                ) : (
                  <>
                    <div className="timer">
                      <div className="clock">{formatTime(timeLeft)}</div>
                      <span className={timeLeft < 60 ? 'status danger' : 'status active'}>
                        {timerRunning ? '⏱️ Time Remaining' : '⏰ Time Up!'}
                      </span>
                    </div>
                    
                    <textarea 
                      className="submission-input"
                      placeholder="Type your text submission here... (Mobile-friendly)"
                      rows={6}
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                      disabled={!timerRunning || timeLeft === 0}
                      style={{
                        fontSize: '16px', // Prevents zoom on iOS
                        resize: 'vertical',
                        minHeight: '120px'
                      }}
                    />
                    <button 
                      className="btn" 
                      onClick={handleSubmit}
                      disabled={!timerRunning || timeLeft === 0 || !submission.trim()}
                    >
                      {timeLeft === 0 ? 'Time Up - Cannot Submit' : 'Submit Assignment'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        }

      case 'youtube':
        if (content.videoId) {
          return (
            <div className="yt-wrap" style={{display: 'flex', justifyContent: 'center'}}>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${content.videoId}${content.startTime ? `?start=${content.startTime}` : ''}`}
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={content.allowFullscreen}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  maxWidth: '100%'
                }}
              />
            </div>
          )
        }
        return (
          <div className="yt-wrap">
            <div className="empty">Paste YouTube URL and click Set to embed video</div>
          </div>
        )

      case 'dual-youtube':
        if (content.videos && content.videos.length >= 2) {
          return (
            <div className="dual-yt-wrap" style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
              {content.videos.map((video, index) => (
                <div key={index} style={{textAlign: 'center'}}>
                  <h4 style={{marginBottom: '10px', color: 'var(--text)', fontSize: '16px'}}>{video.title}</h4>
                  <p style={{marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '14px'}}>{video.subtitle}</p>
                  <iframe
                    width="480"
                    height="270"
                    src={`https://www.youtube.com/embed/${video.videoId}${video.startTime ? `?start=${video.startTime}` : ''}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen={content.allowFullscreen}
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      maxWidth: '100%'
                    }}
                  />
                </div>
              ))}
            </div>
          )
        } else {
          return (
            <div className="empty">Dual YouTube videos not configured properly</div>
          )
        }

      case 'simple':
        // If it has Q&A content, render it
        if (content.qna && content.qna.length > 0) {
          return (
            <div className="qna-container">
              {content.qna.map((item, idx) => (
                <div key={idx} className="qna-item">
                  <div className="qna-question">
                    <strong>Q{idx + 1}: {item.q}</strong>
                  </div>
                  <div className="qna-answer" dangerouslySetInnerHTML={{ __html: item.a }} />
                  {item.images && item.images.length > 0 && (
                    <div className="qna-images">
                      {item.images.map((imageUrl, imgIdx) => (
                        <img 
                          key={imgIdx} 
                          src={imageUrl} 
                          alt={`Step ${imgIdx + 1}`}
                          className="qna-image"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        }
        // If it has HTML content, render it
        if (content.content) {
          return <div className="simple-content" dangerouslySetInnerHTML={{ __html: content.content }} />
        }
        return <div className="simple-content">Ready for presentation</div>

      default:
        return <div>Unknown slide type</div>
    }
  }

  return (
    <div className="slide-renderer">
      <div className="card">
        <h1>{content.title}</h1>
        <div className="subtitle" dangerouslySetInnerHTML={{ __html: content.subtitle }} />
        {renderContent()}
        {content.legend && <div className="legend" dangerouslySetInnerHTML={{ __html: content.legend }} />}
        {content.message && <div className="legend" style={{marginTop: '10px'}} dangerouslySetInnerHTML={{ __html: content.message }} />}
      </div>
    </div>
  )
}

export default SlideRenderer

