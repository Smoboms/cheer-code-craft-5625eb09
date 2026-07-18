import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/public/PublicLayout";
import PublicHome from "./pages/public/PublicHome";

// Public pages — lazy (secondary routes)
const PublicJournal = lazy(() => import("./pages/public/PublicJournal"));
const PublicJournalArticle = lazy(() => import("./pages/public/PublicJournalArticle"));
const PublicCompanies = lazy(() => import("./pages/public/PublicCompanies"));
const CompanyProfile = lazy(() => import("./pages/public/CompanyProfile"));
const PublicSearch = lazy(() => import("./pages/public/PublicSearch"));
const PublicMarket = lazy(() => import("./pages/public/PublicMarket"));
const PublicWeather = lazy(() => import("./pages/public/PublicWeather"));
const PublicProfessionals = lazy(() => import("./pages/public/PublicProfessionals"));
const PublicProfessionalSubmit = lazy(() => import("./pages/public/PublicProfessionalSubmit"));
const PublicLocais = lazy(() => import("./pages/public/PublicLocais"));
const SejaMembro = lazy(() => import("./pages/public/SejaMembro"));
const JournalInfo = lazy(() => import("./pages/public/JournalInfo"));

// Authenticated area — lazy
const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Admin — lazy (never shipped to public visitors)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminMercado = lazy(() => import("./pages/admin/AdminMercado"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminEmpresas = lazy(() => import("./pages/admin/AdminEmpresas"));
const AdminJournal = lazy(() => import("./pages/admin/AdminJournal"));
const AdminCategorias = lazy(() => import("./pages/admin/AdminCategorias"));
const AdminAssociados = lazy(() => import("./pages/admin/AdminAssociados"));
const AdminCupons = lazy(() => import("./pages/admin/AdminCupons"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminProfissionais = lazy(() => import("./pages/admin/AdminProfissionais"));
const AdminMercadoCategorias = lazy(() => import("./pages/admin/AdminMercadoCategorias"));
const AdminLocals = lazy(() => import("./pages/admin/AdminLocals"));
const AdminHomeAtalhos = lazy(() => import("./pages/admin/AdminHomeAtalhos"));
const AdminPilares = lazy(() => import("./pages/admin/AdminPilares"));
const AdminCidades = lazy(() => import("./pages/admin/AdminCidades"));
const AdminMetas = lazy(() => import("./pages/admin/AdminMetas"));
const AdminFinanceiro = lazy(() => import("./pages/admin/AdminFinanceiro"));

// QueryClient with sensible defaults for a mixed public/admin app.
// - staleTime: 60s reduces refetch chatter on route re-mounts.
// - gcTime: 5min keeps memory bounded while allowing back-nav to be instant.
// - refetchOnWindowFocus: off (we don't need real-time on tab focus for this app).
// - retry: 1 (fail fast on real errors; auth/RLS won't self-heal by retrying).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
    Carregando…
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<PublicHome />} />
                <Route path="/journal" element={<PublicJournal />} />
                <Route path="/journal/:id" element={<PublicJournalArticle />} />
                <Route path="/empresas" element={<PublicCompanies />} />
                <Route path="/empresas/:id" element={<CompanyProfile />} />
                <Route path="/mercado" element={<PublicMarket />} />
                <Route path="/buscar" element={<PublicSearch />} />
                <Route path="/clima-uruacu" element={<PublicWeather />} />
                <Route path="/profissionais" element={<PublicProfessionals />} />
                <Route path="/profissionais/cadastro" element={<PublicProfessionalSubmit />} />
                <Route path="/profissionais/:categoria" element={<PublicProfessionals />} />
                <Route path="/locais" element={<PublicLocais />} />
                <Route path="/seja-membro" element={<SejaMembro />} />
                <Route path="/journal-info" element={<JournalInfo />} />
              </Route>
              <Route path="/app" element={<Index />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="empresas" element={<AdminEmpresas />} />
                <Route path="profissionais" element={<AdminProfissionais />} />
                <Route path="journal" element={<AdminJournal />} />
                <Route path="categorias" element={<AdminCategorias />} />
                <Route path="associados" element={<AdminAssociados />} />
                <Route path="cupons" element={<AdminCupons />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="mercado" element={<AdminMercado />} />
                <Route path="mercado-categorias" element={<AdminMercadoCategorias />} />
                <Route path="locais" element={<AdminLocals />} />
                <Route path="atalhos" element={<AdminHomeAtalhos />} />
                <Route path="pilares" element={<AdminPilares />} />
                <Route path="cidades" element={<AdminCidades />} />
                <Route path="metas" element={<AdminMetas />} />
                <Route path="financeiro" element={<AdminFinanceiro />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
