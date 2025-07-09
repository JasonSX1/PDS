import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Camiseta', description: 'Roupas do tipo camiseta' },
    { name: 'Calça', description: 'Roupas do tipo calça' },
    { name: 'Lingerie', description: 'Roupas íntimas' },
    { name: 'Pijama', description: 'Roupas para dormir' },
    { name: 'Acessório', description: 'Acessórios diversos' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Categorias inseridas com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 