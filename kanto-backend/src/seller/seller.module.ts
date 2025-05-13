import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { SellerRepository } from './repository/seller.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SellerController],
  providers: [
    PrismaService,   // Serviço compartilhado de acesso ao banco
    SellerService,  // Regras de negócio
    SellerRepository // Camada de acesso a dados (repository pattern)
],
})
export class SellerModule {}
