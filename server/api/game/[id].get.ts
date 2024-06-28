export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return await prisma.game.findFirst({
    where: { OR: [{ id: id }, { playerOneSlug: id }, { playerTwoSlug: id }] },
  });
});
