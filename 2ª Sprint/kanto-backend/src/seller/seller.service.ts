import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { SellerRepository } from './repository/seller.repository';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class SellerService {
  constructor(
    private readonly repository: SellerRepository,
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

  async create(dto: CreateSellerDto) {
    try {
      return await this.repository.create(dto);
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);

      if (
        error instanceof PrismaClientKnownRequestError &&
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
    try {
      // Verificar se o vendedor existe
      const existingSeller = await this.repository.findById(id);
      if (!existingSeller) {
        throw new NotFoundException('Vendedor não encontrado para remoção.');
      }

      // Verificar se o vendedor tem vendas associadas
      const salesCount = await this.prisma.sale.count({
        where: { sellerId: id }
      });

      if (salesCount > 0) {
        throw new BadRequestException(
          `Não é possível excluir o vendedor "${existingSeller.name}" pois ele possui ${salesCount} venda(s) registrada(s). ` +
          'Remova as vendas associadas antes de excluir o vendedor.'
        );
      }

      return await this.repository.remove(id);
    } catch (error) {
      console.error('Erro ao remover vendedor:', error);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Não é possível excluir o vendedor pois ele possui relacionamentos ativos. ' +
            'Verifique se há vendas ou outros dados associados a este vendedor.'
          );
        }
      }

      throw new InternalServerErrorException('Erro ao excluir o vendedor.');
    }
  }

  async getSellerStats(id: number) {
    try {
      // Verificar se o vendedor existe
      const seller = await this.repository.findById(id);
      if (!seller) {
        throw new NotFoundException('Vendedor não encontrado.');
      }

      // Buscar estatísticas de vendas
      const salesData = await this.prisma.sale.findMany({
        where: { sellerId: id },
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          total: true
        }
      });

      const totalSales = salesData.length;
      const lastSaleDate = salesData.length > 0 ? salesData[0].date : null;
      const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);

      return {
        sellerId: id,
        totalSales,
        lastSaleDate,
        totalRevenue
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do vendedor:', error);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Erro ao buscar estatísticas do vendedor.');
    }
  }
}
