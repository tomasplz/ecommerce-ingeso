import { IsEmail, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: string;
}