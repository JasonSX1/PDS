import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SellerModule } from './seller/seller.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [SellerModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}