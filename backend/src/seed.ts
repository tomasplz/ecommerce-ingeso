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

  await prisma.$disconnect();
}

bootstrap();