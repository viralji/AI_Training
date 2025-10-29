import { slides } from '../data/slides.js'

// Helper to find chapter for a given slide
export const findChapterForSlide = (slideId) => {
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

// Format time in MM:SS
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}







