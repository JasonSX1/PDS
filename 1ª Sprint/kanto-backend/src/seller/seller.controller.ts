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
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('pages')
  async pagination(@Request() request) {
    return await this.sellerService.paginate(
      request.query.page ?? 0,
      request.query.size ?? 10,
      request.query.sort ?? 'name',
      request.query.order ?? 'asc',
      request.query.search ?? '',
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.sellerService.findById(Number(id));
  }

  @Post()
  async create(@Body() createSellerDto: CreateSellerDto) {
    return await this.sellerService.create(createSellerDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
  ) {
    return await this.sellerService.update(Number(id), updateSellerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.sellerService.remove(Number(id));
  }
}
