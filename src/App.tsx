
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import ChatPageSlug from "@/pages/[slug].tsx";
import { Toaster } from "sonner";
import {ThemeProvider} from "@/components/theme-provider.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
          <TooltipProvider>
              <Toaster richColors/>
              <BrowserRouter>
                  <Routes>
                      <Route
                          path="/"
                          element={
                              <>
                                  <SignedIn>
                                      <ChatPage />
                                  </SignedIn>
                                  <SignedOut>
                                      <AuthPage />
                                  </SignedOut>
                              </>
                          }
                      />
                      <Route
                          path="/:chatId"
                          element={
                              <>
                                  <SignedIn>
                                      <ChatPageSlug />
                                  </SignedIn>
                                  <SignedOut>
                                      <AuthPage />
                                  </SignedOut>
                              </>
                          }
                      />
                      <Route path="*" element={<NotFound />} />
                  </Routes>
              </BrowserRouter>
          </TooltipProvider>
      </QueryClientProvider>
  </ThemeProvider>
);

export default App;
