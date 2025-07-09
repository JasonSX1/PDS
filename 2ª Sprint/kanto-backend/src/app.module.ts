import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SellerModule } from './seller/seller.module';
import { PrismaService } from './prisma/prisma.service';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { SaleModule } from './sale/sale.module';
import { ClientModule } from './client/client.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [SellerModule, SupplierModule, ProductModule, SaleModule, ClientModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}