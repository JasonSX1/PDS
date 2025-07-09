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

@Injectable()
export class SaleService {
  constructor(private readonly repository: SaleRepository) {}

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

      return await this.repository.create(dto);
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

      return await this.repository.update(id, dto);
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
      return await this.repository.remove(id);
    } catch (error) {
      console.error('Erro ao remover venda:', error);
      throw new InternalServerErrorException('Erro ao remover a venda.');
    }
  }
} 