-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerOneSlug" TEXT NOT NULL,
    "playerTwoSlug" TEXT NOT NULL,
    "gameState" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_playerOneSlug_key" ON "Game"("playerOneSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Game_playerTwoSlug_key" ON "Game"("playerTwoSlug");
