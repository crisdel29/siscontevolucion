import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/auth/login";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import Activos from "@/pages/activos";
import Movimientos from "@/pages/movimientos";
import Valoracion from "@/pages/valoracion";
import Depreciacion from "@/pages/depreciacion";
import Importacion from "@/pages/importacion";
import Reportes from "@/pages/reportes";
import Empresa from "@/pages/empresa";
import AdminPanel from "@/pages/admin";
import Dashboard from "@/pages/dashboard";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any> }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />

      {/* Sistema Routes */}
      <Route path="/sistema">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/sistema/activos">
        {() => <ProtectedRoute component={Activos} />}
      </Route>
      <Route path="/sistema/movimientos">
        {() => <ProtectedRoute component={Movimientos} />}
      </Route>
      <Route path="/sistema/valoracion">
        {() => <ProtectedRoute component={Valoracion} />}
      </Route>
      <Route path="/sistema/depreciacion">
        {() => <ProtectedRoute component={Depreciacion} />}
      </Route>
      <Route path="/sistema/importacion">
        {() => <ProtectedRoute component={Importacion} />}
      </Route>
      <Route path="/sistema/reportes">
        {() => <ProtectedRoute component={Reportes} />}
      </Route>
      <Route path="/sistema/empresa">
        {() => <ProtectedRoute component={Empresa} />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminPanel} />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;