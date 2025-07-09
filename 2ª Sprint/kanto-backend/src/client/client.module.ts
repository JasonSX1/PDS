import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { ClientRepository } from './repository/client.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ClientController],
  providers: [ClientService, ClientRepository, PrismaService],
  exports: [ClientService],
})
export class ClientModule {} 