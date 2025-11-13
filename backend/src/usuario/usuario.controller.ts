import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

class UpdateProfileDto {
  nombre?: string;
  email?: string;
  password?: string;
}

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('me')
  async getProfile(@Request() req) {
    return this.usuarioService.findById(req.user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    return this.usuarioService.updateProfile(req.user.id, updateData);
  }

  // Admin only endpoints
  @Get('all')
  async getAllUsers(@Request() req) {
    // Solo admin puede ver todos los usuarios
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    return this.usuarioService.getAllUsersWithStats();
  }

  @Get('email/:email/details')
  async getUserDetailsByEmail(@Request() req, @Param('email') email: string) {
    // Solo admin puede ver detalles de usuarios
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    return this.usuarioService.getUserWithDetailsByEmail(email);
  }

  @Get(':id/details')
  async getUserDetails(@Request() req, @Param('id') id: string) {
    // Solo admin puede ver detalles de usuarios
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    return this.usuarioService.getUserWithDetails(parseInt(id));
  }

  @Public()
  @Get('email/:email/public')
  async getVendedorByEmail(@Param('email') email: string) {
    // Endpoint público para buscar vendedor por email
    return this.usuarioService.getVendedorByEmail(email);
  }

  @Public()
  @Get(':id/public')
  async getUserPublicInfo(@Param('id') id: string) {
    // Endpoint público para ver información básica del vendedor
    return this.usuarioService.getUserPublicInfo(parseInt(id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Request() req, @Param('id') id: string) {
    // Solo admin puede eliminar usuarios
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    
    // No permitir que el admin se elimine a sí mismo
    if (req.user.id === parseInt(id)) {
      throw new ForbiddenException('No puedes eliminar tu propia cuenta');
    }
    
    return this.usuarioService.deleteUser(parseInt(id));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(@Request() req, @Param('id') id: string, @Body() updateData: UpdateProfileDto) {
    // Solo admin puede actualizar otros usuarios
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    return this.usuarioService.updateProfile(parseInt(id), updateData);
  }
}
