import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';

@Injectable()
export class SaleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    search: string,
  ) {
    const results = await this.prisma.sale.findMany({
      skip: page * size,
      take: Number(size),
      where: {
        OR: [
          {
            client: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            seller: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      orderBy: {
        [sort]: order,
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
                supplier: true
              },
            },
          },
        },
      },
    });

    const totalItems = await this.prisma.sale.count({
      where: {
        OR: [
          {
            client: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            seller: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
    });

    return { results, totalItems };
  }

  async findById(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
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

    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }

    return sale;
  }

  async create(dto: CreateSaleDto) {
    return await this.prisma.sale.create({
      data: {
        clientId: dto.clientId,
        sellerId: dto.sellerId,
        date: dto.date ? new Date(dto.date) : new Date(),
        status: dto.status,
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
  }

  async update(id: number, dto: UpdateSaleDto) {
    // Primeiro, deletar os itens existentes
    if (dto.items) {
      await this.prisma.saleProduct.deleteMany({
        where: { saleId: id },
      });
    }

    return await this.prisma.sale.update({
      where: { id },
      data: {
        clientId: dto.clientId,
        sellerId: dto.sellerId,
        date: dto.date ? new Date(dto.date) : undefined,
        status: dto.status,
        total: dto.total,
        observations: dto.observations,
        ...(dto.items && {
          items: {
            create: dto.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        }),
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
  }

  async remove(id: number) {
    // Primeiro, deletar os itens da venda
    await this.prisma.saleProduct.deleteMany({
      where: { saleId: id },
    });

    // Depois, deletar a venda
    return await this.prisma.sale.delete({
      where: { id },
    });
  }
} 