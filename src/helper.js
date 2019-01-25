/**
 * Shuffles and array
 * Wy is this not a build in js function? :)
 */
export const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    let randomKey = Math.floor(Math.random() * i);
    let randomElement = array[randomKey];
    array[randomKey] = array[i];
    array[i] = randomElement;
  }
  return array;
};

/**
 * Determine the winner(s) based on the score
 */
export const getWinners = players => {
  return players.reduce((winners, player) => {
    if (!winners.length || (winners.length && player.score === winners[0].score)) {
      winners.push(player);
    } else if (player.score > winners[0].score) {
      winners = [player];
    }
    return winners;
  }, []);
};
