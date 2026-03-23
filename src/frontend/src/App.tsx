import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import FirePlanner from "./pages/FirePlanner";
import LifeEventAdvisor from "./pages/LifeEventAdvisor";
import MoneyHealthScore from "./pages/MoneyHealthScore";
import TaxWizard from "./pages/TaxWizard";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Layout />
      <Toaster />
    </QueryClientProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const healthScoreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/health-score",
  component: MoneyHealthScore,
});

const firePlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fire-planner",
  component: FirePlanner,
});

const taxWizardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tax-wizard",
  component: TaxWizard,
});

const lifeEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/life-event",
  component: LifeEventAdvisor,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  healthScoreRoute,
  firePlannerRoute,
  taxWizardRoute,
  lifeEventRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
