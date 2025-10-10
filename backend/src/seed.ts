import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Usuario } from './usuario/usuario.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // Crear usuario admin si no existe
  const usuarioRepository = dataSource.getRepository(Usuario);
  const adminExists = await usuarioRepository.findOne({ where: { email: 'admin@example.com' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = usuarioRepository.create({
      email: 'admin@example.com',
      password: hashedPassword,
      isAdmin: true,
    });
    await usuarioRepository.save(admin);
    console.log('Usuario admin creado: admin@example.com / admin123');
  }

  await app.close();
}

bootstrap();