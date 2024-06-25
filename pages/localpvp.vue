<script setup>
const { humanPlayer } = usePlayer();
const { pieceChoices, pieceCounts } = useGame();
const playerOne = humanPlayer("Player 1", "orange", pieceChoices(), pieceCounts());
const playerTwo = humanPlayer("Player 2", "yellow", pieceChoices(), pieceCounts());

</script>

<template>
  <ClientOnly>
    <Game :playerOne="playerOne" :playerTwo="playerTwo" />
  </ClientOnly>
</template>
