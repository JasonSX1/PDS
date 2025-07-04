import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SellerModule } from './seller/seller.module';
import { PrismaService } from './prisma/prisma.service';
import { SupplierModule } from './supplier/supplier.module';

@Module({
  imports: [SellerModule, SupplierModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}