import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { SaleRepository } from './repository/sale.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SaleController],
  providers: [SaleService, SaleRepository, PrismaService],
  exports: [SaleService],
})
export class SaleModule {} 