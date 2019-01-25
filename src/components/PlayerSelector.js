import React from 'react';

export const PlayerSelector = ({
  players,
  currentPlayer,
  handlePlayerNameChange,
  handlePlayerSubmit,
  handleClickStartGame
}) => {
  return (
    <div className="playerSelector">
      <h2>
        Welcome to <span>EyeEmory!</span>
      </h2>
      <div>The most beautiful memory game you've ever played.</div>
      <br />
      <div>
        <form onSubmit={handlePlayerSubmit}>
          Player {currentPlayer.id}:
          <input
            type="text"
            name="playerName"
            value={currentPlayer.name}
            onChange={handlePlayerNameChange}
            placeholder={`Name of Player ${currentPlayer.id}`}
          />
          <button type="submit">Add Player</button>
        </form>
      </div>
      {players.length > 0 && (
        <div className="registered">
          Horray, <span>{players.slice(-1)[0].name}</span> is in the game!
        </div>
      )}

      {players.length > 0 && (
        <div>
          <button onClick={handleClickStartGame}>Start Game</button>
        </div>
      )}
    </div>
  );
};
