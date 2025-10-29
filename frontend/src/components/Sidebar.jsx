import './Sidebar.css'

const Sidebar = ({ slides, activeSlide, onSlideChange, searchTerm, onSearchChange, isOpen = false }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="brand">
        <img src="/cloud-extel-logo.png" alt="CloudExtel" className="logo" style={{width: '48px', height: '48px', objectFit: 'contain', borderRadius: '50%'}} />
        <div>
          <div className="brand-title">CloudExtel</div>
          <div className="mini">AI Literacy Training</div>
        </div>
      </div>

      <div className="menusearch">
        <input 
          id="menuSearch" 
          type="text" 
          placeholder="Filter slides…" 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <nav className="menu" id="menu">
        {slides.map((chapter, idx) => (
          <div key={idx} className="chapter">
            <div 
              className={`chapter-head ${activeSlide === chapter.id ? 'active' : ''}`}
              onClick={() => onSlideChange(chapter.id)}
              data-slide={chapter.id}
            >
              <span className={`badge badge-${idx + 1}`}>{idx + 1}</span>
              {chapter.title}
            </div>
            <div className="chapter-body">
              {chapter.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx}
                  className={`${item.subitem ? 'subitem' : 'item'} ${activeSlide === item.id ? 'active' : ''}`}
                  onClick={() => onSlideChange(item.id)}
                  data-slide={item.id}
                >
                  <span className="dot"></span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar

