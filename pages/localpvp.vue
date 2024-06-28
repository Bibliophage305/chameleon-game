<script setup>
const { humanPlayer } = usePlayer();
const { pieceChoices, pieceCounts, constructGame, GameType } = useGame();
const playerOne = humanPlayer("Player 1", "orange", pieceChoices(), pieceCounts());
const playerTwo = humanPlayer("Player 2", "yellow", pieceChoices(), pieceCounts());
const game = constructGame(playerOne, playerTwo, GameType.LocalPVP);
</script>

<template>
  <ClientOnly>
    <Game :game="game" />
  </ClientOnly>
</template>
