<script setup>
import VueDraggableResizable from "vue-draggable-resizable";

const props = defineProps({
  playerOne: Object,
  playerTwo: Object,
});

const thinking = ref(false);

const { pieceChoices, pieceCounts, constructGame } = useGame();
const game = constructGame(props.playerOne, props.playerTwo);

const activePlayer = computed(() => game.getActivePlayer());

const pieceChoiceIndex = ref(0);

const activePiece = computed(
  () => activePlayer.value.pieces.value[pieceChoiceIndex.value]
);

const gridCellPixels = ref(50);

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
  if (activePlayer.value.piecesLeft.value[index] === 0) {
    return;
  }
  pieceChoiceIndex.value = index;
  pieceX.value = 0;
  pieceY.value = 0;
};

const canPlacePiece = computed(() =>
  // passing turn is unnecessary, but incrementing it forces the computed prop to update
  game.canPlacePiece(
    pieceX.value,
    pieceY.value,
    activePiece.value,
    game.turn.value
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
    activePlayer.value.colour
  );
};

const placePiece = async (x, y, piece, colour) => {
  game.placePiece(x, y, piece, colour);
  activePlayer.value.reducePiece(pieceChoiceIndex.value);
  game.nextTurn();
  pieceX.value = 0;
  pieceY.value = 0;
  // have to wait for the x and y to actually update, otherwise it might spawn the new piece in a
  // limited area and break the height and width restrictions
  await nextTick();
  pieceChoiceIndex.value = 0;
  while (activePlayer.value.piecesLeft.value[pieceChoiceIndex.value] === 0) {
    pieceChoiceIndex.value++;
  }
  await updateGame();
};

const rotatePieces = async () => {
  pieceX.value = 0;
  pieceY.value = 0;
  await nextTick();
  activePlayer.value.pieces.value.forEach((piece, index) => {
    const newPiece = [];
    for (let i = 0; i < piece[0].length; i++) {
      const newRow = [];
      for (let j = piece.length - 1; j >= 0; j--) {
        newRow.push(piece[j][i]);
      }
      newPiece.push(newRow);
    }
    activePlayer.value.pieces.value[index] = newPiece;
  });
};

const onDrag = (x, y) => {
  pieceX.value = x / gridCellPixels.value;
  pieceY.value = y / gridCellPixels.value;
};

const updateGame = async () => {
  if (activePlayer.value.isComputer) {
    thinking.value = true;
    const { x, y, piece } = await game.computerMove();
    placePiece(x, y, piece, activePlayer.value.colour);
    thinking.value = false;
  }
};

await updateGame();
</script>

<style>
@import "vue-draggable-resizable/style.css";
</style>

<template>
  <div class="flex flex-col w-full h-screen justify-center items-center">
    <div class="flex flex-row gap-2">
      <span>{{ activePlayer.name }}'s turn</span>
      <span v-if="thinking">Thinking...</span>
    </div>
    <div class="flex flex-row gap-2">
      <div class="grid grid-cols-8 justify-center items-center gap-2 h-24">
        <div
          v-for="(piece, index) in activePlayer.pieces.value"
          :key="index"
          class="flex flex-col items-center justify-between w-20"
        >
          <Piece
            :cells="piece"
            :colour="activePlayer.colour"
            :borderWeight="1"
            :cellClasses="'w-4 h-4'"
            @click="choosePiece(index)"
          />
          x{{ activePlayer.piecesLeft.value[index] }}
        </div>
      </div>
      <button
        class="flex flex-col items-center justify-center"
        @click="rotatePieces"
      >
        Rotate Pieces
      </button>
    </div>
    <div
      :style="{
        height: `${gridCellPixels * 9}px`,
        width: `${gridCellPixels * 9}px`,
      }"
      class="border border-blue-500 m-4 bg-slate-300 relative"
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
        v-if="!thinking"
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
          :colour="activePlayer.colour"
          :borderWeight="4"
          :borderColour="canPlacePiece ? 'black' : 'red'"
        />
      </vue-draggable-resizable>
    </div>
    <div class="flex flex-row w-full justify-center items-center">
      <button
        @click="placeActivePiece"
        class="text-white py-2 px-3 rounded-lg"
        :class="canPlacePiece ? 'bg-blue-500' : 'bg-gray-500'"
        :disabled="!canPlacePiece"
      >
        Confirm piece
      </button>
    </div>
  </div>
</template>