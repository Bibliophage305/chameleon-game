<script setup>
const props = defineProps({
  cells: Array,
  colour: String,
  borderWeight: {
    type: Number,
    default: 1,
  },
  borderColour: {
    type: String,
    default: "black",
  },
  cellClasses: {
    type: String,
    default: "",
  },
});

const height = computed(() => props.cells.length);
const width = computed(() => props.cells[0].length);

const borderClasses = computed(() => {
  return {
    top: [
      { black: "border-black", red: "border-red-500" }[props.borderColour],
      ["border-t-0", "border-t-1", "border-t-2", "border-t-3", "border-t-4"][
        props.borderWeight
      ],
    ].join(" "),
    right: [
      { black: "border-black", red: "border-red-500" }[props.borderColour],
      ["border-r-0", "border-r-1", "border-r-2", "border-r-3", "border-r-4"][
        props.borderWeight
      ],
    ].join(" "),
    left: [
      { black: "border-black", red: "border-red-500" }[props.borderColour],
      ["border-l-0", "border-l-1", "border-l-2", "border-l-3", "border-l-4"][
        props.borderWeight
      ],
    ].join(" "),
    bottom: [
      { black: "border-black", red: "border-red-500" }[props.borderColour],
      ["border-b-0", "border-b-1", "border-b-2", "border-b-3", "border-b-4"][
        props.borderWeight
      ],
    ].join(" "),
  };
});
</script>

<template>
  <div
    class="grid h-full"
    :class="[`grid-rows-${height}`, `grid-cols-${width}`]"
  >
    <template v-for="(row, rowIndex) in cells">
      <div
        v-for="(cell, colIndex) in row"
        class="aspect-square"
        :class="{
          'bg-orange-500': colour == 'orange' && cell,
          'bg-yellow-500': colour == 'yellow' && cell,
          [borderClasses.top]:
            cell && (rowIndex === 0 || !cells[rowIndex - 1][colIndex]),
          [borderClasses.left]:
            cell && (colIndex === 0 || !cells[rowIndex][colIndex - 1]),
          [borderClasses.bottom]:
            cell && (rowIndex === height - 1 || !cells[rowIndex + 1][colIndex]),
          [borderClasses.right]:
            cell && (colIndex === width - 1 || !cells[rowIndex][colIndex + 1]),
          [cellClasses]: true,
        }"
      ></div>
    </template>
  </div>
</template>
