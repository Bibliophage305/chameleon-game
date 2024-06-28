<script setup>
import VueDraggableResizable from "vue-draggable-resizable";

const props = defineProps({
  game: Object,
});

const { GameType } = useGame();

const thinking = ref(false);

const skippingTurn = ref(false);

const pieceChoiceIndex = ref(0);

const findAllowedPieceIndex = () => {
  while (
    props.game.activePlayer.value.piecesLeft.value[pieceChoiceIndex.value] === 0
  ) {
    pieceChoiceIndex.value++;
    pieceChoiceIndex.value %= props.game.activePlayer.value.pieces.value.length;
  }
};

findAllowedPieceIndex();

watch(props.game.turn, findAllowedPieceIndex);

const activePiece = computed(
  () => props.game.activePlayer.value.pieces.value[pieceChoiceIndex.value]
);

const gridCellPixels = ref(50);

const setGridCellPixels = (width) => {
  const maxGridCellPixels = Math.max(1, (width - 20) / 9);
  gridCellPixels.value = Math.min(maxGridCellPixels, 50);
};

const { width } = useWindowWidth();
watch(width, setGridCellPixels);
onMounted(() => setGridCellPixels(width.value));

const pieceX = ref(0);
const pieceY = ref(0);

const activePieceHeight = computed(
  () => activePiece.value.length * gridCellPixels.value
);
const activePieceWidth = computed(
  () => activePiece.value[0].length * gridCellPixels.value
);

const choosePiece = (index) => {
  if (index === pieceChoiceIndex.value) {
    return;
  }
  if (props.game.activePlayer.value.piecesLeft.value[index] === 0) {
    return;
  }
  pieceChoiceIndex.value = index;
  pieceX.value = 0;
  pieceY.value = 0;
};

const canPlacePiece = computed(() =>
  // passing turn is unnecessary, but incrementing it forces the computed prop to update
  props.game.canPlacePiece(
    pieceX.value,
    pieceY.value,
    activePiece.value,
    props.game.turn.value
  )
);

const placeActivePiece = async () => {
  if (!canPlacePiece.value) {
    return;
  }
  await placePiece(
    pieceX.value,
    pieceY.value,
    activePiece.value,
    props.game.activePlayer.value.colour
  );
};

const placePiece = async (x, y, piece, colour) => {
  props.game.placePiece(x, y, piece, colour);
  props.game.activePlayer.value.reducePiece(pieceChoiceIndex.value);
  props.game.nextTurn();
  pieceX.value = 0;
  pieceY.value = 0;
  // have to wait for the x and y to actually update, otherwise it might spawn the new piece in a
  // limited area and break the height and width restrictions
  await nextTick();
  pieceChoiceIndex.value = 0;
  while (
    props.game.activePlayer.value.piecesLeft.value[pieceChoiceIndex.value] === 0
  ) {
    pieceChoiceIndex.value++;
  }
  await updateGame();
};

const skipTurn = async () => {
  skippingTurn.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  props.game.nextTurn();
  skippingTurn.value = false;
  await updateGame();
};

const rotatePieces = async () => {
  pieceX.value = 0;
  pieceY.value = 0;
  await nextTick();
  props.game.activePlayer.value.pieces.value.forEach((piece, index) => {
    const newPiece = [];
    for (let i = 0; i < piece[0].length; i++) {
      const newRow = [];
      for (let j = piece.length - 1; j >= 0; j--) {
        newRow.push(piece[j][i]);
      }
      newPiece.push(newRow);
    }
    props.game.activePlayer.value.pieces.value[index] = newPiece;
  });
};

const onDrag = (x, y) => {
  pieceX.value = x / gridCellPixels.value;
  pieceY.value = y / gridCellPixels.value;
};

const currentPlayersMove = computed(() => {
  switch (props.game.gameType.value) {
    case GameType.LocalPVP:
      return props.game.activePlayer.value.isHuman;
    case GameType.Computer:
      return props.game.activePlayer.value.isHuman;
    case GameType.RemotePVP:
      const route = useRoute();
      return route.params.id == props.game.activePlayer.value.playerID;
  }
});

