# Chameleon game

Based on the board game Chameleon by Waddingtons.

## Rules

Take turn placing tiles on the grid. If you place a tile touching another tile of the opposite colour, the other tile changes to your colour. The game ends when neither player can place a tile. The player with the most squares of their colour at the end of the game wins.

## Running the game

Use `nuxi-docker` to run the game.

When first installed:
```bash
npx nuxi-docker yarn install
```

To run the game:
```bash
npx nuxi-docker up -d

npx nuxi-docker dev
```