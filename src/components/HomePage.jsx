export default function HomePage({ state, dispatch }) {
  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title">IVantasia</h1>
        <h2 className="home-subtitle">Kartensimulator</h2>

        <label className="toggle-label">
          <div className="toggle-track">
            <input
              type="checkbox"
              className="toggle-input"
              checked={!state.adultMode}
              onChange={() => dispatch({ type: 'TOGGLE_ADULT_MODE' })}
            />
            <span className="toggle-slider" />
          </div>
          <span className="toggle-text">
            {state.adultMode
              ? 'Alle Karten aktiv'
              : 'Jugendschutz aktiv – Erwachsenenkarten ausgeblendet'}
          </span>
        </label>

        <button
          className="btn btn-primary btn-large"
          onClick={() => dispatch({ type: 'START_GAME' })}
          disabled={state.cards.length === 0}
        >
          {state.cards.length === 0 ? 'Lade Karten…' : 'Spiel starten'}
        </button>
      </div>
    </div>
  )
}
