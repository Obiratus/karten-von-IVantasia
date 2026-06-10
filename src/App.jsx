import { useReducer, useEffect } from 'react'
import HomePage from './components/HomePage.jsx'
import CategoryPage from './components/CategoryPage.jsx'
import CardStack from './components/CardStack.jsx'
import CardModal from './components/CardModal.jsx'

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function initDecks(cards, adultMode) {
  const filtered = adultMode ? cards : cards.filter(c => !c.adult)
  return {
    spielvorbereitung: {
      remaining: shuffle(filtered.filter(c => c.usage === 'spielvorbereitung')),
      drawn: [],
    },
    quest: {
      remaining: shuffle(filtered.filter(c => c.usage === 'quest')),
    },
    spiel: {
      remaining: shuffle(filtered.filter(c => c.usage === 'spiel')),
      drawn: [],
    },
    questschein: {
      remaining: shuffle(filtered.filter(c => c.usage === 'questschein')),
      drawn: [],
    },
  }
}

const initialState = {
  gameStarted: false,
  adultMode: false,
  cards: [],
  decks: {
    spielvorbereitung: { remaining: [], drawn: [] },
    quest: { remaining: [] },
    spiel: { remaining: [], drawn: [] },
    questschein: { remaining: [], drawn: [] },
  },
  activeCard: null,
  activeCategory: null,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_CARDS': {
      const decks = initDecks(action.cards, state.adultMode)
      return { ...state, cards: action.cards, decks, error: null }
    }
    case 'LOAD_ERROR': {
      return { ...state, error: action.message }
    }
    case 'START_GAME': {
      const decks = initDecks(state.cards, state.adultMode)
      return { ...state, gameStarted: true, decks }
    }
    case 'NEW_GAME': {
      const decks = initDecks(state.cards, state.adultMode)
      return { ...state, gameStarted: false, decks, activeCard: null, activeCategory: null }
    }
    case 'TOGGLE_ADULT_MODE': {
      const adultMode = !state.adultMode
      const decks = initDecks(state.cards, adultMode)
      return { ...state, adultMode, decks, activeCard: null }
    }
    case 'SET_CATEGORY': {
      return { ...state, activeCategory: action.category, activeCard: null }
    }
    case 'DRAW_CARD': {
      const category = state.activeCategory
      const deck = state.decks[category]
      if (!deck || deck.remaining.length === 0) return state

      const idx = Math.floor(Math.random() * deck.remaining.length)
      const card = deck.remaining[idx]

      if (category === 'quest') {
        return { ...state, activeCard: { ...card, flipped: false } }
      } else {
        const remaining = [...deck.remaining]
        remaining.splice(idx, 1)
        const drawn = [...deck.drawn, card]
        return {
          ...state,
          activeCard: { ...card, flipped: false },
          decks: {
            ...state.decks,
            [category]: { remaining, drawn },
          },
        }
      }
    }
    case 'FLIP_CARD': {
      if (!state.activeCard) return state
      return { ...state, activeCard: { ...state.activeCard, flipped: true } }
    }
    case 'CLOSE_MODAL': {
      return { ...state, activeCard: null }
    }
    case 'RESHUFFLE_DECK': {
      const category = state.activeCategory
      const deck = state.decks[category]
      if (!deck || !deck.drawn) return state
      const remaining = shuffle([...deck.remaining, ...deck.drawn])
      return {
        ...state,
        decks: {
          ...state.decks,
          [category]: { remaining, drawn: [] },
        },
      }
    }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}karten/cards_db.json`)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then(data => {
        const cards = Array.isArray(data) ? data : data.cards
        dispatch({ type: 'LOAD_CARDS', cards })
      })
      .catch(() => {
        dispatch({
          type: 'LOAD_ERROR',
          message:
            'cards_db.json konnte nicht geladen werden. Stellen Sie sicher, dass public/karten/cards_db.json vorhanden ist.',
        })
      })
  }, [])

  if (state.error) {
    return (
      <div className="error-screen">
        <p>{state.error}</p>
      </div>
    )
  }

  return (
    <div className="app">
      {!state.gameStarted && <HomePage state={state} dispatch={dispatch} />}
      {state.gameStarted && !state.activeCategory && (
        <CategoryPage state={state} dispatch={dispatch} />
      )}
      {state.gameStarted && state.activeCategory && (
        <CardStack state={state} dispatch={dispatch} />
      )}
      {state.activeCard && <CardModal state={state} dispatch={dispatch} />}
    </div>
  )
}
