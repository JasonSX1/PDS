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
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get('pages')
  async pagination(@Request() request) {
    return await this.saleService.paginate(
      request.query.page ?? 0,
      request.query.size ?? 10,
      request.query.sort ?? 'date',
      request.query.order ?? 'desc',
      request.query.search ?? '',
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.saleService.findById(Number(id));
  }

  @Post()
  async create(@Body() createSaleDto: CreateSaleDto) {
    return await this.saleService.create(createSaleDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return await this.saleService.update(Number(id), updateSaleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.saleService.remove(Number(id));
  }
} 