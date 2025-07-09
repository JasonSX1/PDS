-- DropForeignKey
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_fornecedorID_fkey";

-- AlterTable
ALTER TABLE "Fornecedor" ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "Produto" ALTER COLUMN "fornecedorID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_fornecedorID_fkey" FOREIGN KEY ("fornecedorID") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
