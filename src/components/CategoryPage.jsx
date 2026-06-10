const CATEGORIES = [
  { key: 'spielvorbereitung', label: 'Spielvorbereitung', withReplacement: false },
  { key: 'spiel', label: 'Spiel', withReplacement: false },
  { key: 'quest', label: 'Quest', withReplacement: true },
  { key: 'questschein', label: 'Questscheine', withReplacement: false },
]

export default function CategoryPage({ state, dispatch }) {
  return (
    <div className="category-page">
      <header className="page-header">
        <h1 className="page-title">IVantasia Kartensimulator</h1>
        <button
          className="btn btn-secondary"
          onClick={() => dispatch({ type: 'NEW_GAME' })}
        >
          Neues Spiel
        </button>
      </header>

      <div className="category-grid">
        {CATEGORIES.map(({ key, label, withReplacement }) => {
          const deck = state.decks[key]
          return (
            <button
              key={key}
              className="category-card"
              onClick={() => dispatch({ type: 'SET_CATEGORY', category: key })}
            >
              <span className="category-name">{label}</span>
              <span className="category-count">
                {withReplacement
                  ? `${deck.remaining.length} Karten`
                  : `${deck.remaining.length} verfügbar / ${deck.drawn.length} gezogen`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
