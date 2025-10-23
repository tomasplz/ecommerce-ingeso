import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  // Configuración para incluir productos sin exponer passwords
  private readonly productoInclude = {
    include: {
      vendedor: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  };

  async create(createPedidoDto: CreatePedidoDto, compradorId: number) {
    // Verificar que todos los productos existan, tengan stock suficiente y calcular el total
    let total = 0;
    const itemsData: Array<{
      productoId: number;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }> = [];

    for (const item of createPedidoDto.items) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: item.productoId },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con id ${item.productoId} no encontrado`);
      }

      // Validar que hay stock suficiente
      if (producto.stock < item.cantidad) {
        throw new ForbiddenException(
          `Stock insuficiente para el producto "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`
        );
      }

      const subtotal = producto.precio * item.cantidad;
      total += subtotal;

      itemsData.push({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal,
      });
    }

    // Crear el pedido con sus items y actualizar el stock de los productos
    const pedido = await this.prisma.pedido.create({
      data: {
        compradorId,
        total,
        estado: 'pendiente',
        items: {
          create: itemsData,
        },
      },
      include: {
        items: {
          include: {
            producto: this.productoInclude,
          },
        },
        comprador: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Actualizar el stock de cada producto
    for (const item of createPedidoDto.items) {
      await this.prisma.producto.update({
        where: { id: item.productoId },
        data: {
          stock: {
            decrement: item.cantidad,
          },
        },
      });
    }

    return pedido;
  }

  async findAll(userId: number, userRole: string) {
    // Si es admin, devuelve todos los pedidos
    if (userRole === 'admin') {
      return this.prisma.pedido.findMany({
        include: {
          items: {
            include: {
              producto: this.productoInclude,
            },
          },
          comprador: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Si es comprador, devuelve solo sus pedidos
    if (userRole === 'comprador') {
      return this.prisma.pedido.findMany({
        where: {
          compradorId: userId,
        },
        include: {
          items: {
            include: {
              producto: this.productoInclude,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Si es vendedor, devuelve pedidos que contengan sus productos
    if (userRole === 'vendedor') {
      const pedidos = await this.prisma.pedido.findMany({
        where: {
          items: {
            some: {
              producto: {
                vendedorId: userId,
              },
            },
          },
        },
        include: {
          items: {
            include: {
              producto: this.productoInclude,
            },
          },
          comprador: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return pedidos;
    }

    return [];
  }

  async findOne(id: number, userId: number, userRole: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            producto: this.productoInclude,
          },
        },
        comprador: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }

    // Verificar permisos
    const isOwner = pedido.compradorId === userId;
    const isAdmin = userRole === 'admin';
    const isVendedorOfProducts = pedido.items.some(
      (item) => item.producto.vendedorId === userId,
    );

    if (!isOwner && !isAdmin && !isVendedorOfProducts) {
      throw new ForbiddenException('No tienes permiso para ver este pedido');
    }

    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto, userId: number, userRole: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }

    // Solo admin puede actualizar el estado del pedido
    if (userRole !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede actualizar el estado del pedido');
    }

    return this.prisma.pedido.update({
      where: { id },
      data: updatePedidoDto,
      include: {
        items: {
          include: {
            producto: this.productoInclude,
          },
        },
        comprador: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        items: true, // Necesitamos los items para devolver el stock
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }

    // Solo admin o el comprador pueden eliminar el pedido
    const isOwner = pedido.compradorId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar este pedido');
    }

    // Solo se pueden eliminar pedidos en estado 'pendiente'
    if (pedido.estado !== 'pendiente') {
      throw new ForbiddenException('Solo se pueden eliminar pedidos en estado pendiente');
    }

    // Devolver el stock a los productos antes de eliminar el pedido
    for (const item of pedido.items) {
      await this.prisma.producto.update({
        where: { id: item.productoId },
        data: {
          stock: {
            increment: item.cantidad, // Devuelve las unidades al stock
          },
        },
      });
    }

    return this.prisma.pedido.delete({
      where: { id },
    });
  }
}
