<script setup>
import VueDraggableResizable from "vue-draggable-resizable";

const turn = ref(0);

const activeColour = computed(() => (turn.value === 0 ? "orange" : "yellow"));

const gridDimension = ref(50);

const pieceChoiceIndex = ref(0);

const pieceX = ref(0);
const pieceY = ref(0);

const pieceCounts = ref([
  [1, 1, 1, 2, 1, 3, 3, 1],
  [1, 1, 1, 2, 1, 3, 3, 1],
]);

const pieceChoices = ref([
  [[true, true, true, true, true]],
  [
    [true, true, true],
    [false, true, false],
    [false, true, false],
  ],
  [
    [true, true, true],
    [false, true, false],
  ],
  [
    [true, true],
    [true, false],
  ],
  [
    [false, true, false],
    [true, true, true],
    [false, true, false],
  ],
  [[true, true, true]],
  [[true, true]],
  [
    [true, true],
    [true, true],
  ],
]);

const placedPieces = ref([]);
const occupiedCells = ref({});

const activePiece = computed(() => pieceChoices.value[pieceChoiceIndex.value]);
const activePieceHeight = computed(
  () => activePiece.value.length * gridDimension.value
);
const activePieceWidth = computed(
  () => activePiece.value[0].length * gridDimension.value
);

const choosePiece = (index) => {
  if (index === pieceChoiceIndex.value) {
    return;
  }
  if (pieceCounts.value[turn.value][index] === 0) {
    return;
  }
  pieceChoiceIndex.value = index;
  pieceX.value = 0;
  pieceY.value = 0;
};

const canPlacePiece = computed(() => {
  for (let i = 0; i < activePiece.value.length; i++) {
    for (let j = 0; j < activePiece.value[0].length; j++) {
      if (
        activePiece.value[i][j] &&
        (pieceX.value + j < 0 ||
          pieceX.value + j >= 9 ||
          pieceY.value + i < 0 ||
          pieceY.value + i >= 9 ||
          occupiedCells.value[(pieceX.value + j) * 9 + (pieceY.value + i)] !==
            undefined)
      ) {
        return false;
      }
    }
  }
  return true;
});

const placePiece = async () => {
  if (!canPlacePiece.value) {
    return;
  }
  placedPieces.value.push({
    x: pieceX.value,
    y: pieceY.value,
    piece: activePiece.value.map((row) => [...row]),
    colour: turn.value === 0 ? "orange" : "yellow",
  });
  for (let i = 0; i < activePiece.value.length; i++) {
    for (let j = 0; j < activePiece.value[0].length; j++) {
      if (activePiece.value[i][j]) {
        occupiedCells.value[(pieceX.value + j) * 9 + (pieceY.value + i)] =
          placedPieces.value.length - 1;
      }
    }
  }
  const touchingPieces = [];
  for (let i = 0; i < activePiece.value.length; i++) {
    for (let j = 0; j < activePiece.value[0].length; j++) {
      if (activePiece.value[i][j]) {
        if (
          pieceY.value + i - 1 >= 0 &&
          (pieceX.value + j) * 9 + (pieceY.value + i - 1) in occupiedCells.value
        ) {
          touchingPieces.push(
            occupiedCells.value[(pieceX.value + j) * 9 + (pieceY.value + i - 1)]
          );
        }
        if (
          pieceY.value + i + 1 < 9 &&
          (pieceX.value + j) * 9 + (pieceY.value + i + 1) in occupiedCells.value
        ) {
          touchingPieces.push(
            occupiedCells.value[(pieceX.value + j) * 9 + (pieceY.value + i + 1)]
          );
        }
        if (
          pieceX.value + j - 1 >= 0 &&
          (pieceX.value + j - 1) * 9 + (pieceY.value + i) in occupiedCells.value
        ) {
          touchingPieces.push(
            occupiedCells.value[(pieceX.value + j - 1) * 9 + (pieceY.value + i)]
          );
        }
        if (
          pieceX.value + j + 1 < 9 &&
          (pieceX.value + j + 1) * 9 + (pieceY.value + i) in occupiedCells.value
        ) {
          touchingPieces.push(
            occupiedCells.value[(pieceX.value + j + 1) * 9 + (pieceY.value + i)]
          );
        }
      }
    }
  }
  // remove duplicates, remove the piece that was just placed, and set the colour of the touching pieces
  [...new Set(touchingPieces)]
    .filter((piece) => piece !== placedPieces.value.length - 1)
    .forEach((piece) => {
      placedPieces.value[piece].colour = activeColour.value;
    });
  pieceCounts.value[turn.value][pieceChoiceIndex.value]--;
  turn.value = turn.value === 0 ? 1 : 0;
  pieceX.value = 0;
  pieceY.value = 0;
  // have to wait for the x and y to actually update, otherwise it might spawn the new piece in a
  // limited area and break the height and width restrictions
  await nextTick();
  pieceChoiceIndex.value = 0;
  while (pieceCounts.value[turn.value][pieceChoiceIndex.value] === 0) {
    pieceChoiceIndex.value++;
  }
};

