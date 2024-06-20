export default function () {
  return function (
    pieceChoices: Array<Array<boolean>>,
    pieceCounts: Array<number>
  ) {
    const player = usePlayer();
    const players = [
      player("Player 1", "orange", pieceChoices, [...pieceCounts]),
      player("Player 2", "yellow", pieceChoices, [...pieceCounts]),
    ];
    const getActivePlayer = (turn: number) => players[turn % 2];
    const placedPieces: Array<any> = [];
    const occupiedCells: { [key: number]: number } = {};
    const placePiece = (
      x: number,
      y: number,
      piece: Array<Array<boolean>>,
      colour: string
    ) => {
      placedPieces.push({ x, y, piece, colour });
      for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[0].length; j++) {
          if (piece[i][j]) {
            occupiedCells[(x + j) * 9 + (y + i)] = placedPieces.length - 1;
          }
        }
      }
      const touchingPieces = [];
      for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[0].length; j++) {
          if (piece[i][j]) {
            if (
              y + i - 1 >= 0 &&
              (x + j) * 9 + (y + i - 1) in occupiedCells
            ) {
              touchingPieces.push(occupiedCells[(x + j) * 9 + (y + i - 1)]);
            }
            if (
              y + i + 1 < 9 &&
              (x + j) * 9 + (y + i + 1) in occupiedCells
            ) {
              touchingPieces.push(occupiedCells[(x + j) * 9 + (y + i + 1)]);
            }
            if (
              x + j - 1 >= 0 &&
              (x + j - 1) * 9 + (y + i) in occupiedCells
            ) {
              touchingPieces.push(occupiedCells[(x + j - 1) * 9 + (y + i)]);
            }
            if (
              x + j + 1 < 9 &&
              (x + j + 1) * 9 + (y + i) in occupiedCells
            ) {
              touchingPieces.push(occupiedCells[(x + j + 1) * 9 + (y + i)]);
            }
          }
        }
      }
      [...new Set(touchingPieces)]
        .filter((piece) => piece !== placedPieces.length - 1)
        .forEach((piece) => {
          placedPieces[piece].colour = colour;
        });
    };

    const canPlacePiece = (
      x: number,
      y: number,
      piece: Array<Array<boolean>>
    ) => {
      for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[0].length; j++) {
          if (
            piece[i][j] &&
            (x + j < 0 ||
              x + j >= 9 ||
              y + i < 0 ||
              y + i >= 9 ||
              occupiedCells[(x + j) * 9 + (y + i)] !== undefined)
          ) {
            return false;
          }
        }
      }
      return true;
    };

    return {
      players,
      getActivePlayer,
      placedPieces,
      placePiece,
      occupiedCells,
      canPlacePiece,
    };
  };
}
