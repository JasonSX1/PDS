import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    search: string,
  ) {
    const results = await this.prisma.product.findMany({
      skip: page * size,
      take: Number(size),
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        [sort]: order,
      },
      include: {
        supplier: true,
        category: true,
        promotion: true,
        stock: true,
      },
    });

    const resultsWithQuantity = results.map(product => ({
      ...product,
      quantity: product.stock?.quantity ?? 0,
    }));

    const totalItems = await this.prisma.product.count({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return { results: resultsWithQuantity, totalItems };
  }

  async findById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
        promotion: true,
        stock: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return { ...product, quantity: product.stock?.quantity ?? 0 };
  }

  async create(dto: CreateProductDto) {
    // Cria o produto
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        size: dto.size,
        color: dto.color,
        supplierId: dto.supplierId,
        categoryId: dto.categoryId ?? null,
        promotionId: dto.promotionId,
      },
    });
    // Cria o estoque
    await this.prisma.stock.create({
      data: {
        productId: product.id,
        quantity: dto.quantity,
      },
    });
    // Retorna o produto com os relacionamentos e quantidade
    const productWithRelations = await this.prisma.product.findUnique({
      where: { id: product.id },
      include: {
        supplier: true,
        category: true,
        promotion: true,
        stock: true,
      },
    });
    return { ...productWithRelations, quantity: productWithRelations?.stock?.quantity ?? 0 };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        size: dto.size,
        color: dto.color,
        supplierId: dto.supplierId,
        categoryId: dto.categoryId,
        promotionId: dto.promotionId,
      },
    });

    if (dto.quantity !== undefined) {
      await this.prisma.stock.upsert({
        where: { productId: id },
        update: { quantity: dto.quantity },
        create: { productId: id, quantity: dto.quantity },
      });
    }

    const productWithRelations = await this.prisma.product.findUnique({
      where: { id: product.id },
      include: {
        supplier: true,
        category: true,
        promotion: true,
        stock: true,
      },
    });
    return { ...productWithRelations, quantity: productWithRelations?.stock?.quantity ?? 0 };
  }

  async remove(id: number) {
    await this.prisma.stock.deleteMany({ where: { productId: id } });
    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
