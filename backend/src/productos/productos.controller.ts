import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    const usuarioId = +req.user.id;
    return this.productosService.create(createProductoDto, usuarioId);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-productos')
  findByUsuario(@Request() req) {
    const usuarioId = +req.user.id;
    return this.productosService.findByUsuario(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }
}
