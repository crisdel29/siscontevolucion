import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "@db";
import { users, UserRole } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Middleware para verificar roles
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("No ha iniciado sesión");
    }

    const user = req.user as Express.User & { role: string };
    if (!roles.includes(user.role)) {
      return res.status(403).send("No tiene permisos para acceder a este recurso");
    }

    next();
  };
};

// Middleware para verificar acceso a recursos de empresa
export const checkEmpresaAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send("No ha iniciado sesión");
  }

  const user = req.user as Express.User & { role: string, id: number, empresaId: number | null };
  const empresaId = parseInt(req.params.empresaId);

  if (user.role === UserRole.ADMIN) {
    return next(); // El admin tiene acceso total
  }

  if (user.role === UserRole.EMPRESA && user.id === empresaId) {
    return next(); // La empresa tiene acceso a sus propios recursos
  }

  if (user.role === UserRole.ASISTENTE && user.empresaId === empresaId) {
    return next(); // El asistente tiene acceso a los recursos de su empresa
  }

  return res.status(403).send("No tiene permisos para acceder a este recurso");
};

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "siscontevolucion-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.username, username)
        });

        if (!user) {
          return done(null, false, { message: "Usuario o contraseña incorrectos" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Usuario o contraseña incorrectos" });
        }

        // Remove password before sending
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (err) {
        console.error("Error en autenticación:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, id)
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Rutas de autenticación
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).send(info.message ?? "Error de inicio de sesión");
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.json({
          message: "Inicio de sesión exitoso",
          user: {
            id: (user as any).id,
            username: (user as any).username,
            role: (user as any).role,
            nombre: (user as any).nombre,
            email: (user as any).email
          },
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Error al cerrar sesión");
      }
      res.json({ message: "Sesión cerrada correctamente" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as Express.User & { role: string, nombre: string, email: string };
      return res.json({
        id: (user as any).id,
        username: (user as any).username,
        role: user.role,
        nombre: user.nombre,
        email: user.email
      });
    }
    res.status(401).send("No ha iniciado sesión");
  });
}