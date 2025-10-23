import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductosModule } from './productos/productos.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    AuthModule,
    ProductosModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}