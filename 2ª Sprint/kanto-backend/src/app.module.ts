import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SellerModule } from './seller/seller.module';
import { PrismaService } from './prisma/prisma.service';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { SaleModule } from './sale/sale.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [SellerModule, SupplierModule, ProductModule, SaleModule, ClientModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}