const CATEGORY_LABELS = {
  spielvorbereitung: 'Spielvorbereitung',
  spiel: 'Spiel',
  quest: 'Quest',
  questschein: 'Questscheine',
}

export default function CardStack({ state, dispatch }) {
  const category = state.activeCategory
  const deck = state.decks[category]
  const isQuest = category === 'quest'
  const label = CATEGORY_LABELS[category]

  const allCards = isQuest
    ? [...deck.remaining].sort((a, b) => a.page_index - b.page_index)
    : [...deck.remaining, ...deck.drawn].sort((a, b) => a.page_index - b.page_index)

  const drawnIds = isQuest ? new Set() : new Set(deck.drawn.map(c => c.id))

  return (
    <div className="cardstack-page">
      <header className="page-header">
        <button
          className="btn btn-secondary"
          onClick={() => dispatch({ type: 'SET_CATEGORY', category: null })}
        >
          ← Zurück
        </button>
        <h1 className="page-title">{label}</h1>
        <span className="stack-stats">
          {isQuest
            ? `${deck.remaining.length} Karten im Stapel`
            : `${deck.remaining.length} verbleibend / ${deck.drawn.length} gezogen`}
        </span>
      </header>

      <div className="stack-actions">
        <button
          className="btn btn-primary btn-large"
          onClick={() => dispatch({ type: 'DRAW_CARD' })}
          disabled={!isQuest && deck.remaining.length === 0}
        >
          Karte ziehen
        </button>
        {!isQuest && (
          <button
            className="btn btn-secondary"
            onClick={() => dispatch({ type: 'RESHUFFLE_DECK' })}
          >
            Stapel neu mischen
          </button>
        )}
      </div>

      <div className="card-grid">
        {allCards.map(card => {
          const drawn = drawnIds.has(card.id)
          return (
            <div
              key={card.id}
              className={`card-thumb${drawn ? ' card-drawn' : ''}`}
            >
              <img
                src={`${import.meta.env.BASE_URL}karten/${card.front_img}`}
                alt={card.display}
                loading="lazy"
              />
              {drawn && <span className="drawn-badge">Gezogen</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
