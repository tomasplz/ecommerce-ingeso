import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const prisma = new PrismaService();
  await prisma.$connect();

  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin si no existe
  let admin = await prisma.usuario.findUnique({ where: { email: 'admin@example.com' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.usuario.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('✅ Usuario admin creado');
  } else {
    console.log('ℹ️  Usuario admin ya existe');
  }

  // Crear usuario vendedor si no existe
  let vendedor = await prisma.usuario.findUnique({ where: { email: 'vendedor@example.com' } });
  if (!vendedor) {
    const hashedPassword = await bcrypt.hash('vendedor123', 10);
    vendedor = await prisma.usuario.create({
      data: {
        email: 'vendedor@example.com',
        password: hashedPassword,
        role: 'vendedor',
      },
    });
    console.log('✅ Usuario vendedor creado');
  } else {
    console.log('ℹ️  Usuario vendedor ya existe');
  }

  // Crear usuario comprador si no existe
  let comprador = await prisma.usuario.findUnique({ where: { email: 'comprador@example.com' } });
  if (!comprador) {
    const hashedPassword = await bcrypt.hash('comprador123', 10);
    comprador = await prisma.usuario.create({
      data: {
        email: 'comprador@example.com',
        password: hashedPassword,
        role: 'comprador',
      },
    });
    console.log('✅ Usuario comprador creado');
  } else {
    console.log('ℹ️  Usuario comprador ya existe');
  }

  // Crear productos de ejemplo si no existen
  const productosExistentes = await prisma.producto.count();
  if (productosExistentes === 0 && vendedor) {
    const productos = [
      {
        nombre: 'Laptop HP Pavilion',
        descripcion: 'Laptop HP Pavilion 15.6" Intel Core i5, 8GB RAM, 256GB SSD',
        precio: 599.99,
        stock: 10,
        categoria: 'Electrónica',
        vendedorId: vendedor.id,
      },
      {
        nombre: 'Mouse Logitech MX Master 3',
        descripcion: 'Mouse inalámbrico ergonómico con 7 botones programables',
        precio: 99.99,
        stock: 25,
        categoria: 'Accesorios',
        vendedorId: vendedor.id,
      },
      {
        nombre: 'Teclado Mecánico RGB',
        descripcion: 'Teclado mecánico gaming con switches azules y retroiluminación RGB',
        precio: 129.99,
        stock: 15,
        categoria: 'Accesorios',
        vendedorId: vendedor.id,
      },
      {
        nombre: 'Monitor Samsung 27"',
        descripcion: 'Monitor curvo 27" Full HD 144Hz para gaming',
        precio: 299.99,
        stock: 8,
        categoria: 'Electrónica',
        vendedorId: vendedor.id,
      },
      {
        nombre: 'Auriculares Sony WH-1000XM4',
        descripcion: 'Auriculares con cancelación de ruido activa',
        precio: 349.99,
        stock: 12,
        categoria: 'Audio',
        vendedorId: vendedor.id,
      },
    ];

    for (const producto of productos) {
      await prisma.producto.create({ data: producto });
    }
    console.log('✅ Productos de ejemplo creados');
  } else {
    console.log('ℹ️  Los productos ya existen o no hay vendedor disponible');
  }

  await prisma.$disconnect();
  console.log('🎉 Seed completado exitosamente');
}

bootstrap().catch((error) => {
  console.error('❌ Error durante el seed:', error);
  process.exit(1);
});