import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto, usuarioId: number) {
    return this.prisma.producto.create({
      data: {
        ...createProductoDto,
        usuarioId,
      },
      include: { usuario: true },
    });
  }

  async findAll() {
    return this.prisma.producto.findMany({
      include: { usuario: true },
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id },
      include: { usuario: true },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto, usuarioId: number, isAdmin: boolean) {
    const producto = await this.findOne(id);
    if (!isAdmin && producto.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para editar este producto');
    }
    return this.prisma.producto.update({
      where: { id },
      data: updateProductoDto,
      include: { usuario: true },
    });
  }

  async remove(id: number, usuarioId: number, isAdmin: boolean) {
    const producto = await this.findOne(id);
    if (!isAdmin && producto.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }
    return this.prisma.producto.delete({
      where: { id },
    });
  }

  async findByUsuario(usuarioId: number) {
    return this.prisma.producto.findMany({
      where: { usuarioId },
      include: { usuario: true },
    });
  }
}
