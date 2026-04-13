import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NewSale from "@/pages/NewSale";
import SalesHistory from "@/pages/SalesHistory";
import Products from "@/pages/Products";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/new-sale" component={NewSale} />
        <Route path="/sales-history" component={SalesHistory} />
        <Route path="/products" component={Products} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const isFileProtocol = typeof window !== "undefined" && window.location.protocol === "file:";
  const viteBase = import.meta.env.BASE_URL;
  const routerBase = viteBase === "./" ? "" : viteBase.replace(/\/$/, "");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <WouterRouter base={routerBase} hook={isFileProtocol ? useHashLocation : undefined}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
