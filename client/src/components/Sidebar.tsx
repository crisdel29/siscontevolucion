import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  FileText,
  Building2,
  BarChart3,
  ArrowUpDown,
  Calculator,
  LineChart,
  Menu,
  Upload,
  X,
  Box,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Definir menús por sistema y rol
const systemMenus = {
  admin: {
    name: "Administración",
    icon: Settings,
    menus: {
      admin: [
        { icon: Settings, label: "Panel de Control", path: "/admin" }
      ]
    }
  },
  activos: {
    name: "Sistema de Activos",
    icon: Box,
    menus: {
      admin: [
        { icon: FileText, label: "Activos", path: "/sistema/activos" },
        { icon: ArrowUpDown, label: "Movimientos", path: "/sistema/movimientos" },
        { icon: BarChart3, label: "Valoración", path: "/sistema/valoracion" },
        { icon: Calculator, label: "Depreciación", path: "/sistema/depreciacion" },
        { icon: Upload, label: "Importación", path: "/sistema/importacion" },
        { icon: LineChart, label: "Reportes", path: "/sistema/reportes" },
        { icon: Building2, label: "Empresa", path: "/sistema/empresa" }
      ],
      empresa: [
        { icon: FileText, label: "Activos", path: "/sistema/activos" },
        { icon: ArrowUpDown, label: "Movimientos", path: "/sistema/movimientos" },
        { icon: BarChart3, label: "Valoración", path: "/sistema/valoracion" },
        { icon: Calculator, label: "Depreciación", path: "/sistema/depreciacion" },
        { icon: LineChart, label: "Reportes", path: "/sistema/reportes" }
      ],
      asistente: [
        { icon: FileText, label: "Activos", path: "/sistema/activos" },
        { icon: ArrowUpDown, label: "Movimientos", path: "/sistema/movimientos" },
        { icon: LineChart, label: "Reportes", path: "/sistema/reportes" }
      ]
    }
  }
};

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  // Si no hay usuario o rol, no mostrar nada
  if (!user?.role) return null;

  const userRole = user.role.toLowerCase();

  // Encontrar el sistema actual basado en la ruta
  const currentSystem = Object.values(systemMenus).find(system =>
    system.menus[userRole as keyof typeof system.menus]?.some(
      item => location.startsWith(item.path)
    )
  );

  // Si no hay sistema actual, no mostrar menú
  if (!currentSystem) return null;

  const menuItems = currentSystem.menus[userRole as keyof typeof currentSystem.menus] || [];

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-2 mb-6">
            <currentSystem.icon className="h-6 w-6" />
            <span className="font-semibold text-lg">{currentSystem.name}</span>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    location === item.path
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}