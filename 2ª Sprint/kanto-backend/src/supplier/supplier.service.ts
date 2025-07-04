import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { SupplierRepository } from './repository/supplier.repository';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class SupplierService {
  constructor(private readonly repository: SupplierRepository) {}

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
        endIndex: size + (size - 1), // Corrigido para endIndex: (currentPage * size) + size - 1, se for inclusivo. O Seller usa size + (size - 1)
      },
    };
  }

  async findById(id: number) {
    const supplier = await this.repository.findById(id);
    if (!supplier) {
        throw new NotFoundException('Fornecedor não encontrado.');
    }
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    try {
      return await this.repository.create(dto);
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray((error.meta as any)?.target)
      ) {
        const targetFields = (error.meta as any).target as string[];

        // Seu schema define 'cnpj' como único. 'emails' é um array e não é único no nível do campo.
        if (targetFields.includes('cnpj')) {
          throw new BadRequestException('Já existe um fornecedor com este CNPJ.');
        }
        // Se você quiser validar a unicidade de *cada* email dentro do array,
        // isso exigiria uma lógica de validação mais complexa ou uma tabela separada para emails.
        // Por enquanto, removemos a verificação de e-mail duplicado aqui, já que emails é um array.
      }

      throw new InternalServerErrorException('Erro ao criar o fornecedor.');
    }
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const existingSupplier = await this.repository.findById(id);
    if (!existingSupplier) {
      throw new NotFoundException('Fornecedor não encontrado para atualização.');
    }
    return await this.repository.update(id, dto);
  }

  async remove(id: number) {
    const existingSupplier = await this.repository.findById(id);
    if (!existingSupplier) {
      throw new NotFoundException('Fornecedor não encontrado para remoção.');
    }
    return await this.repository.remove(id);
  }
}