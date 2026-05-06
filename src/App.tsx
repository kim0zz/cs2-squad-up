import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "./pages/HomePage.tsx";
import Cs2Page from "./pages/Cs2Page.tsx";
import PadelPage from "./pages/PadelPage.tsx";
import PadelNewPage from "./pages/PadelNewPage.tsx";
import EventRoute from "./pages/EventRoute.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cs2" element={<Cs2Page />} />
          <Route path="/padel" element={<PadelPage />} />
          <Route path="/padel/new" element={<PadelNewPage />} />
          <Route path="/e/:slug" element={<EventRoute />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
