import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id, deleted: false },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // No incluir password en las consultas
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email, deleted: false },
    });
  }

  async updateProfile(id: number, updateData: { nombre?: string; email?: string; password?: string }) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si quiere cambiar el email, verificar que no esté en uso
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.prisma.usuario.findUnique({
        where: { email: updateData.email },
      });
      
      if (emailExists) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Si viene password, hashearla
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async getAllUsers() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllUsersWithStats() {
    const users = await this.prisma.usuario.findMany({
      where: {
        deleted: false,
      },
      include: {
        productosVendidos: {
          where: {
            deleted: false,
          },
          select: {
            id: true,
            nombre: true,
            precio: true,
            stock: true,
          },
        },
        pedidos: {
          select: {
            id: true,
            total: true,
            estado: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estadísticas para cada usuario
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      
      let stats: any = {};
      
      if (user.role === 'vendedor') {
        const totalProductos = user.productosVendidos.length;
        const productosUnicos = new Set(user.productosVendidos.map(p => p.nombre)).size;
        const totalInventario = user.productosVendidos.reduce((sum, p) => sum + p.stock, 0);
        const valorInventario = user.productosVendidos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
        
        stats = {
          totalProductos,
          productosUnicos,
          totalInventario,
          valorInventario,
        };
      } else if (user.role === 'comprador') {
        const totalPedidos = user.pedidos.length;
        const totalGastado = user.pedidos
          .filter(p => p.estado !== 'cancelado')
          .reduce((sum, p) => sum + p.total, 0);
        const pedidosPendientes = user.pedidos.filter(p => p.estado === 'pendiente').length;
        const pedidosCompletados = user.pedidos.filter(p => p.estado === 'entregado').length;
        
        stats = {
          totalPedidos,
          totalGastado,
          pedidosPendientes,
          pedidosCompletados,
        };
      }
      
      return {
        ...userWithoutPassword,
        stats,
      };
    });
  }

  async getUserWithDetails(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id, deleted: false },
      include: {
        productosVendidos: {
          where: {
            deleted: false,
          },
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            precio: true,
            stock: true,
            categoria: true,
            createdAt: true,
          },
        },
        pedidos: {
          include: {
            items: {
              include: {
                producto: {
                  select: {
                    nombre: true,
                    precio: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    
    // Calcular estadísticas
    let stats: any = {};
    
    if (user.role === 'vendedor') {
      const totalProductos = user.productosVendidos.length;
      const productosUnicos = new Set(user.productosVendidos.map(p => p.nombre)).size;
      const totalInventario = user.productosVendidos.reduce((sum, p) => sum + p.stock, 0);
      const valorInventario = user.productosVendidos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
      
      stats = {
        totalProductos,
        productosUnicos,
        totalInventario,
        valorInventario,
      };
    } else if (user.role === 'comprador') {
      const totalPedidos = user.pedidos.length;
      const totalGastado = user.pedidos
        .filter(p => p.estado !== 'cancelado')
        .reduce((sum, p) => sum + p.total, 0);
      const pedidosPendientes = user.pedidos.filter(p => p.estado === 'pendiente').length;
      const pedidosCompletados = user.pedidos.filter(p => p.estado === 'entregado').length;
      
      stats = {
        totalPedidos,
        totalGastado,
        pedidosPendientes,
        pedidosCompletados,
      };
    }
    
    return {
      ...userWithoutPassword,
      stats,
    };
  }

  async getVendedorByEmail(email: string) {
    const user: any = await this.prisma.usuario.findFirst({
      where: { 
        email: decodeURIComponent(email),
        role: 'vendedor',
        deleted: false 
      },
      include: {
        productosVendidos: {
          where: {
            deleted: false,
          },
          select: {
            id: true,
            nombre: true,
            precio: true,
            stock: true,
            categoria: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    // Remover password de la respuesta
    const { password, deleted, deletedAt, createdAt, updatedAt, ...userPublic } = user;

    // Calcular estadísticas para vendedores
    const totalProductos = user.productosVendidos.length;
    const totalInventario = user.productosVendidos.reduce((sum, p) => sum + p.stock, 0);
    const valorInventario = user.productosVendidos.reduce((sum, p) => sum + (p.precio * p.stock), 0);

    const { productosVendidos, ...vendedorInfo } = userPublic;
    return {
      ...vendedorInfo,
      stats: {
        totalProductos,
        totalInventario,
        valorInventario,
      },
    };
  }

  async getUserPublicInfo(id: number) {
    const user: any = await this.prisma.usuario.findFirst({
      where: { 
        id,
        deleted: false 
      },
      include: {
        productosVendidos: {
          where: {
            deleted: false,
          },
          select: {
            id: true,
            nombre: true,
            precio: true,
            stock: true,
            categoria: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Remover password de la respuesta
    const { password, deleted, deletedAt, createdAt, updatedAt, ...userPublic } = user;

    // Solo mostrar productos si es vendedor
    if (user.role !== 'vendedor') {
      const { productosVendidos, ...basicInfo } = userPublic;
      return basicInfo;
    }

    // Calcular estadísticas para vendedores
    const totalProductos = user.productosVendidos.length;
    const totalInventario = user.productosVendidos.reduce((sum, p) => sum + p.stock, 0);
    const valorInventario = user.productosVendidos.reduce((sum, p) => sum + (p.precio * p.stock), 0);

    const { productosVendidos, ...vendedorInfo } = userPublic;
    return {
      ...vendedorInfo,
      stats: {
        totalProductos,
        totalInventario,
        valorInventario,
      },
    };
  }

  async getUserWithDetailsByEmail(email: string) {
    // Primero buscar el usuario por email sin filtrar por deleted
    const userByEmail = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!userByEmail) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si está eliminado
    if (userByEmail.deleted) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Usar el método existente con el ID
    return this.getUserWithDetails(userByEmail.id);
  }

  async deleteUser(id: number) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.deleted) {
      throw new NotFoundException('Usuario ya eliminado');
    }

    // Soft delete
    await this.prisma.usuario.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });
    
    return { message: 'Usuario eliminado exitosamente (soft delete)' };
  }
}
