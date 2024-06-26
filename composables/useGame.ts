enum GameType {
  LocalPVP,
  Computer,
  RemotePVP,
}

const gameFactory = () => {
  return function (playerOne: Object, playerTwo: Object, gameType: GameType) {
    const players = [playerOne, playerTwo];
    const turn = ref(0);
    const placedPieces: Array<any> = [];
    const occupiedCells: { [key: number]: number } = {};

    const setTurn = (value: number) => {
      turn.value = value;
    };

    const setPlayers = (playerOne: Object, playerTwo: Object) => {
      const { playerFactory } = usePlayer();
      players[0] = playerFactory(
        playerOne.playerType,
        playerOne.name,
        playerOne.colour,
        ref(playerOne.pieces),
        ref(playerOne.piecesLeft),
        playerOne.playerID
      );
      players[1] = playerFactory(
        playerTwo.playerType,
        playerTwo.name,
        playerTwo.colour,
        ref(playerTwo.pieces),
        ref(playerTwo.piecesLeft),
        playerTwo.playerID
      );
    };

    const toJson = () => {
      const ret = {
        players: players.map((player) => player.toJson()),
        turn: turn.value,
        placedPieces: placedPieces.map((piece) => ({
          x: piece.x,
          y: piece.y,
          piece: piece.piece,
          colour: piece.colour,
        })),
        occupiedCells: occupiedCells,
        gameType: gameType,
      };
      return ret;
    };

    const nextTurn = () => turn.value++;
    const activePlayer = computed(() => players[turn.value % 2]);
    const inactivePlayer = computed(() => players[(turn.value + 1) % 2]);

    const currentPlayersMove = computed(() => {
      switch (gameType) {
        case GameType.LocalPVP:
          return activePlayer.value.isHuman;
        case GameType.Computer:
          return activePlayer.value.isHuman;
        case GameType.RemotePVP:
          const route = useRoute();
          return route.params.id == activePlayer.value.playerID;
      }
    });

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
            if (y + i - 1 >= 0 && (x + j) * 9 + (y + i - 1) in occupiedCells) {
              touchingPieces.push(occupiedCells[(x + j) * 9 + (y + i - 1)]);
            }
            if (y + i + 1 < 9 && (x + j) * 9 + (y + i + 1) in occupiedCells) {
              touchingPieces.push(occupiedCells[(x + j) * 9 + (y + i + 1)]);
            }
            if (x + j - 1 >= 0 && (x + j - 1) * 9 + (y + i) in occupiedCells) {
              touchingPieces.push(occupiedCells[(x + j - 1) * 9 + (y + i)]);
            }
            if (x + j + 1 < 9 && (x + j + 1) * 9 + (y + i) in occupiedCells) {
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

    const setPlacedPieces = (pieces: Array<any>) => {
      placedPieces.splice(0, placedPieces.length);
      for (const piece of pieces) {
        placedPieces.push(piece);
      }
    };

    const setOccupiedCells = (cells: { [key: number]: number }) => {
      for (const key in occupiedCells) {
        delete occupiedCells[key];
      }
      for (const key in cells) {
        occupiedCells[key] = cells[key];
      }
    };

    const legalMoves = (player: Object) => {
      const availableMoves = [];
      for (const piece of player.availablePieces.value) {
        for (let x = 0; x < 9; x++) {
          for (let y = 0; y < 9; y++) {
            if (canPlacePiece(x, y, piece)) {
              availableMoves.push({ x, y, piece });
            }
          }
        }
      }
      return availableMoves;
    };

    const activePlayerCanMove = computed(
      () => legalMoves(activePlayer.value).length > 0
    );

    const inactivePlayerCanMove = computed(
      () => legalMoves(inactivePlayer.value).length > 0
    );

    const isOver = computed(
      () => !activePlayerCanMove.value && !inactivePlayerCanMove.value
    );

    const computerMove = async () => {
      // wait one second before making a move
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const availableMoves = legalMoves(activePlayer.value);
      const move =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      return move;
    };

    const getWinner = () => {
      let playerOneScore = 0;
      let playerTwoScore = 0;
      for (const piece of placedPieces) {
        if (piece.colour === players[0].colour) {
          playerOneScore += piece.piece.flat().filter((x) => x).length;
        } else {
          playerTwoScore += piece.piece.flat().filter((x) => x).length;
        }
      }
      if (playerOneScore > playerTwoScore) {
        return players[0];
      } else if (playerTwoScore > playerOneScore) {
        return players[1];
      } else {
        return null;
      }
    };

    return {
      players,
      activePlayer,
      activePlayerCanMove,
      inactivePlayer,
      inactivePlayerCanMove,
      placedPieces,
      placePiece,
      occupiedCells,
      canPlacePiece,
      turn,
      nextTurn,
      computerMove,
      isOver,
      getWinner,
      toJson,
      currentPlayersMove,
      setTurn,
      setPlacedPieces,
      setOccupiedCells,
      setPlayers,
      gameType,
    };
  };
};

export default function () {
  const pieceCounts = () => ref([1, 1, 1, 2, 1, 3, 3, 1]);
  const pieceChoices = () =>
    ref([
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

  const constructGame = gameFactory();
  return {
    pieceCounts,
    pieceChoices,
    constructGame,
    GameType,
  };
}
