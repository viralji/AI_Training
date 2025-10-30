import { useEffect, useState } from 'react'

const VersionBadge = () => {
  const [version, setVersion] = useState('')

  useEffect(() => {
    fetch('/VERSION')
      .then(res => (res.ok ? res.text() : ''))
      .then(text => setVersion((text || '').trim()))
      .catch(() => setVersion(''))
  }, [])

  if (!version) return null

  return (
    <div className="version-badge">v{version}</div>
  )
}

export default VersionBadge


