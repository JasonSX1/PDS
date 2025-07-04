import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { SupplierRepository } from './repository/supplier.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SupplierController],
  providers: [SupplierService, SupplierRepository, PrismaService],
  exports: [SupplierService], // Se precisar usar o serviço de fornecedor em outros módulos
})
export class SupplierModule {}