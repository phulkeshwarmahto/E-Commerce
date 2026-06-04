import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { PageTransition } from "./components/layout/PageTransition";
import { Toast } from "./components/ui/Toast";
import { AppContext } from "./context/AppContext";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { useOrders } from "./hooks/useOrders";
import { getStoredWishlist, setStoredWishlist } from "./store/wishlistStore";

// Lazy loaded page components for optimal initial bundle sizes and fast page loads
const AccountPage = lazy(() => import("./pages/AccountPage").then(m => ({ default: m.AccountPage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then(m => ({ default: m.AdminPage })));
const SellerPage = lazy(() => import("./pages/SellerPage").then(m => ({ default: m.SellerPage })));
const AuthPage = lazy(() => import("./pages/AuthPage").then(m => ({ default: m.AuthPage })));
const CartPage = lazy(() => import("./pages/CartPage").then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then(m => ({ default: m.OrdersPage })));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage").then(m => ({ default: m.OrderSuccessPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const ShopPage = lazy(() => import("./pages/ShopPage").then(m => ({ default: m.ShopPage })));
const WishlistPage = lazy(() => import("./pages/WishlistPage").then(m => ({ default: m.WishlistPage })));
const VSCompetitorsPage = lazy(() => import("./pages/VSCompetitorsPage").then(m => ({ default: m.VSCompetitorsPage })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const auth = useAuth();
  const cart = useCart(auth.token);
  const orders = useOrders(auth.token);
  const [wishlistIds, setWishlistIds] = useState(() => getStoredWishlist());
  const [toastMessage, setToastMessage] = useState("");

  const toggleWishlist = (id) => {
    setWishlistIds((current) => {
      const next = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id];
      setStoredWishlist(next);
      return next;
    });
  };

  const contextValue = useMemo(
    () => ({
      ...auth,
      cart,
      orders,
      wishlistIds,
      toggleWishlist,
      notify: setToastMessage,
    }),
    [auth, cart, orders, wishlistIds],
  );

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app-shell">
          <Navbar />
          <main className="main-shell">
            <PageTransition>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/seller" element={<SellerPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/vs-competitors" element={<VSCompetitorsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </PageTransition>
          </main>
          <Footer />
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
