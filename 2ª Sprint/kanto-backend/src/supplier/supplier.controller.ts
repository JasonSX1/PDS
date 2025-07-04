import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('supplier') // A rota base para este módulo será /supplier
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get('pages')
  async pagination(@Request() request) {
    return await this.supplierService.paginate(
      request.query.page ?? 0,
      request.query.size ?? 10,
      request.query.sort ?? 'name', // Ajuste para o campo de ordenação do fornecedor, se diferente
      request.query.order ?? 'asc',
      request.query.search ?? '',
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.supplierService.findById(Number(id));
  }

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.supplierService.create(createSupplierDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return await this.supplierService.update(Number(id), updateSupplierDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.supplierService.remove(Number(id));
  }
}