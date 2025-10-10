# Ecommerce Ingeso

Proyecto de ecommerce desarrollado con NestJS (backend), React (frontend), PostgreSQL (usuarios) y MongoDB (productos).

## Arquitectura

- **Frontend**: React.js
- **Backend**: NestJS (Node.js)
- **Base de datos de usuarios**: PostgreSQL
- **Base de datos de productos**: MongoDB
- **Contenedorización**: Docker y Docker Compose

## Prerrequisitos

- Docker y Docker Compose instalados
- Node.js (versión 20 o superior) si deseas ejecutar localmente sin Docker
- pnpm (instalado globalmente)

## Instalación y Ejecución

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tomasplz/ecommerce-ingeso.git
   cd ecommerce-ingeso
   ```

2. Copia el archivo de variables de entorno:
   ```bash
   cp .env-example .env
   ```
   Rellena las variables en `.env` con tus credenciales reales.

3. Ejecuta los servicios con Docker Compose:
   ```bash
   docker-compose up --build
   ```

   Esto iniciará:
   - Frontend en `http://localhost:80`
   - Backend en `http://localhost:3000`
   - PostgreSQL en `localhost:5432`
   - MongoDB en `localhost:27017`

## Desarrollo Local

### Backend (NestJS)
```bash
cd backend
pnpm install
pnpm run start:dev
```

### Frontend (React)
```bash
cd frontend
npm install  # o pnpm install
npm start    # o pnpm start
```

## Scripts Disponibles

### Backend
- `pnpm run build`: Construye la aplicación
- `pnpm run start:prod`: Ejecuta en producción
- `pnpm run test`: Ejecuta tests

## Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y commitea: `git commit -m "Agrega nueva funcionalidad"`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request
