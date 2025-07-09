import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { SaleRepository } from './repository/sale.repository';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SaleService {
  constructor(
    private readonly repository: SaleRepository,
    private readonly prisma: PrismaService
  ) {}

  async paginate(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    search: string,
  ) {
    const { results, totalItems } = await this.repository.paginate(
      page,
      size,
      sort,
      order,
      search,
    );

    const totalPages = Math.ceil(totalItems / size) - 1;
    const currentPage = Number(page);

    return {
      results,
      pagination: {
        length: totalItems,
        size: size,
        lastPage: totalPages,
        page: currentPage,
        startIndex: currentPage * size,
        endIndex: size + (size - 1),
      },
    };
  }

  async findById(id: number) {
    return await this.repository.findById(id);
  }

  async create(dto: CreateSaleDto) {
    try {
      // Validar se o total corresponde aos itens
      const calculatedTotal = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      if (Math.abs(calculatedTotal - dto.total) > 0.01) {
        throw new BadRequestException('O total da venda não corresponde à soma dos itens');
      }

      // Verificar estoque disponível para todos os produtos
      for (const item of dto.items) {
        const stock = await this.prisma.stock.findUnique({
          where: { productId: item.productId }
        });

        if (!stock) {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true }
          });
          throw new BadRequestException(`Produto "${product?.name || item.productId}" não possui estoque cadastrado`);
        }

        if (stock.quantity < item.quantity) {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true }
          });
          throw new BadRequestException(
            `Estoque insuficiente para o produto "${product?.name || item.productId}". ` +
            `Disponível: ${stock.quantity}, Solicitado: ${item.quantity}`
          );
        }
      }

      // Usar transação para garantir consistência
      return await this.prisma.$transaction(async (tx) => {
        // Criar a venda usando o cliente transacional
        const sale = await tx.sale.create({
          data: {
            clientId: dto.clientId,
            sellerId: dto.sellerId,
            date: dto.date ? new Date(dto.date) : new Date(),
            total: dto.total,
            observations: dto.observations,
            items: {
              create: dto.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          },
          include: {
            client: {
              include: {
                address: true,
              },
            },
            seller: {
              include: {
                address: true,
              },
            },
            items: {
              include: {
                product: {
                  include: {
                    supplier: true,
                  },
                },
              },
            },
          },
        });

        // Atualizar estoque de cada produto
        for (const item of dto.items) {
          await tx.stock.update({
            where: { productId: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        }

        return sale;
      });

    } catch (error) {
      console.error('Erro ao criar venda:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Cliente ou vendedor não encontrado');
        }
      }

      throw new InternalServerErrorException('Erro ao criar a venda.');
    }
  }

  async update(id: number, dto: UpdateSaleDto) {
    const existingSale = await this.repository.findById(id);
    if (!existingSale) {
      throw new NotFoundException('Venda não encontrada para atualização.');
    }

    try {
      // Validar se o total corresponde aos itens (se items for fornecido)
      if (dto.items && dto.total) {
        const calculatedTotal = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        if (Math.abs(calculatedTotal - dto.total) > 0.01) {
          throw new BadRequestException('O total da venda não corresponde à soma dos itens');
        }
      }

      // Se os itens estão sendo atualizados, verificar estoque
      if (dto.items) {
        // Primeiro, calcular a diferença de estoque necessária
        const stockChanges = new Map<number, number>();

        // Restaurar estoque dos itens antigos
        for (const oldItem of existingSale.items) {
          const currentChange = stockChanges.get(oldItem.productId) || 0;
          stockChanges.set(oldItem.productId, currentChange + oldItem.quantity);
        }

        // Decrementar estoque dos novos itens
        for (const newItem of dto.items) {
          const currentChange = stockChanges.get(newItem.productId) || 0;
          stockChanges.set(newItem.productId, currentChange - newItem.quantity);
        }

        // Verificar se há estoque suficiente para as mudanças
        for (const [productId, change] of stockChanges.entries()) {
          if (change < 0) { // Se a mudança é negativa, significa que precisamos de mais estoque
            const stock = await this.prisma.stock.findUnique({
              where: { productId }
            });

            if (!stock) {
              const product = await this.prisma.product.findUnique({
                where: { id: productId },
                select: { name: true }
              });
              throw new BadRequestException(`Produto "${product?.name || productId}" não possui estoque cadastrado`);
            }

            if (stock.quantity + change < 0) {
              const product = await this.prisma.product.findUnique({
                where: { id: productId },
                select: { name: true }
              });
              throw new BadRequestException(
                `Estoque insuficiente para o produto "${product?.name || productId}". ` +
                `Disponível: ${stock.quantity}, Necessário: ${Math.abs(change)}`
              );
            }
          }
        }

        // Usar transação para garantir consistência
        return await this.prisma.$transaction(async (tx) => {
          // Atualizar a venda
          const updatedSale = await this.repository.update(id, dto);

          // Aplicar mudanças de estoque
          for (const [productId, change] of stockChanges.entries()) {
            if (change !== 0) {
              await tx.stock.update({
                where: { productId },
                data: {
                  quantity: {
                    increment: change
                  }
                }
              });
            }
          }

          return updatedSale;
        });
      } else {
        // Se não há mudança nos itens, apenas atualizar a venda
        return await this.repository.update(id, dto);
      }

    } catch (error) {
      console.error('Erro ao atualizar venda:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Cliente ou vendedor não encontrado');
        }
      }

      throw new InternalServerErrorException('Erro ao atualizar a venda.');
    }
  }

  async remove(id: number) {
    const existingSale = await this.repository.findById(id);
    if (!existingSale) {
      throw new NotFoundException('Venda não encontrada para remoção.');
    }

    try {
      // Usar transação para garantir consistência
      return await this.prisma.$transaction(async (tx) => {
        // Restaurar estoque de cada produto antes de excluir a venda
        for (const item of existingSale.items) {
          await tx.stock.update({
            where: { productId: item.productId },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });
        }

        // Remover a venda
        return await this.repository.remove(id);
      });
    } catch (error) {
      console.error('Erro ao remover venda:', error);
      throw new InternalServerErrorException('Erro ao remover a venda.');
    }
  }
} 