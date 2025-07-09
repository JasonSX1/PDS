-- DropForeignKey
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_categoryId_fkey";

-- AlterTable
ALTER TABLE "Produto" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
