import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getSellerPublicProfileRequest } from "../api/seller.api";
import { getProductsRequest } from "../api/products.api";
import { ProductGrid } from "../components/product/ProductGrid";
import { Pagination } from "../components/ui/Pagination";
import { Spinner } from "../components/ui/Spinner";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { formatCurrency } from "../utils/formatCurrency";

export function SellerStorePage() {
  const { id: sellerId } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
  });

  useDocumentMetadata({
    title: profile ? `${profile.name}'s Organic Storefront` : "Organic Storefront",
    description: profile
      ? `Shop authentic natural everyday essentials from certified merchant ${profile.name}. Browse farm-fresh products with transparent credit scores on GramBazaar.`
      : "Shop natural essentials from verified sellers.",
  });

  const fetchSellerData = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await getSellerPublicProfileRequest(sellerId);
      if (res.success && res.data) {
        setProfile(res.data.seller);
      } else {
        setError("Failed to fetch seller profile.");
      }
    } catch (err) {
      setError("Seller not found or error loading profile.");
    } finally {
      setLoadingProfile(false);
    }
  }, [sellerId]);

  const fetchSellerProducts = useCallback(async (page = 1) => {
    setLoadingProducts(true);
    try {
      const res = await getProductsRequest({ seller: sellerId, page, limit: 12 });
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setError("Failed to load seller catalog.");
    } finally {
      setLoadingProducts(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  useEffect(() => {
    fetchSellerProducts(currentPage);
  }, [fetchSellerProducts, currentPage]);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-content text-center py-20">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-2xl font-black text-gray-900 mt-4 mb-2">Error</h2>
          <p className="text-gray-500 text-sm mb-6">{error || "Seller Profile not found."}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#c4622d] text-white font-bold py-3 px-6 rounded-xl hover:shadow-md transition-all border-0 cursor-pointer"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content bg-gradient-to-b from-[#fdfbf7] to-[#f5f0e8] min-h-screen py-10 px-4 md:px-8">
      {/* Premium Glassmorphic Profile Card */}
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md border border-[#c4622d]/10 rounded-3xl p-6 md:p-10 shadow-xl mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c4622d]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9b6b3a]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Avatar/Initials */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#c4622d] to-[#9b6b3a] text-white flex items-center justify-center font-bold text-3xl md:text-5xl shadow-lg border-4 border-white/50 shrink-0">
          {profile.name?.[0]?.toUpperCase() || "S"}
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#2c1a0e] tracking-tight">{profile.name}</h1>
            <div className="flex justify-center md:justify-start gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                profile.certificationStatus === "certified"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}>
                {profile.certificationStatus === "certified" ? "✓ Verified Merchant" : "New Merchant"}
              </span>
            </div>
          </div>

          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-xl">
            Welcome to our premium storefront on GramBazaar. We source only authentic, 100% natural, and premium quality everyday ingredients directly from our farmers.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-200/60 max-w-2xl">
            {/* Credit Score */}
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Credit Rating</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-[#c4622d]">{profile.creditScore}</span>
                <span className="text-[10px] text-gray-400 font-bold">/1000</span>
              </div>
              {/* Nice score indicator bar */}
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 via-amber-500 to-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(profile.creditScore / 1000) * 100}%` }}
                />
              </div>
            </div>

            {/* Average Rating */}
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rating</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg font-black text-gray-900">{profile.averageRating > 0 ? profile.averageRating : "—"}</span>
                {profile.averageRating > 0 && <span className="text-yellow-500 text-sm">★</span>}
              </div>
            </div>

            {/* Total Products */}
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Catalog Items</div>
              <div className="text-lg font-black text-gray-900 mt-0.5">{profile.totalProducts} items</div>
            </div>

            {/* Badge Indicator */}
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status</div>
              <div className="text-xs font-extrabold mt-1 text-emerald-600 uppercase tracking-wide">
                ● Active Shop
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Title */}
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-xl md:text-2xl font-black text-[#2c1a0e]">🌾 Catalog & Farm Products ({pagination.totalItems})</h2>
      </div>

      {/* Products Catalog Grid */}
      <div className="max-w-6xl mx-auto">
        {loadingProducts ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Spinner size="md" />
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-8">
            <ProductGrid products={products} />
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-150 p-20 text-center text-gray-500">
            <span className="text-5xl block mb-4">🌾</span>
            <p className="text-lg font-bold">This merchant has not listed any catalog products yet.</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for natural, organic fresh arrivals!</p>
          </div>
        )}
      </div>
    </div>
  );
}
