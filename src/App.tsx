import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import Cs2Page from "./pages/Cs2Page.tsx";
import PadelPage from "./pages/PadelPage.tsx";
import PadelNewPage from "./pages/PadelNewPage.tsx";
import PadelGatheringPage from "./pages/PadelGatheringPage.tsx";
import FootballPage from "./pages/FootballPage.tsx";
import FootballNewPage from "./pages/FootballNewPage.tsx";
import FootballSeriesPage from "./pages/FootballSeriesPage.tsx";
import FootballOccurrencePage from "./pages/FootballOccurrencePage.tsx";
import EventRoute from "./pages/EventRoute.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cs2" element={<Cs2Page />} />
            <Route path="/padel" element={<PadelPage />} />
            <Route path="/padel/new" element={<PadelNewPage />} />
            <Route path="/padel/:slug" element={<PadelGatheringPage />} />
            <Route path="/football" element={<FootballPage />} />
            <Route path="/football/new" element={<FootballNewPage />} />
            <Route path="/football/:slug/:occurrenceId" element={<FootballOccurrencePage />} />
            <Route path="/football/:slug" element={<FootballSeriesPage />} />
            <Route path="/e/:slug" element={<EventRoute />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
