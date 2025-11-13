import { IsEmail, IsNotEmpty, IsOptional, IsIn, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsIn(['admin', 'vendedor', 'comprador'])
  role?: string;
}