import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Tickets from "./pages/Tickets";
import Appointments from "./pages/Appointments";
import Correspondence from "./pages/Correspondence";
import NotificationsPage from "./pages/Notifications";
import Home from "./pages/Home";
import { useAuth } from "./_core/hooks/useAuth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return <Home />;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      
      {/* Rotas protegidas - renderizadas sempre, mas controladas por ProtectedRoute */}
      <Route path={"/dashboard"}>
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path={"/chat"}>
        {() => <ProtectedRoute component={Chat} />}
      </Route>
      <Route path={"/tickets"}>
        {() => <ProtectedRoute component={Tickets} />}
      </Route>
      <Route path={"/appointments"}>
        {() => <ProtectedRoute component={Appointments} />}
      </Route>
      <Route path={"/correspondence"}>
        {() => <ProtectedRoute component={Correspondence} />}
      </Route>
      <Route path={"/notifications"}>
        {() => <ProtectedRoute component={NotificationsPage} />}
      </Route>
      
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
