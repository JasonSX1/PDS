import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    search: string,
  ) {
    const results = await this.prisma.supplier.findMany({ // Usando 'supplier' conforme seu schema
      skip: page * size,
      take: Number(size),
      where: {
        name: { // Campo 'name' para busca
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        [sort]: order,
      },
      include: {
        address: true, // Incluindo o endereço do fornecedor
      },
    });

    const totalItems = await this.prisma.supplier.count({ // Usando 'supplier'
      where: {
        name: { // Campo 'name' para busca
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return { results, totalItems };
  }

  async findById(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ // Usando 'supplier'
      where: {
        id: id // O PK do modelo Supplier é 'id'
      },
      include: {
        address: true // Incluindo o endereço do fornecedor
      }
    });

    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    return await this.prisma.supplier.create({ // Usando 'supplier'
      data: {
        name: dto.name,
        cnpj: dto.cnpj,
        phones: dto.phones, // phones é um array
        emails: dto.emails || [], // emails é um array, garantir que seja um array vazio se não fornecido
        address: {
          create: {
            zipCode: dto.address.zipCode, // Campos do Address DTO
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

  async update(id: number, dto: UpdateSupplierDto) {
    return await this.prisma.supplier.update({ // Usando 'supplier'
      where: { id }, // O PK do modelo Supplier é 'id'
      data: {
        name: dto.name,
        cnpj: dto.cnpj,
        phones: dto.phones,
        emails: dto.emails,
        address: dto.address ? { update: dto.address } : undefined, // Atualiza endereço se fornecido
      },
      include: {
        address: true,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.supplier.delete({ // Usando 'supplier'
      where: { id }, // O PK do modelo Supplier é 'id'
    });
  }
}