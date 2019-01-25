import React from 'react';

export const PlayerBox = ({ players, currentPlayer }) => (
  <div className="playerBox">
    <div>
      <div className="player">
        <small>Name</small> <small>Score</small>
      </div>
      {players.map(player => (
        <div
          key={player.id}
          className={currentPlayer.id === player.id ? 'player activePlayer' : 'player'}
        >
          <span>{player.name}</span> <div>{player.score} Points</div>
        </div>
      ))}
    </div>
  </div>
);
