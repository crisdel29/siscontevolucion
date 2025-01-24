import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Settings, Clock, FileText } from "lucide-react";
import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">Siscontevolución</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#caracteristicas" className="text-sm font-medium">Inicio</a>
              <a href="#caracteristicas" className="text-sm font-medium">Características</a>
              <a href="#contacto" className="text-sm font-medium">Contáctanos</a>
            </nav>
          </div>
          <Button onClick={() => navigate("/login")}>
            Iniciar Sesión
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sistema Integral de Gestión de Activos
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Optimiza el control y procesamiento del ciclo de vida completo de tus activos corporativos
          </p>
          <Button size="lg" onClick={() => navigate("/login")}>
            Comenzar Ahora
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="caracteristicas" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Control Total</h3>
                <p className="text-muted-foreground">
                  Gestión completa del ciclo de vida de tus activos empresariales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tiempo Real</h3>
                <p className="text-muted-foreground">
                  Seguimiento y valoración en tiempo real de tus activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Formato 7.1</h3>
                <p className="text-muted-foreground">
                  Cumplimiento preciso con los requerimientos del Formato 7.1
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Integrado con Tecnologías Modernas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {['React', 'PostgreSQL', 'Express', 'Drizzle'].map((tech) => (
              <div key={tech} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-xl font-semibold">{tech[0]}</span>
                </div>
                <h3 className="font-medium">{tech}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Contáctanos</h2>
          <p className="text-lg text-muted-foreground mb-8">
            ¿Necesitas más información? Estamos aquí para ayudarte.
          </p>
          <Button size="lg" onClick={() => navigate("/login")}>
            Comenzar a Usar Siscontevolución
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}