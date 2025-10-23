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
    const vendedorId = +req.user.id;
    return this.productosService.create(createProductoDto, vendedorId);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-productos')
  findByUsuario(@Request() req) {
    const vendedorId = +req.user.id;
    return this.productosService.findByUsuario(vendedorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto, @Request() req) {
    const vendedorId = +req.user.id;
    const isAdmin = req.user.role === 'admin';
    return this.productosService.update(+id, updateProductoDto, vendedorId, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const vendedorId = +req.user.id;
    const isAdmin = req.user.role === 'admin';
    return this.productosService.remove(+id, vendedorId, isAdmin);
  }
}
