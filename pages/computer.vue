<script setup>
const { humanPlayer, computerPlayer } = usePlayer();
const { pieceChoices, pieceCounts, constructGame, GameType } = useGame();
const humanPlaysFirst = Math.round(Math.random());
let playerOne, playerTwo;
if (humanPlaysFirst) {
  playerOne = humanPlayer("Player", "orange", pieceChoices(), pieceCounts());
  playerTwo = computerPlayer(
    "Computer",
    "yellow",
    pieceChoices(),
    pieceCounts()
  );
} else {
  playerOne = computerPlayer(
    "Computer",
    "orange",
    pieceChoices(),
    pieceCounts()
  );
  playerTwo = humanPlayer("Player", "yellow", pieceChoices(), pieceCounts());
}
const game = constructGame(playerOne, playerTwo, GameType.Computer);
</script>

<template>
  <ClientOnly>
    <Game :game="game" />
  </ClientOnly>
</template>
