import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const prisma = new PrismaService();
  await prisma.$connect();

  // Crear usuario admin si no existe
  const adminExists = await prisma.usuario.findUnique({ where: { email: 'admin@example.com' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Usuario admin creado');
  } else {
    console.log('Usuario admin ya existe');
  }

  // Crear usuario vendedor si no existe
  const vendedorExists = await prisma.usuario.findUnique({ where: { email: 'vendedor@example.com' } });
  if (!vendedorExists) {
    const hashedPassword = await bcrypt.hash('vendedor123', 10);
    await prisma.usuario.create({
      data: {
        email: 'vendedor@example.com',
        password: hashedPassword,
        role: 'vendedor',
      },
    });
    console.log('Usuario vendedor creado');
  } else {
    console.log('Usuario vendedor ya existe');
  }

  // Crear usuario comprador si no existe
  const compradorExists = await prisma.usuario.findUnique({ where: { email: 'comprador@example.com' } });
  if (!compradorExists) {
    const hashedPassword = await bcrypt.hash('comprador123', 10);
    await prisma.usuario.create({
      data: {
        email: 'comprador@example.com',
        password: hashedPassword,
        role: 'comprador',
      },
    });
    console.log('Usuario comprador creado');
  } else {
    console.log('Usuario comprador ya existe');
  }

  await prisma.$disconnect();
}

bootstrap();