const buttonsAreActive = computed(
  () =>
    !props.game.isOver.value && !skippingTurn.value && currentPlayersMove.value
);

const updateGame = async () => {
  if (props.game.isOver.value) {
    return;
  }
  if (!props.game.activePlayerCanMove.value) {
    skipTurn();
    return;
  }
  if (props.game.activePlayer.value.isComputer) {
    thinking.value = true;
    const { x, y, piece } = await props.game.computerMove();
    placePiece(x, y, piece, props.game.activePlayer.value.colour);
    thinking.value = false;
  }
};

await updateGame();
</script>

<style>
@import "vue-draggable-resizable/style.css";
</style>

<template>
  <div class="flex flex-col w-full justify-center items-center mt-2 gap-2">
    <div class="flex flex-row gap-2">
      <span v-if="game.isOver.value">{{ game.getWinner()?.name }} wins!</span>
      <span v-else-if="skippingTurn">
        {{ game.activePlayer.value.name }} can't make a legal move, skipping
        turn...
      </span>
      <template v-else>
        <span v-if="currentPlayersMove"
          >Your turn, {{ game.activePlayer.value.name }}!</span
        >
        <span v-else>{{ game.activePlayer.value.name }} is thinking...</span>
      </template>
    </div>
    <div class="flex flex-col gap-3 mx-2">
      <div
        class="grid grid-cols-4 md:grid-cols-8 justify-center items-center gap-2 h-40 md:h-24"
      >
        <div
          v-for="(piece, index) in game.activePlayer.value.pieces.value"
          :key="index"
          class="flex flex-col items-center justify-between w-20"
        >
          <Piece
            :cells="piece"
            :colour="game.activePlayer.value.colour"
            :borderWeight="1"
            :cellClasses="'w-4 h-4'"
            @click="choosePiece(index)"
          />
          x{{ game.activePlayer.value.piecesLeft.value[index] }}
        </div>
      </div>
      <div class="flex flex-row items-center justify-center gap-6">
        <button
          @click="rotatePieces"
          class="text-white py-2 px-3 rounded-lg"
          :class="buttonsAreActive ? 'bg-blue-500' : 'bg-gray-500'"
          :disabled="!buttonsAreActive"
        >
          Rotate Pieces
        </button>
        <button
          @click="placeActivePiece"
          class="text-white py-2 px-3 rounded-lg"
          :class="
            buttonsAreActive && canPlacePiece ? 'bg-blue-500' : 'bg-gray-500'
          "
          :disabled="!buttonsAreActive || !canPlacePiece"
        >
          Confirm piece
        </button>
      </div>
    </div>
    <div
      :style="{
        height: `${gridCellPixels * 9}px`,
        width: `${gridCellPixels * 9}px`,
      }"
      class="border border-blue-500 bg-slate-300 relative"
    >
      <div
        class="absolute w-full h-full grid grid-rows-9 grid-cols-9"
        :style="{
          height: `${gridCellPixels * 9}px`,
          width: `${gridCellPixels * 9}px`,
        }"
      >
        <div v-for="i in 81" class="border border-blue-500"></div>
      </div>
      <div
        v-for="piece in game.placedPieces"
        class="absolute"
        :style="{
          height: `${gridCellPixels * piece.piece.length}px`,
          width: `${gridCellPixels * piece.piece[0].length}px`,
          top: `${gridCellPixels * piece.y}px`,
          left: `${gridCellPixels * piece.x}px`,
        }"
      >
        <Piece :cells="piece.piece" :colour="piece.colour" />
      </div>
      <vue-draggable-resizable
        v-if="currentPlayersMove && !skippingTurn && !game.isOver.value"
        :parent="true"
        :grid="[gridCellPixels, gridCellPixels]"
        :resizable="false"
        :w="activePieceWidth"
        :h="activePieceHeight"
        :x="pieceX * gridCellPixels"
        :y="pieceY * gridCellPixels"
        @dragging="onDrag"
        class-name="border-0"
      >
        <Piece
          :cells="activePiece"
          :colour="game.activePlayer.value.colour"
          :borderWeight="4"
          :borderColour="canPlacePiece ? 'black' : 'red'"
        />
      </vue-draggable-resizable>
    </div>
  </div>
</template>
