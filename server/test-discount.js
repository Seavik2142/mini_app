const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const prod = await prisma.product.findFirst();
    if (prod) {
        console.log("Before:", prod);
        const updated = await prisma.product.update({
            where: { id: prod.id },
            data: { discount: 20, isOnSale: true }
        });
        console.log("After:", updated);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
