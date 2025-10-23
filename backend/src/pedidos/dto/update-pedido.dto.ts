import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePedidoDto {
  @IsOptional()
  @IsEnum(['pendiente', 'pagado', 'enviado', 'entregado'])
  estado?: string;
}
