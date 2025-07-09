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
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('pages')
  async pagination(@Request() request) {
    return await this.clientService.paginate(
      request.query.page ?? 0,
      request.query.size ?? 10,
      request.query.sort ?? 'name',
      request.query.order ?? 'asc',
      request.query.search ?? '',
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.clientService.findById(Number(id));
  }

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientService.create(createClientDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return await this.clientService.update(Number(id), updateClientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.clientService.remove(Number(id));
  }
} 