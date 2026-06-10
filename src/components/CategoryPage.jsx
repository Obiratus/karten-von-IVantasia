const CATEGORIES = [
  { key: 'spielvorbereitung', label: 'Spielvorbereitung', withReplacement: false },
  { key: 'spiel', label: 'Spiel', withReplacement: false },
  { key: 'quest', label: 'Quest', withReplacement: true },
  { key: 'questschein', label: 'Questscheine', withReplacement: false },
]

export default function CategoryPage({ state, dispatch }) {
  const decksForCategory = (category) =>
    Object.values(state.decks).filter(d => d.usage === category)

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
          const decks = decksForCategory(key)
          const totalRemaining = decks.reduce((sum, d) => sum + d.remaining.length, 0)
          const totalDrawn = withReplacement
            ? 0
            : decks.reduce((sum, d) => sum + (d.drawn?.length ?? 0), 0)

          return (
            <button
              key={key}
              className="category-card"
              onClick={() => dispatch({ type: 'SET_CATEGORY', category: key })}
            >
              <span className="category-name">{label}</span>
              <span className="category-count">
                {withReplacement
                  ? `${totalRemaining} Karten`
                  : `${totalRemaining} verfügbar / ${totalDrawn} gezogen`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
