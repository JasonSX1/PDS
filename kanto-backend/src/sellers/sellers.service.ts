/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSellerDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.seller.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cpf: dto.cpf,
        birthDate: new Date(dto.birthDate),
        address: {
          create: dto.address,
        },
      },
      include: {
        address: true,
      },
    });
  }

  findAll() {
    return this.prisma.seller.findMany({
      include: { address: true },
    });
  }

  findOne(id: number) {
    return this.prisma.seller.findUnique({
      where: { id },
      include: { address: true },
    });
  }

  update(id: number, dto: UpdateSellerDto) {
    return this.prisma.seller.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cpf: dto.cpf,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        address: dto.address
          ? {
              update: dto.address,
            }
          : undefined,
      },
      include: { address: true },
    });
  }

  remove(id: number) {
    return this.prisma.seller.delete({
      where: { id },
    });
  }
}
