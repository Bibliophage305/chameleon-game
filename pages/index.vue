<script setup>
const newGame = async () => {
  const baseGameState = await $fetch("/api/game/create", {
    method: "POST",
  }); 
  const { humanPlayer } = usePlayer();
  const { pieceChoices, pieceCounts, constructGame, GameType } = useGame();
  const playerOne = humanPlayer(
    "Player 1",
    "orange",
    pieceChoices(),
    pieceCounts(),
    baseGameState.playerOneSlug
  );
  const playerTwo = humanPlayer(
    "Player 2",
    "yellow",
    pieceChoices(),
    pieceCounts(),
    baseGameState.playerTwoSlug
  );
  const game = constructGame(playerOne, playerTwo, GameType.RemotePVP);
  const response = await $fetch(`/api/game/${baseGameState.id}`, {
    method: "POST",
    body: { gameState: game.toJson() },
  });
  const localPlaysFirst = Math.round(Math.random());
  const slug = localPlaysFirst ? response.playerOneSlug : response.playerTwoSlug;
  await navigateTo(`/pvp/${slug}`);
}
</script>

<template>
  <div class="flex h-screen items-center">
    <div class="flex flex-col w-screen items-center">
      <div class="flex flex-row gap-2">
        <NuxtLink @click="newGame">
          <button class="text-white py-2 px-3 rounded-lg bg-blue-500">
            Online PvP
          </button>
        </NuxtLink>
        <NuxtLink to="/localpvp">
          <button class="text-white py-2 px-3 rounded-lg bg-blue-500">
            Local PvP
          </button>
        </NuxtLink>
        <NuxtLink to="/computer">
          <button class="text-white py-2 px-3 rounded-lg bg-blue-500">
            Play against computer
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