const rotatePieces = async () => {
  pieceX.value = 0;
  pieceY.value = 0;
  await nextTick();
  pieceChoices.value.forEach((piece, index) => {
    const newPiece = [];
    for (let i = 0; i < piece[0].length; i++) {
      const newRow = [];
      for (let j = piece.length - 1; j >= 0; j--) {
        newRow.push(piece[j][i]);
      }
      newPiece.push(newRow);
    }
    pieceChoices.value[index] = newPiece;
  });
};

const onDrag = (x, y) => {
  pieceX.value = x / gridDimension.value;
  pieceY.value = y / gridDimension.value;
};
</script>

<style>
@import "vue-draggable-resizable/style.css";
</style>

<template>
  <div class="flex flex-col w-full h-screen justify-center items-center">
    <div class="flex flex-row gap-2">
      {{ turn === 0 ? "Orange's turn" : "Yellow's turn" }}
    </div>
    <div class="flex flex-row gap-2">
      <div class="grid grid-cols-8 justify-center items-center gap-2 h-24">
        <div
          v-for="(piece, index) in pieceChoices"
          :key="index"
          class="flex flex-col items-center justify-between w-20"
        >
          <Piece
            :cells="piece"
            :colour="turn === 0 ? 'orange' : 'yellow'"
            :borderWeight="1"
            :cellClasses="'w-4 h-4'"
            @click="choosePiece(index)"
          />
          x{{ pieceCounts[turn][index] }}
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
        height: `${gridDimension * 9}px`,
        width: `${gridDimension * 9}px`,
      }"
      class="border border-blue-500 m-4 bg-slate-300 relative"
    >
      <div
        class="absolute w-full h-full grid grid-rows-9 grid-cols-9"
        :style="{
          height: `${gridDimension * 9}px`,
          width: `${gridDimension * 9}px`,
        }"
      >
        <div v-for="i in 81" class="border border-blue-500"></div>
      </div>
      <div
        v-for="piece in placedPieces"
        class="absolute"
        :style="{
          height: `${gridDimension * piece.piece.length}px`,
          width: `${gridDimension * piece.piece[0].length}px`,
          top: `${gridDimension * piece.y}px`,
          left: `${gridDimension * piece.x}px`,
        }"
      >
        <Piece :cells="piece.piece" :colour="piece.colour" />
      </div>
      <vue-draggable-resizable
        :parent="true"
        :grid="[gridDimension, gridDimension]"
        :resizable="false"
        :w="activePieceWidth"
        :h="activePieceHeight"
        :x="pieceX * gridDimension"
        :y="pieceY * gridDimension"
        @dragging="onDrag"
        class-name="border-0"
      >
        <Piece
          :cells="activePiece"
          :colour="activeColour"
          :borderWeight="4"
          :borderColour="canPlacePiece ? 'black' : 'red'"
        />
      </vue-draggable-resizable>
    </div>
    <div class="flex flex-row w-full justify-center items-center">
      <button
        @click="placePiece"
        class="text-white py-2 px-3 rounded-lg"
        :class="canPlacePiece ? 'bg-blue-500' : 'bg-gray-500'"
        :disabled="!canPlacePiece"
      >
        Confirm piece
      </button>
    </div>
  </div>
</template>
