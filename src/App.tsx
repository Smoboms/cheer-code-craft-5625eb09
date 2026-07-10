import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { PublicLayout } from "@/components/public/PublicLayout";
import PublicHome from "./pages/public/PublicHome";
import PublicJournal from "./pages/public/PublicJournal";
import PublicJournalArticle from "./pages/public/PublicJournalArticle";
import PublicCompanies from "./pages/public/PublicCompanies";
import CompanyProfile from "./pages/public/CompanyProfile";
import PublicSearch from "./pages/public/PublicSearch";
import PublicMarket from "./pages/public/PublicMarket";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminMercado from "./pages/admin/AdminMercado";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmpresas from "./pages/admin/AdminEmpresas";
import AdminJournal from "./pages/admin/AdminJournal";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminAssociados from "./pages/admin/AdminAssociados";
import AdminCupons from "./pages/admin/AdminCupons";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminBanners from "./pages/admin/AdminBanners";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PublicHome />} />
              <Route path="/journal" element={<PublicJournal />} />
              <Route path="/journal/:id" element={<PublicJournalArticle />} />
              <Route path="/empresas" element={<PublicCompanies />} />
              <Route path="/empresas/:id" element={<CompanyProfile />} />
              <Route path="/mercado" element={<PublicMarket />} />
              <Route path="/buscar" element={<PublicSearch />} />
            </Route>
            <Route path="/app" element={<Index />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="empresas" element={<AdminEmpresas />} />
              <Route path="journal" element={<AdminJournal />} />
              <Route path="categorias" element={<AdminCategorias />} />
              <Route path="associados" element={<AdminAssociados />} />
              <Route path="cupons" element={<AdminCupons />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="mercado" element={<AdminMercado />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
