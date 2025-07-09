import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { ProductRepository } from './repository/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly repository: ProductRepository,
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

  async create(dto: CreateProductDto) {
    try {
      return await this.repository.create(dto);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray((error.meta as any)?.target)
      ) {
        const targetFields = (error.meta as any).target as string[];
        // Exemplo: se algum campo for único no Product, pode tratar aqui
      }
      throw new InternalServerErrorException('Erro ao criar o produto.');
    }
  }

  async update(id: number, dto: UpdateProductDto) {
    const existingProduct = await this.repository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Produto não encontrado para atualização.');
    }
    return await this.repository.update(id, dto);
  }

  async remove(id: number) {
    const existingProduct = await this.repository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Produto não encontrado para remoção.');
    }

    try {
      // Verificar se o produto tem itens de venda associados
      const saleItemsCount = await this.prisma.saleProduct.count({
        where: { productId: id }
      });

      if (saleItemsCount > 0) {
        throw new BadRequestException(
          `Não é possível excluir o produto "${existingProduct.name}" pois ele está presente em ${saleItemsCount} venda(s). ` +
          'Produtos que já foram vendidos não podem ser excluídos para manter a integridade dos registros de vendas.'
        );
      }

      // Verificar se o produto tem itens de pedido associados
      const orderItemsCount = await this.prisma.orderProduct.count({
        where: { productId: id }
      });

      if (orderItemsCount > 0) {
        throw new BadRequestException(
          `Não é possível excluir o produto "${existingProduct.name}" pois ele está presente em ${orderItemsCount} pedido(s). ` +
          'Remova o produto dos pedidos antes de excluí-lo.'
        );
      }

      return await this.repository.remove(id);
    } catch (error) {
      console.error('Erro ao remover produto:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            `Não é possível excluir o produto "${existingProduct.name}" pois ele possui relacionamentos ativos. ` +
            'Verifique se há vendas, pedidos ou outros dados associados a este produto.'
          );
        }
      }

      throw new InternalServerErrorException('Erro ao excluir o produto.');
    }
  }
}
