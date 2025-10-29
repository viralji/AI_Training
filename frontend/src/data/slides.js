// Presentation slides data
export const slides = [
  {
    id: 'chapter-1',
    title: 'Welcome to AI',
    items: [
      { id: 'slide-1', label: 'Revolutions ➜ AI' },
      { id: 'slide-2', label: 'Queues from Online', subitem: false },
      { id: 'slide-1ce', label: 'Solutions built at CE', subitem: true },
      { id: 'slide-2a', label: 'Assignment • Spot Your Time Sink', subitem: true, isAssignment: true }
    ]
  },
  {
    id: 'chapter-2',
    title: 'Shaan of AI',
    items: [
      { id: 'slide-2b', label: 'AI Model Comparison', subitem: true },
      { id: 'slide-3a', label: 'Top Gen AI Terms', subitem: true },
      { id: 'slide-3', label: 'Literacy Models' },
      { id: 'slide-4', label: 'Tools by Stage' }
    ]
  },
  {
    id: 'chapter-3',
    title: 'Mugamboo.AI Kush Hua',
    items: [
      { id: 'slide-5', label: 'Overview' },
      { id: 'slide-5a', label: 'Assignment 1', subitem: true, isAssignment: true },
      { id: 'slide-5b', label: 'Assignment 2', subitem: true, isAssignment: true },
      { id: 'slide-5c', label: 'Assignment 3', subitem: true, isAssignment: true },
      { id: 'slide-5e', label: 'Assignment 4', subitem: true, isAssignment: true },
      { id: 'slide-5d', label: 'Assignment 5', subitem: true, isAssignment: true }
    ]
  },
  {
    id: 'chapter-4',
    title: 'Dhamaal',
    items: [
      { id: 'slide-6a', label: 'Global AI Success Stories', subitem: true },
      { id: 'slide-6b', label: 'How Companies Leverage AI', subitem: true },
      { id: 'slide-6c', label: 'Understanding AGI (Q&A)', subitem: true },
      { id: 'slide-6d', label: 'Understanding SGI (Q&A)', subitem: true },
      { id: 'slide-6e', label: 'The Future: AGI & SGI Timeline', subitem: true }
    ]
  },
  {
    id: 'chapter-5',
    title: 'Teri Baaton Mein Aisa Uljha Jiya',
    items: [
      { id: 'slide-7a', label: 'Risks of Using AI', subitem: true },
      { id: 'slide-7b', label: 'Security & Data Protection', subitem: true },
      { id: 'slide-7c', label: 'Misuse & Wrong Use', subitem: true },
      { id: 'slide-7d', label: 'Ethics & Responsibility', subitem: true },
      { id: 'slide-7e', label: 'Guardrails & Policies', subitem: true },
      { id: 'slide-7f', label: 'Basic Don\'ts', subitem: true }
    ]
  },
  {
    id: 'chapter-6',
    title: 'Thank You',
    items: []
  }
]

// Slide content mapping
export const slideContent = {
  'slide-1': {
    title: 'From Industrial to AI — Where We Are Now',
    subtitle: 'Short history of work revolutions and why AI is the next step',
    type: 'table'
  },
  'slide-2': {
    title: 'Queues from Online — A Journey We All Lived',
    subtitle: 'Then vs Now (side‑by‑side) for everyday tasks',
    type: 'content'
  },
  'slide-2a': {
    title: 'Assignment • Spot Your Time Sink',
    subtitle: 'Write ONE thing you do today that is repetitive / time‑consuming / mind‑numbing.',
    type: 'assignment',
    timeLimit: 300 // 5 minutes
  },
  'slide-5': {
    title: 'Mugamboo.AI — Overview',
    subtitle: 'Assignments to build confidence with hands‑on AI.',
    type: 'content'
  },
  'slide-5a': {
    title: 'Assignment 1',
    subtitle: 'Define one repetitive task; outline a 3‑step automation using an AI tool.',
    type: 'assignment',
    timeLimit: 600 // 10 minutes
  },
  'slide-5b': {
    title: 'Assignment 2',
    subtitle: 'Draft a prompt to summarize a 5‑page PDF into 5 bullets + 1 risk.',
    type: 'assignment',
    timeLimit: 600
  },
  'slide-5c': {
    title: 'Assignment 3',
    subtitle: 'Create an email reply using tone: "Crisp, polite, decisive"; include 2 action items.',
    type: 'assignment',
    timeLimit: 600
  },
  'slide-5d': {
    title: 'Assignment 4',
    subtitle: 'Design a table of KPIs and ask the model to compute last month\'s deltas.',
    type: 'assignment',
    timeLimit: 900 // 15 minutes
  },
  'slide-5e': {
    title: 'Assignment 5',
    subtitle: 'Build a small agent flow: fetch → analyze → notify (describe steps in plain English).',
    type: 'assignment',
    timeLimit: 900
  }
}

