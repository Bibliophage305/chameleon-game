export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const gameID = await prisma.game.findFirst({
    where: { OR: [{ id: id }, { playerOneSlug: id }, { playerTwoSlug: id }] },
    select: {
      id: true,
    },
  });
  return await prisma.game.update({
    where: {
      id: gameID.id,
    },
    data: {
      gameState: body.gameState,
    },
  });
});
