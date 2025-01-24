// Cargar dotenv primero antes de cualquier otra importación
import * as dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno según el ambiente
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

import express from "express";
import { registerRoutes } from "./routes";
import { validateConnection } from "@db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware simple de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

async function startServer() {
  try {
    // Verificar conexión a BD
    await validateConnection();
    console.log('✅ Base de datos conectada');

    const server = registerRoutes(app);

    // Servir archivos estáticos
    const distPath = path.resolve(process.cwd(), "dist/public");
    app.use(express.static(distPath));

    // SPA fallback
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    // Puerto fijo para cPanel
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor iniciado en puerto ${PORT}`);
      console.log(`   Modo: ${process.env.NODE_ENV}`);
      console.log(`   Base de datos: ${process.env.DB_NAME}`);
    });

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

startServer();