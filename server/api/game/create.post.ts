export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await prisma.game.create({
    data: { gameState: body?.gameState ?? {} },
  });
});
