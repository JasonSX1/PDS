import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';

@Injectable()
export class SellerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    search: string,
  ) {
    const results = await this.prisma.seller.findMany({
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
        address: true,
      },
    });

    const totalItems = await this.prisma.seller.count({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return { results, totalItems };
  }

async findById(id: number) {
  const seller = await this.prisma.seller.findUnique({
    where: {
      id: id
    },
    include: {
      address: true
    }
  });

  if (!seller) {
    throw new NotFoundException('Esse vendedor não existe');
  }

  return seller;
}

  async create(dto: CreateSellerDto) {
    return await this.prisma.seller.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cpf: dto.cpf,
        birthDate: new Date(dto.birthDate),
        address: {
          create: {
            zipCode: dto.address.zipCode,
            street: dto.address.street,
            number: dto.address.number,
            city: dto.address.city,
            state: dto.address.state
          }
        },
      },
      include: {
        address: true,
      },
    });
  }

  async update(id: number, dto: UpdateSellerDto) {
    return await this.prisma.seller.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cpf: dto.cpf,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        address: dto.address ? { update: dto.address } : undefined,
      },
      include: {
        address: true,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.seller.delete({
      where: { id },
    });
  }
}
