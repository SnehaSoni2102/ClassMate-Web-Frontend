
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Pages
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import PaymentVerification from "./pages/PaymentVerification";
import TestPreview from "./pages/TestPreview";
import FindGlobalTests from "./pages/FindGlobalTests";
import GlobalTestDetail from "./pages/GlobalTestDetail";
import CreateGroupTest from "./pages/groups/CreateGroupTest";
import CreateGroupQuiz from "./pages/groups/CreateGroupQuiz";
import EditGroupTest from "./pages/groups/EditGroupTest";
import Tests from "./pages/Tests";
import EditTest from "./pages/tests/EditTest";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navigation />
    <main className="w-full overflow-x-hidden">
      {children}
    </main>
    <Footer />
  </div>
);

// Create the router configuration with ScrollRestoration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Layout>
          <Home />
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/sign-in",
    element: (
      <>
        <Layout>
          <Signin />
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/terms",
    element: (
      <>
        <Layout>
          <Terms />
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/privacy",
    element: (
      <>
        <Layout>
          <Privacy />
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/groups",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/groups/:id",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <GroupDetail />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/groups/:groupId/find-all-test-for-addition",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <FindGlobalTests />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/groups/:groupId/find-all-test-for-addition/:testId",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <GlobalTestDetail />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/groups/:groupId/test-preview/:testId",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <TestPreview />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/tests/:testId",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <TestPreview />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/payment-verification",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <PaymentVerification />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/groups/:groupId/create-test",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <CreateGroupTest />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/groups/:groupId/create-quiz",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <CreateGroupQuiz />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/groups/:groupId/edit-test/:testId",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <EditGroupTest />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/tests",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <Tests />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "/tests/edit-test/:id",
    element: (
      <>
        <Layout>
          <ProtectedRoute>
            <EditTest />
          </ProtectedRoute>
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
  {
    path: "*",
    element: (
      <>
        <Layout>
          <NotFound />
        </Layout>
        <ScrollRestoration />
      </>
    ),
  },
]);

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
