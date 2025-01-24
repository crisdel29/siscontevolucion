import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Box, Settings } from "lucide-react";

// Definir los sistemas disponibles
const availableSystems = {
  admin: {
    id: "admin",
    name: "Panel de Administración",
    description: "Gestión de usuarios, empresas y permisos del sistema",
    icon: Settings,
    path: "/admin",
    roles: ["admin"]
  },
  activos: {
    id: "activos",
    name: "Sistema de Activos",
    description: "Gestión integral de activos corporativos",
    icon: Box,
    path: "/sistema/activos",
    roles: ["admin", "empresa", "asistente"]
  }
  // Aquí se pueden agregar más sistemas en el futuro
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useUser();

  if (!user) return null;

  const userRole = user.role.toLowerCase();
  
  // Filtrar sistemas según el rol del usuario
  const accessibleSystems = Object.values(availableSystems).filter(
    system => system.roles.includes(userRole)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bienvenido, {user.nombre || user.username}</h1>
        <p className="text-muted-foreground">
          Selecciona el sistema al que deseas acceder
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accessibleSystems.map((system) => {
          const Icon = system.icon;
          return (
            <Card
              key={system.id}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(system.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{system.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {system.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
