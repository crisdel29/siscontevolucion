import express from "express";
import { registerRoutes } from "./routes";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";
import { validateConnection } from "@db";

const app = express();
const MemoryStoreSession = MemoryStore(session);

// Configuración básica
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000
  })
}));

// Logging simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

async function startServer() {
  try {
    await validateConnection();
    console.log('✅ Base de datos conectada');

    const server = registerRoutes(app);

    // Archivos estáticos
    const distPath = path.resolve(process.cwd(), "dist/public");
    app.use(express.static(distPath));

    // SPA fallback
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    // Puerto fijo para PM2
    const PORT = 5000;
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`✅ Servidor iniciado en http://127.0.0.1:${PORT}`);
      console.log(`   Modo: ${process.env.NODE_ENV}`);
      console.log(`   Base de datos: ${process.env.DB_NAME}`);
    });

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

startServer();