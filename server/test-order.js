const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const order = await prisma.order.findUnique({
    where: { orderNumber: "TR1785142252547" }
  });
  console.log(order);
}
main().catch(console.error).finally(() => prisma.$disconnect());
