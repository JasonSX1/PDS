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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('pages')
  async pagination(@Request() request) {
    return await this.productService.paginate(
      request.query.page ?? 0,
      request.query.size ?? 10,
      request.query.sort ?? 'name',
      request.query.order ?? 'asc',
      request.query.search ?? '',
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.productService.findById(Number(id));
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(Number(id), updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productService.remove(Number(id));
  }
}
