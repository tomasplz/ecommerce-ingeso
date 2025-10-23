import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    AuthModule,
    ProductosModule,
    PedidosModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}