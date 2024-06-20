export default function () {
  return function (
    name: string,
    colour: string,
    pieces: Array<Array<boolean>>,
    piecesLeft: Array<number>
  ) {
    return {
      name,
      colour,
      pieces,
      piecesLeft,
      reducePiece(pieceIndex: number) {
        this.piecesLeft[pieceIndex] -= 1;
      },
    };
  };
}
