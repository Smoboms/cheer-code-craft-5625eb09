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
              <Route path="/buscar" element={<PublicSearch />} />
            </Route>
            <Route path="/app" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
