enum PlayerType {
  Human,
  Computer,
}

const removeDuplicates = (
  nestedArray: Array<Array<Array<boolean>>>
): Array<Array<Array<boolean>>> => {
  // Function to serialize an array to a string
  const serialize = (arr: Array<Array<boolean>>): string => JSON.stringify(arr);

  // Function to deserialize a string back to an array
  const deserialize = (str: string): Array<Array<boolean>> => JSON.parse(str);

  // Create a Set to store unique serialized arrays
  const uniqueSet: Set<string> = new Set();

  // Loop through each sub-array and add its serialized version to the Set
  nestedArray.forEach((subArray) => {
    uniqueSet.add(serialize(subArray));
  });

  // Convert the Set back to an array of arrays
  const uniqueArray = Array.from(uniqueSet).map(deserialize);

  return uniqueArray;
};

const playerFactory = () => {
  return function (
    playerType: PlayerType,
    name: string,
    colour: string,
    pieces: Ref<Array<Array<boolean>>>,
    piecesLeft: Ref<Array<number>>
  ) {
    const isHuman = playerType === PlayerType.Human;
    const isComputer = playerType === PlayerType.Computer;
    const availablePieces = computed(() => {
      const ret = [];
      for (let i = 0; i < piecesLeft.value.length; i++) {
        if (piecesLeft.value[i] > 0) {
          // make a deep copy of pieces.value[i]
          let piece = JSON.parse(JSON.stringify(pieces.value[i]));
          for (let rotation = 0; rotation < 4; rotation++) {
            ret.push(piece);
            const newPiece = [];
            for (let rowIndex = 0; rowIndex < piece[0].length; rowIndex++) {
              const newRow = [];
              for (
                let columnIndex = piece.length - 1;
                columnIndex >= 0;
                columnIndex--
              ) {
                newRow.push(piece[columnIndex][rowIndex]);
              }
              newPiece.push(newRow);
            }
            piece = newPiece;
          }
        }
      }
      return removeDuplicates(ret);
    });
    const reducePiece = (pieceIndex: number) => {
      piecesLeft.value[pieceIndex] -= 1;
    };
    return {
      name,
      colour,
      pieces,
      piecesLeft,
      playerType,
      isHuman,
      isComputer,
      reducePiece,
      availablePieces,
    };
  };
};

const humanPlayerFactory = () => {
  const factory = playerFactory();
  return function (
    name: string,
    colour: string,
    pieces: Ref<Array<Array<boolean>>>,
    piecesLeft: Ref<Array<number>>
  ) {
    return factory(PlayerType.Human, name, colour, pieces, piecesLeft);
  };
};

const computerPlayerFactory = () => {
  const factory = playerFactory();
  return function (
    name: string,
    colour: string,
    pieces: Ref<Array<Array<boolean>>>,
    piecesLeft: Ref<Array<number>>
  ) {
    return factory(PlayerType.Computer, name, colour, pieces, piecesLeft);
  };
};

export default function () {
  const humanPlayer = humanPlayerFactory();
  const computerPlayer = computerPlayerFactory();
  return { humanPlayer, computerPlayer };
}
