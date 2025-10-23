import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto, vendedorId: number) {
    return this.prisma.producto.create({
      data: {
        ...createProductoDto,
        vendedorId,
      },
      include: { 
        vendedor: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        } 
      },
    });
  }

  async findAll() {
    return this.prisma.producto.findMany({
      include: { 
        vendedor: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        } 
      },
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id },
      include: { 
        vendedor: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        } 
      },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto, vendedorId: number, isAdmin: boolean) {
    const producto = await this.findOne(id);
    if (!isAdmin && producto.vendedorId !== vendedorId) {
      throw new ForbiddenException('No tienes permiso para editar este producto');
    }
    return this.prisma.producto.update({
      where: { id },
      data: updateProductoDto,
      include: { 
        vendedor: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        } 
      },
    });
  }

  async remove(id: number, vendedorId: number, isAdmin: boolean) {
    const producto = await this.findOne(id);
    if (!isAdmin && producto.vendedorId !== vendedorId) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }
    return this.prisma.producto.delete({
      where: { id },
    });
  }

  async findByUsuario(vendedorId: number) {
    return this.prisma.producto.findMany({
      where: { vendedorId },
      include: { 
        vendedor: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        } 
      },
    });
  }
}
