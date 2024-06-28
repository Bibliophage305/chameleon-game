<script setup>
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const { data: gameState } = await useFetch(`/api/game/${route.params.id}`);
const gameStateParsed = JSON.parse(JSON.stringify(gameState.value.gameState));

const { fromJSON } = usePlayer();
const { constructGame, GameType } = useGame();
const game = constructGame(
  fromJSON(gameStateParsed.players[0]),
  fromJSON(gameStateParsed.players[1]),
  GameType.RemotePVP
);
game.setTurn(gameStateParsed.turn);
game.setPlacedPieces(gameStateParsed.placedPieces);
watch(game.turn, async () => {
  await $fetch(`/api/game/${route.params.id}`, {
    method: "POST",
    body: { gameState: game.toJson() },
  });
});
const opponentLink = computed(() => {
  const opponentSlug =
    gameState.value.playerOneSlug === route.params.id
      ? gameState.value.playerTwoSlug
      : gameState.value.playerOneSlug;
  const url = new URL(
    `/pvp/${opponentSlug}`,
    runtimeConfig.public.origin
  ).toString();
  return url;
});

const justCopied = ref(false);

const copyOpponentLink = () => {
  navigator.clipboard.writeText(opponentLink.value);
  justCopied.value = true;
  setTimeout(() => {
    justCopied.value = false;
  }, 2000);
};

const updateBoard = async () => {
  if (!game.currentPlayersMove.value) {
    const gameState = await $fetch(`/api/game/${route.params.id}`);
    game.setTurn(gameState.gameState.turn);
    game.setPlacedPieces(gameState.gameState.placedPieces);
    game.setPlayers(...gameState.gameState.players);
  }
  setTimeout(updateBoard, 5000);
};

updateBoard();
</script>

<template>
  <div>
    <button
      class="fixed bottom-0 right-0 m-4 p-2 bg-blue-500 text-white rounded"
      @click="copyOpponentLink"
    >
      {{ justCopied ? "Copied!" : "Copy opponent's link to clipboard" }}
    </button>
    <ClientOnly>
      <Game :game="game" />
    </ClientOnly>
  </div>
</template>
