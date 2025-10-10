import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Usuario } from './usuario/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usuarioRepository = app.get<Repository<Usuario>>('UsuarioRepository');

  // Crear usuario admin si no existe
  const adminExists = await usuarioRepository.findOne({ where: { email: 'admin@example.com' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = usuarioRepository.create({
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });
    await usuarioRepository.save(admin);
    console.log('Usuario admin creado');
  } else {
    console.log('Usuario admin ya existe');
  }

  await app.close();
}

bootstrap();