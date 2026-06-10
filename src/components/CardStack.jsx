import { getDeckKey } from '../App.jsx'

const CATEGORY_LABELS = {
  spielvorbereitung: 'Spielvorbereitung',
  spiel: 'Spiel',
  quest: 'Quest',
  questschein: 'Questscheine',
}

function getRepresentative(deck) {
  const all = [...deck.remaining, ...(deck.drawn ?? [])]
  return all.sort((a, b) => a.page_index - b.page_index)[0] ?? null
}

function DeckSlot({ deckKey, deck, dispatch }) {
  const isQuest = !('drawn' in deck)
  const isEmpty = !isQuest && deck.remaining.length === 0
  const canReshuffle = !isQuest && isEmpty && deck.drawn.length > 0
  const isHeld = deckKey === 'held'

  const representative = getRepresentative(deck)
  if (!representative) return null

  const isLandscape = representative.orientation === 'landscape'

  const handleDraw = () => {
    if (isEmpty) return
    dispatch({ type: 'DRAW_CARD', payload: { deckKey } })
  }

  const handleReshuffle = (e) => {
    e.stopPropagation()
    dispatch({ type: 'RESHUFFLE_DECK', payload: { deckKey } })
  }

  return (
    <div className="deck-slot">
      {isHeld ? (
        <button
          className={`held-btn${isEmpty ? ' held-btn--empty' : ''}`}
          onClick={handleDraw}
          disabled={isEmpty}
        >
          <span className="held-icon">⚔</span>
          <span>{isEmpty ? 'Alle Helden gezogen' : 'Held ziehen'}</span>
        </button>
      ) : (
        <div
          className={`deck-card${isLandscape ? ' deck-card--landscape' : ''}${isEmpty ? ' deck-card--empty' : ''}`}
          onClick={handleDraw}
          role="button"
          tabIndex={isEmpty ? -1 : 0}
          onKeyDown={e => e.key === 'Enter' && handleDraw()}
          aria-label={`${representative.display} ziehen`}
        >
          <img
            src={`${import.meta.env.BASE_URL}karten/${representative.front_img}`}
            alt={representative.display}
          />
          {isEmpty && <span className="deck-empty-badge">Leer</span>}
        </div>
      )}

      {canReshuffle && (
        <button className="btn btn-reshuffle" onClick={handleReshuffle}>
          ↺ neu mischen
        </button>
      )}
    </div>
  )
}

export default function CardStack({ state, dispatch }) {
  const category = state.activeCategory
  const label = CATEGORY_LABELS[category]

  const categoryDecks = Object.entries(state.decks)
    .filter(([, deck]) => deck.usage === category)
    .sort(([, a], [, b]) => {
      const repA = getRepresentative(a)
      const repB = getRepresentative(b)
      return (repA?.page_index ?? 0) - (repB?.page_index ?? 0)
    })

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
      </header>

      <div className="deck-grid">
        {categoryDecks.map(([deckKey, deck]) => (
          <DeckSlot
            key={deckKey}
            deckKey={deckKey}
            deck={deck}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}
