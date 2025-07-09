import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { ClientRepository } from './repository/client.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(
    private readonly repository: ClientRepository,
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

  async create(dto: CreateClientDto) {
    try {
      return await this.repository.create(dto);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray((error.meta as any)?.target)
      ) {
        const targetFields = (error.meta as any).target as string[];
        if (targetFields.includes('email')) {
          throw new BadRequestException('Já existe um cliente com este e-mail.');
        }
        if (targetFields.includes('cpf')) {
          throw new BadRequestException('Já existe um cliente com este CPF.');
        }
      }
      throw new InternalServerErrorException('Erro ao criar o cliente.');
    }
  }

  async update(id: number, dto: UpdateClientDto) {
    const existingClient = await this.repository.findById(id);
    if (!existingClient) {
      throw new NotFoundException('Cliente não encontrado para atualização.');
    }
    return await this.repository.update(id, dto);
  }

  async remove(id: number) {
    const existingClient = await this.repository.findById(id);
    if (!existingClient) {
      throw new NotFoundException('Cliente não encontrado para remoção.');
    }

    try {
      // Verificar se o cliente tem vendas associadas
      const salesCount = await this.prisma.sale.count({
        where: { clientId: id }
      });

      if (salesCount > 0) {
        throw new BadRequestException(
          `Não é possível excluir o cliente "${existingClient.name}" pois ele possui ${salesCount} venda(s) registrada(s). ` +
          'Remova as vendas associadas antes de excluir o cliente.'
        );
      }

      return await this.repository.remove(id);
    } catch (error) {
      console.error('Erro ao remover cliente:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            `Não é possível excluir o cliente "${existingClient.name}" pois ele possui relacionamentos ativos. ` +
            'Verifique se há vendas ou outros dados associados a este cliente.'
          );
        }
      }

      throw new InternalServerErrorException('Erro ao excluir o cliente.');
    }
  }
} 