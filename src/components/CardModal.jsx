export default function CardModal({ state, dispatch }) {
  const card = state.activeCard
  if (!card) return null

  const isPortrait = card.orientation === 'portrait'

  return (
    <div
      className="modal-overlay"
      onClick={() => dispatch({ type: 'CLOSE_MODAL' })}
    >
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={() => dispatch({ type: 'CLOSE_MODAL' })}
          aria-label="Schliessen"
        >
          ×
        </button>

        <div
          className={`card-flip-container${isPortrait ? ' portrait' : ' landscape'}${card.flipped ? ' flipped' : ''}`}
        >
          <div className="card-flip-inner">
            <div className="card-face card-front">
              <img
                src={`${import.meta.env.BASE_URL}karten/${card.front_img}`}
                alt={card.display}
              />
            </div>
            <div className="card-face card-back">
              <img
                src={`${import.meta.env.BASE_URL}karten/${card.back_img}`}
                alt={`${card.display} Rückseite`}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          {!card.flipped ? (
            <button
              className="btn btn-primary btn-large"
              onClick={() => dispatch({ type: 'FLIP_CARD' })}
            >
              Aufdecken
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => dispatch({ type: 'CLOSE_MODAL' })}
            >
              Schliessen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
