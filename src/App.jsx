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

// Derive deck key from a card: schein cards are grouped by id prefix, others by type.
export function getDeckKey(card) {
  if (card.type === 'schein') {
    const parts = card.id.split('_')
    parts.pop() // remove trailing number
    return parts.join('_')
  }
  return card.type
}

function initDecks(cards, adultMode) {
  const filtered = adultMode ? cards : cards.filter(c => !c.adult)
  const deckMap = {}

  for (const card of filtered) {
    const key = getDeckKey(card)
    const isQuest = card.usage === 'quest'
    if (!deckMap[key]) {
      deckMap[key] = isQuest
        ? { remaining: [], usage: card.usage }
        : { remaining: [], drawn: [], usage: card.usage }
    }
    deckMap[key].remaining.push(card)
  }

  for (const key of Object.keys(deckMap)) {
    deckMap[key].remaining = shuffle(deckMap[key].remaining)
  }

  return deckMap
}

const initialState = {
  gameStarted: false,
  adultMode: false,
  cards: [],
  decks: {},
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
      const { deckKey } = action.payload
      const deck = state.decks[deckKey]
      if (!deck || deck.remaining.length === 0) return state

      const idx = Math.floor(Math.random() * deck.remaining.length)
      const card = deck.remaining[idx]
      const isQuest = !('drawn' in deck)

      if (isQuest) {
        return { ...state, activeCard: { ...card, flipped: false } }
      } else {
        const remaining = [...deck.remaining]
        remaining.splice(idx, 1)
        return {
          ...state,
          activeCard: { ...card, flipped: false },
          decks: {
            ...state.decks,
            [deckKey]: { ...deck, remaining, drawn: [...deck.drawn, card] },
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
      const { deckKey } = action.payload
      const deck = state.decks[deckKey]
      if (!deck || !('drawn' in deck)) return state
      const remaining = shuffle([...deck.remaining, ...deck.drawn])
      return {
        ...state,
        decks: {
          ...state.decks,
          [deckKey]: { ...deck, remaining, drawn: [] },
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
