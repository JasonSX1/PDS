/*
  Warnings:

  - You are about to drop the `Categoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductCategories" DROP CONSTRAINT "_ProductCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductCategories" DROP CONSTRAINT "_ProductCategories_B_fkey";

-- DropTable
DROP TABLE "Categoria";

-- DropTable
DROP TABLE "_ProductCategories";
