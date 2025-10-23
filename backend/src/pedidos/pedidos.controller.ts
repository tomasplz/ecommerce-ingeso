import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Solo compradores pueden crear pedidos
    if (userRole !== 'comprador' && userRole !== 'admin') {
      throw new Error('Solo los compradores pueden crear pedidos');
    }

    return this.pedidosService.create(createPedidoDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.pedidosService.findAll(userId, userRole);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.pedidosService.findOne(+id, userId, userRole);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.pedidosService.update(+id, updatePedidoDto, userId, userRole);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.pedidosService.remove(+id, userId, userRole);
  }
}
