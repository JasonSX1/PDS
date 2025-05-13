import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { SellerRepository } from './repository/seller.repository';

@Module({
  controllers: [SellerController],
  providers: [PrismaService, SellerService, SellerRepository],
})
export class SellerModule {}
