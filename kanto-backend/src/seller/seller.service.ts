import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SellerRepository } from './repository/seller.repository';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SellerService {
  constructor(private readonly repository: SellerRepository) {}

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

  async create(dto: CreateSellerDto) {
    try {
      return await this.repository.create(dto);
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray((error.meta as any)?.target)
      ) {
        const targetFields = (error.meta as any).target as string[];

        if (targetFields.includes('email')) {
          throw new BadRequestException('Já existe um vendedor com este e-mail.');
        }

        if (targetFields.includes('cpf')) {
          throw new BadRequestException('Já existe um vendedor com este CPF.');
        }
      }

      throw new InternalServerErrorException('Erro ao criar o vendedor.');
    }
  }

  async update(id: number, dto: UpdateSellerDto) {
    return await this.repository.update(id, dto);
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }
}
