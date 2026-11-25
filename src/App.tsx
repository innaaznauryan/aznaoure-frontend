import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CartProvider } from "@/context/CartContext";
import { SignInPromptModal } from "@/components/auth/SignInPromptModal";
import { Layout } from "@/components/layout/Layout";
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from "@/components/ScrollToTop.tsx";
import Index from "./pages/Index";
import About from "./pages/About";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ProfileLayout from './pages/ProfileLayout';
import ProfileOverview from './pages/ProfileOverview';
import ProfileFavorites from './pages/ProfileFavorites';
import ProfileAddresses from "@/pages/ProfileAddresses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <ScrollToTop />
                <Layout>
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/profile" element={<ProtectedRoute><ProfileLayout /></ProtectedRoute>}>
                    <Route index element={<ProfileOverview />} />
                    <Route path="addresses" element={<ProfileAddresses />} />
                    <Route path="favorites" element={<ProfileFavorites />} />
                    {/*<Route path="orders" element={<>ProfileOrders </>} />*/}
                  </Route>
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
                <SignInPromptModal />
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>

);

export default App;
