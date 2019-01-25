import React, { Component } from 'react';
import './App.css';
import { shuffle, getWinners } from './helper';
import { PlayerBox, PlayerSelector, Card } from './components';
import { ReactComponent as Loader } from './loader.svg';
import { fetchPhotos } from './Api';

/**
 * Main Application which holds the business logic
 */
class App extends Component {
  defaultState = {
    currentPlayer: {
      id: 1,
      name: '',
      score: 0
    },
    players: [],
    winner: [],
    cards: [],
    visibleCards: [],
    emptyCards: [],
    currentState: 'selectingPlayers'
  };

  state = this.defaultState;

  /** Finite State Machine */
  machine = {
    initial: 'selectingPlayers',
    states: {
      selectingPlayers: { on: { START_GAME: 'startingGame', ADD_PLAYER: 'selectingPlayers' } },
      startingGame: { on: { FETCH_CARDS: 'fetchingCards' } },
      fetchingCards: { on: { CARDS_FETCHED: 'waitingForNextTurn', FETCH_FAILED: 'fetchingError' } },
      fetchingError: { on: { START_GAME: 'startingGame' } },
      waitingForNextTurn: { on: { REVEAL_CARD: 'reavalingCards', GAME_ENDED: 'gameEnded' } },
      reavalingCards: {
        on: {
          REVEAL_CARD: 'reavalingCards',
          CARDS_MATCHED: 'waitingForNextTurn',
          CARDS_MISMATCHED: 'waitingForNextTurn'
        }
      },
      gameEnded: { on: { NEW_GAME: 'selectingPlayers', START_GAME: 'startingGame' } }
    }
  };

  commands = {
    selectingPlayers: () => this.addPlayer(),
    startingGame: () => this.startGame(),
    fetchingCards: () => this.fetchCards(),
    reavalingCards: payload => this.revealCard(payload),
    gameEnded: players => this.getWinners(players)
  };

  transition = (action, payload) => {
    const nextState = this.machine.states[this.state.currentState].on[action];
    const command = () => this.commands[nextState] && this.commands[nextState](payload);
    this.setState({ currentState: nextState }, command);
  };

  /** Lifecyle methods  */
  componentDidUpdate() {
    if (this.isGameOver()) {
      this.transition('GAME_ENDED', this.state.players);
    }
  }

  /** User Action Handlers **/
  handleClickNewGame = () => {
    this.setState(this.defaultState);
  };

  handleClickStartGame = () => this.transition('START_GAME');

  handleCardClick = cardIndex => {
    this.state.visibleCards.length < 2 && this.transition('REVEAL_CARD', { cardIndex });
  };

  handlePlayerSubmit = e => {
    e.preventDefault();
    const { currentPlayer } = this.state;
    currentPlayer.name && this.transition('ADD_PLAYER');
  };

  handlePlayerNameChange = e => {
    this.setState({
      currentPlayer: {
        id: this.state.players.length + 1,
        name: e.target.value,
        score: 0
      }
    });
  };

  /** Helpers **/
  resetScores = () => {
    this.setState({ players: this.state.players.map(p => ({ ...p, score: 0 })) });
  };

  isGameOver = () => {
    const { currentState, cards, emptyCards } = this.state;
    return emptyCards.length === cards.length && currentState === 'waitingForNextTurn';
  };

  getNextPlayer() {
    const { players, currentPlayer } = this.state;
    return players[currentPlayer.id] ? players[currentPlayer.id] : players[0];
  }

  getWinners = player => {
    this.setState({
      winner: getWinners(player)
    });
  };

  /** commands **/
  addPlayer = () => {
    const { players, currentPlayer } = this.state;
    this.setState({
      players: [...players, currentPlayer],
      currentPlayer: {
        // TODO: could be improved with real ids
        id: players.length + 2,
        name: '',
        score: 0
      }
    });
  };

  startGame = () => {
    this.resetScores();
    this.setState({
      visibleCards: [],
      emptyCards: [],
      winner: [],
      currentPlayer: this.state.players[0]
    });
    this.transition('FETCH_CARDS');
  };

  fetchCards = () => {
    fetchPhotos(photos => {
      if (photos.error) {
        this.transition('FETCH_FAILED');
      } else {
        const cards = [...photos, ...photos];
        shuffle(cards);
        this.setState({
          cards
        });
        this.transition('CARDS_FETCHED');
      }
    });
  };

  revealCard = ({ cardIndex }) => {
    const { visibleCards, cards } = this.state;
    const isSecondReveal = visibleCards.length === 1;
    const matched = isSecondReveal && cards[cardIndex].id === cards[visibleCards[0]].id;
    const newVisibleCards = [...visibleCards, cardIndex];

    this.setState({
      visibleCards: newVisibleCards
    });

    matched && this.matchCards(newVisibleCards);
    isSecondReveal && !matched && this.mismatchCards();
  };

  matchCards = newVisibleCards => {
    const { emptyCards, players, currentPlayer } = this.state;
    players[currentPlayer.id - 1].score++;
    this.setState({
      emptyCards: [...emptyCards, ...newVisibleCards],
      visibleCards: [],
      players
    });
    this.transition('CARDS_MATCHED');
  };

  mismatchCards = () => {
    setTimeout(() => {
      this.setState({
        visibleCards: [],
        currentPlayer: this.getNextPlayer()
      });
      this.transition('CARDS_MISMATCHED');
    }, 1000);
  };

  render() {
    const {
      currentPlayer,
      players,
      currentState,
      cards,
      visibleCards,
      emptyCards,
      winner
    } = this.state;

    return (
      <div className="App">
        <div className="background" />
        <div className="header">
          <div className="logo">EyeEmory</div>
        </div>

        {currentState === 'selectingPlayers' && (
          <PlayerSelector
            {...{
              players,
              currentPlayer,
              handlePlayerNameChange: this.handlePlayerNameChange,
              handlePlayerSubmit: this.handlePlayerSubmit,
              handleClickStartGame: this.handleClickStartGame
            }}
          />
        )}

        {currentState !== 'selectingPlayers' && <PlayerBox {...{ players, currentPlayer }} />}

        {currentState === 'fetchingCards' && (
          <div className="loader">
            <Loader />
          </div>
        )}

        {currentState === 'fetchingError' && (
          <div className="centered fetchingError ">
            <div>Sorry, the connection to the image server is not available, please try again.</div>
            <button onClick={this.handleClickStartGame}>Try again</button>
          </div>
        )}

        {(currentState === 'waitingForNextTurn' || currentState === 'reavalingCards') && (
          <div className="cards">
            {cards.map((card, i) => (
              <Card
                isEmpty={emptyCards.includes(i)}
                visible={visibleCards.includes(i)}
                key={i}
                card={card}
                clickHandler={() => this.handleCardClick(i)}
              />
            ))}

            {/* Flexbox: fix to fill empty cards to arange the last cards correctly */}
            {[...Array(10).keys()].map(key => (
              <div key={key} className="emptyFillers" />
            ))}
          </div>
        )}

        {currentState === 'gameEnded' && (
          <div className="congrats">
            <div>
              <h2>Congratulations!</h2>
              The {winner.length > 1 ? 'winners are' : 'winner is'}
            </div>
            {winner.map((w, i) => (
              <div key={i}>{w.name}</div>
            ))}
            <button onClick={this.handleClickNewGame}>Start a new Game</button>
            <button onClick={this.handleClickStartGame}>Revenge</button>
          </div>
        )}
      </div>
    );
  }
}

export default App;
