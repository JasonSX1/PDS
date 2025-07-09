import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    search: string,
  ) {
    const results = await this.prisma.client.findMany({
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

    const totalItems = await this.prisma.client.count({
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
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { address: true },
    });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  async create(dto: CreateClientDto) {
    return await this.prisma.client.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cpf: dto.cpf,
        address: {
          create: {
            street: dto.address.street,
            number: dto.address.number,
            city: dto.address.city,
            state: dto.address.state,
            zipCode: dto.address.zipCode,
          },
        },
      },
      include: { address: true },
    });
  }

  async update(id: number, dto: UpdateClientDto) {
    return await this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cpf: dto.cpf,
        address: dto.address ? { update: dto.address } : undefined,
      },
      include: { address: true },
    });
  }

  async remove(id: number) {
    return await this.prisma.client.delete({
      where: { id },
    });
  }
} 