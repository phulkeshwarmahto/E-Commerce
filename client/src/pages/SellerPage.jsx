import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSellerDashboardRequest,
  createSellerProductRequest,
  updateSellerProductRequest,
  deleteSellerProductRequest,
  getSellerFAQsRequest,
  updateSellerOrderStatusRequest,
  getSellerProductsRequest,
  getSellerOrdersRequest,
  getSellerSalesAnalyticsRequest,
} from "../api/seller.api";
import { getReviewsRequest } from "../api/reviews.api";
import { answerQuestionRequest } from "../api/faq.api";
import { getReturnRequests, updateReturnRequestStatus } from "../api/return.api";
import { ProductForm } from "../components/admin/ProductForm";
import { StatCard } from "../components/admin/StatCard";
import { OrderTable } from "../components/admin/OrderTable";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";
import { ReportModal } from "../components/ui/ReportModal";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export function SellerPage() {
  const { user, notify } = useAppContext();
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");

  useDocumentMetadata({
    title: "Merchant Dashboard",
    description: "Manage your seller profile, list organic products, track store orders, and view performance insights on GramBazaar.",
    noindex: true
  });

  const [dashboard, setDashboard] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Paginated lists
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPagination, setProductsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPagination, setOrdersPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [returnsList, setReturnsList] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnsPage, setReturnsPage] = useState(1);
  const [returnsPagination, setReturnsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Sales Analytics
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Report States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: "seller", id: "", name: "" });

  const handleOpenReport = (type, id, name) => {
    setReportTarget({ type, id, name });
    setReportModalOpen(true);
  };
  
  // Reviews Tab States
  const [selectedReviewProductId, setSelectedReviewProductId] = useState("");
  const [productReviews, setProductReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // FAQ Answer States
  const [submittingAnswers, setSubmittingAnswers] = useState({});
  const [answerDrafts, setAnswerDrafts] = useState({});

  const loadSellerData = useCallback(async () => {
    try {
      const dbData = await getSellerDashboardRequest();
      setDashboard(dbData);
      
      const faqData = await getSellerFAQsRequest();
      setFaqs(faqData.faqs || []);

      if (dbData.products?.length > 0 && !selectedReviewProductId) {
        setSelectedReviewProductId(dbData.products[0].id);
      }
    } catch (err) {
      notify("Failed to load seller panel data.");
    }
  }, [notify, selectedReviewProductId]);

  const loadSellerProducts = useCallback(async (page = 1) => {
    setLoadingProducts(true);
    try {
      const data = await getSellerProductsRequest(page, 10);
      setProductsList(data.products || []);
      if (data.pagination) {
        setProductsPagination(data.pagination);
      }
    } catch (err) {
      notify("Failed to load products list.");
    } finally {
      setLoadingProducts(false);
    }
  }, [notify]);

  const loadSellerOrders = useCallback(async (page = 1) => {
    setLoadingOrders(true);
    try {
      const data = await getSellerOrdersRequest(page, 10);
      setOrdersList(data.orders || []);
      if (data.pagination) {
        setOrdersPagination(data.pagination);
      }
    } catch (err) {
      notify("Failed to load orders list.");
    } finally {
      setLoadingOrders(false);
    }
  }, [notify]);

  const loadReturns = useCallback(async (page = 1) => {
    setLoadingReturns(true);
    try {
      const res = await getReturnRequests(page, 10);
      setReturnsList(res.returns || []);
      if (res.pagination) {
        setReturnsPagination(res.pagination);
      }
    } catch (err) {
      notify("Failed to load returns list.");
    } finally {
      setLoadingReturns(false);
    }
  }, [notify]);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await getSellerSalesAnalyticsRequest();
      setSalesAnalytics(data);
    } catch (err) {
      notify("Failed to load sales analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [notify]);

  useEffect(() => {
    if (user?.role === "seller" || user?.role === "admin") {
      loadSellerData().catch(() => {});
    }
  }, [loadSellerData, user]);

  useEffect(() => {
    if ((user?.role === "seller" || user?.role === "admin") && section === "products") {
      loadSellerProducts(productsPage).catch(() => {});
    }
  }, [section, productsPage, loadSellerProducts, user]);

  useEffect(() => {
    if ((user?.role === "seller" || user?.role === "admin") && section === "orders") {
      loadSellerOrders(ordersPage).catch(() => {});
    }
  }, [section, ordersPage, loadSellerOrders, user]);

  useEffect(() => {
    if ((user?.role === "seller" || user?.role === "admin") && section === "returns") {
      loadReturns(returnsPage).catch(() => {});
    }
  }, [section, returnsPage, loadReturns, user]);

  useEffect(() => {
    if ((user?.role === "seller" || user?.role === "admin") && section === "overview") {
      loadAnalytics().catch(() => {});
    }
  }, [section, loadAnalytics, user]);

  // Load reviews when selected product changes
  useEffect(() => {
    if (selectedReviewProductId && section === "reviews") {
      setLoadingReviews(true);
      getReviewsRequest(selectedReviewProductId)
        .then((data) => {
          setProductReviews(data.reviews || []);
        })
        .catch(() => {
          notify("Failed to load product reviews.");
        })
        .finally(() => {
          setLoadingReviews(false);
        });
    }
  }, [selectedReviewProductId, section, notify]);

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return (
      <section className="page-content text-center py-20">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <span className="text-5xl">🛑</span>
          <h2 className="text-2xl font-black text-gray-900 mt-4 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">
            You must be logged in as a registered Seller to access the merchant control panel.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="w-full bg-[#c4622d] text-white font-bold py-3 px-6 rounded-xl hover:shadow-md transition-all"
          >
            Go to Login Page
          </button>
        </div>
      </section>
    );
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteSellerProductRequest(id);
        notify("Product deleted successfully.");
        loadSellerProducts(productsPage);
        loadSellerData();
      } catch (err) {
        notify(err.message || "Failed to delete product.");
      }
    }
  };

  const handleAnswerSubmit = async (faqId) => {
    const draft = answerDrafts[faqId];
    if (!draft?.trim()) return;

    setSubmittingAnswers((prev) => ({ ...prev, [faqId]: true }));
    try {
      await answerQuestionRequest(faqId, draft);
      notify("Your answer has been submitted!");
      setAnswerDrafts((prev) => ({ ...prev, [faqId]: "" }));
      // Reload FAQs
      const faqData = await getSellerFAQsRequest();
      setFaqs(faqData.faqs || []);
    } catch (err) {
      notify("Failed to submit answer.");
    } finally {
      setSubmittingAnswers((prev) => ({ ...prev, [faqId]: false }));
    }
  };

  const drawLineChart = (data, width = 600, height = 200) => {
    if (!data || data.length === 0) return { points: [], path: "", areaPath: "" };
    const maxVal = Math.max(...data, 100);
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const y = height - ((val / maxVal) * (height - 40) + 20);
      return { x, y, val, label: salesAnalytics?.labels?.[idx] || "" };
    });
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    const areaPath = `${path} L ${points[points.length - 1].x} ${height - 10} L ${points[0].x} ${height - 10} Z`;
    return { points, path, areaPath };
  };

  const drawBarChart = (data, width = 600, height = 200) => {
    if (!data || data.length === 0) return [];
    const maxVal = Math.max(...data, 5);
    const barWidth = ((width - 40) / data.length) * 0.7;
    const gap = ((width - 40) / data.length) * 0.3;
    return data.map((val, idx) => {
      const x = 20 + idx * (barWidth + gap);
      const barHeight = (val / maxVal) * (height - 40);
      const y = height - barHeight - 20;
      return { x, y, width: barWidth, height: barHeight, val, label: salesAnalytics?.labels?.[idx] || "" };
    });
  };

  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = [
    { id: "overview", label: "Dashboard Overview", icon: "📊" },
    { id: "products", label: "My Products", icon: "📦" },
    { id: "orders", label: "Order History", icon: "🛒" },
    { id: "returns", label: "Returns Management", icon: "🔄" },
    { id: "reviews", label: "Customer Reviews", icon: "⭐" },
    { id: "faqs", label: "Buyer Q&A (FAQs)", icon: "❓" },
  ];

  return (
    <section className="page-content admin-page">
      <div className="admin-page-head">
        <div>
          <div className="sec-label">Seller Panel</div>
          <h1 className="page-title">Merchant Center Dashboard</h1>
        </div>
        <div className="bg-[#2c1a0e]/5 border border-[#2c1a0e]/10 rounded-xl px-4 py-2 text-right">
          <p className="text-[0.72rem] text-gray-500 uppercase font-bold tracking-wider">Logged in as Merchant</p>
          <p className="text-xs font-bold text-[#c4622d]">{user.name}</p>
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {sections.map((entry) => (
            <button
              key={entry.id}
              className={`flex items-center gap-2 text-left py-3 px-4 w-full rounded-xl transition-all border-0 cursor-pointer ${
                section === entry.id
                  ? "bg-[#c4622d] text-white font-bold"
                  : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => setSection(entry.id)}
            >
              <span className="text-lg">{entry.icon}</span>
              <span className="text-sm">{entry.label}</span>
            </button>
          ))}
          <div className="border-t border-gray-200/50 my-4 pt-4 px-2">
            <button
              type="button"
              onClick={() => handleOpenReport("seller", user.id || "seller-id", user.name)}
              className="flex items-center gap-2 text-left py-2 px-3 w-full rounded-xl transition-all border border-red-200 bg-red-50/10 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold cursor-pointer text-xs"
            >
              ⚠️ Report Issue to Admin
            </button>
          </div>
        </aside>

        {/* Workspace */}
        <div className="stack flex-1">
          {/* Overview Section */}
          {section === "overview" && dashboard ? (
            <>
              <div className="stats-grid">
                <StatCard label="My Sales Revenue" value={dashboard.stats.revenue} currency />
                <StatCard label="My Products" value={dashboard.stats.products} />
                <StatCard label="Customer Orders" value={dashboard.stats.orders} />
              </div>

              {/* Custom Interactive SVG Charts */}
              {salesAnalytics ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6 relative">
                  {/* Revenue Line Chart */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm relative">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">💰 30-Day Revenue Trend</h3>
                    {(() => {
                      const { points, path, areaPath } = drawLineChart(salesAnalytics.revenueData);
                      return (
                        <div className="relative">
                          {points.length > 0 ? (
                            <>
                              <svg className="w-full h-52 overflow-visible" viewBox="0 0 600 200">
                                <defs>
                                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#c4622d" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#c4622d" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                {/* Gridlines */}
                                <line x1="20" y1="20" x2="580" y2="20" stroke="#f1f1f1" strokeWidth="1" />
                                <line x1="20" y1="80" x2="580" y2="80" stroke="#f1f1f1" strokeWidth="1" />
                                <line x1="20" y1="140" x2="580" y2="140" stroke="#f1f1f1" strokeWidth="1" />
                                <line x1="20" y1="180" x2="580" y2="180" stroke="#e0e0e0" strokeWidth="1.5" />

                                {/* Area Path */}
                                <path d={areaPath} fill="url(#revGrad)" />

                                {/* Line Path */}
                                <path d={path} fill="none" stroke="#c4622d" strokeWidth="3" strokeLinecap="round" />

                                {/* Interactive Dots */}
                                {points.map((p, idx) => (
                                  <circle
                                    key={idx}
                                    cx={p.x}
                                    cy={p.y}
                                    r="5"
                                    className="fill-white stroke-[#c4622d] stroke-[2px] cursor-pointer hover:r-[7px] hover:fill-[#c4622d] transition-all"
                                    onMouseEnter={() => setHoveredPoint({ ...p, type: "revenue" })}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                  />
                                ))}
                              </svg>

                              {/* Chart X Labels */}
                              <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-2 px-4">
                                <span>{salesAnalytics.labels?.[0]}</span>
                                <span>{salesAnalytics.labels?.[14]}</span>
                                <span>{salesAnalytics.labels?.[29]}</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400 text-center py-10">No revenue data available.</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Orders Bar Chart */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm relative">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">📦 30-Day Orders Volume</h3>
                    {(() => {
                      const bars = drawBarChart(salesAnalytics.orderData);
                      return (
                        <div className="relative">
                          {bars.length > 0 ? (
                            <>
                              <svg className="w-full h-52 overflow-visible" viewBox="0 0 600 200">
                                {/* Gridlines */}
                                <line x1="20" y1="20" x2="580" y2="20" stroke="#f1f1f1" strokeWidth="1" />
                                <line x1="20" y1="80" x2="580" y2="80" stroke="#f1f1f1" strokeWidth="1" />
                                <line x1="20" y1="140" x2="580" y2="140" stroke="#f1f1f1" strokeWidth="1" />
                                <line x1="20" y1="180" x2="580" y2="180" stroke="#e0e0e0" strokeWidth="1.5" />

                                {/* Bars */}
                                {bars.map((b, idx) => (
                                  <rect
                                    key={idx}
                                    x={b.x}
                                    y={b.y}
                                    width={b.width}
                                    height={b.height}
                                    rx="3"
                                    className="fill-[#e0a96d] hover:fill-[#c4622d] transition-colors cursor-pointer"
                                    onMouseEnter={() => setHoveredPoint({ ...b, type: "orders" })}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                  />
                                ))}
                              </svg>

                              {/* Chart X Labels */}
                              <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-2 px-4">
                                <span>{salesAnalytics.labels?.[0]}</span>
                                <span>{salesAnalytics.labels?.[14]}</span>
                                <span>{salesAnalytics.labels?.[29]}</span>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400 text-center py-10">No orders data available.</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tooltip Overlay */}
                  {hoveredPoint && (
                    <div
                      className="absolute z-20 bg-gray-900/90 text-white rounded-xl px-3 py-2 text-[10px] shadow-lg pointer-events-none font-bold backdrop-blur-sm border border-gray-800"
                      style={{
                        left: `${(hoveredPoint.x / 600) * 100}%`,
                        top: `${(hoveredPoint.y / 200) * 100 - 25}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div>Date: {hoveredPoint.label}</div>
                      <div className="text-orange mt-0.5">
                        {hoveredPoint.type === "revenue"
                          ? `Revenue: ₹${hoveredPoint.val}`
                          : `Orders: ${hoveredPoint.val}`}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic my-4 px-2 animate-pulse">Loading sales performance analytics...</p>
              )}
              
              <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">📦 Recent Orders Containing My Products</h2>
              {dashboard.recentOrders?.length > 0 ? (
                <OrderTable
                  orders={dashboard.recentOrders.slice(0, 5)}
                  onUpdateStatus={async (id, status, paymentStatus) => {
                    try {
                      await updateSellerOrderStatusRequest(id, status, paymentStatus);
                      notify("Order status updated successfully.");
                      loadSellerData().catch(() => {});
                    } catch (err) {
                      notify(err.message || "Failed to update order status.");
                    }
                  }}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-sm">
                  No orders placed for your products yet. Keep building! 🚀
                </div>
              )}
            </>
          ) : null}

          {/* Products Section */}
          {section === "products" && dashboard ? (
            <>
              <div className="section-head flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search my products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4622d] transition-all bg-white"
                  />
                </div>
                <button
                  className="button button-primary bg-[#c4622d] hover:bg-[#a95223] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 border-0 cursor-pointer"
                  onClick={() => setShowCreateModal(true)}
                >
                  ➕ Add New Product
                </button>
              </div>

              {loadingProducts ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading products list...</p>
              ) : filteredProducts.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const hasImage = product.images?.[0]?.url;
                        const hasLowStockVariant = product.variants && product.variants.some((v) => v.stockCount < 5);
                        const isLowStock = product.stockCount < 5 || hasLowStockVariant;
                        return (
                          <tr key={product.id}>
                            <td className="font-semibold text-gray-900">
                              <div className="flex items-center gap-3">
                                {hasImage ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-xl shadow-sm shrink-0 select-none">
                                    {product.emoji || "📦"}
                                  </div>
                                )}
                                <span className="truncate max-w-[200px]">{product.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                {product.category}
                              </span>
                            </td>
                            <td className="font-bold text-gray-800">{formatCurrency(product.price)}</td>
                            <td className="text-gray-600">
                              <div className="flex flex-col gap-1">
                                {product.stockCount > 0 ? (
                                  <span className="text-green-600 font-bold">{product.stockCount} in stock</span>
                                ) : (
                                  <span className="text-red-500 font-bold">Out of stock</span>
                                )}
                                {isLowStock && (
                                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold w-fit animate-pulse">
                                    ⚠️ Low Stock
                                  </span>
                                )}
                                {product.variants && product.variants.length > 0 && (
                                  <div className="text-[10px] text-gray-400 mt-1">
                                    {product.variants.map((v) => (
                                      <div key={v.name} className={v.stockCount < 5 ? "text-red-500 font-semibold" : ""}>
                                        {v.name}: {v.stockCount} left
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors border-0 cursor-pointer"
                                  onClick={() => setEditingProduct(product)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors border-0 cursor-pointer"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={productsPagination.currentPage}
                    totalPages={productsPagination.totalPages}
                    onPageChange={(p) => setProductsPage(p)}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 text-sm mt-4">
                  {searchQuery ? "No products match your search query." : "You haven't listed any products yet. Click Add Product to begin!"}
                </div>
              )}
            </>
          ) : null}

          {/* Orders Section */}
          {section === "orders" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-1">🛒 Order History</h2>
              <p className="text-xs text-gray-500 mb-4">View and update statuses for orders containing your products.</p>

              {loadingOrders ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading orders list...</p>
              ) : ordersList.length > 0 ? (
                <div className="stack gap-4">
                  <OrderTable
                    orders={ordersList}
                    onUpdateStatus={async (id, status, paymentStatus) => {
                      try {
                        await updateSellerOrderStatusRequest(id, status, paymentStatus);
                        notify("Order status updated successfully.");
                        loadSellerOrders(ordersPage).catch(() => {});
                      } catch (err) {
                        notify(err.message || "Failed to update order status.");
                      }
                    }}
                  />
                  <Pagination
                    currentPage={ordersPagination.currentPage}
                    totalPages={ordersPagination.totalPages}
                    onPageChange={(p) => setOrdersPage(p)}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-sm">
                  No orders placed for your products yet. Keep building! 🚀
                </div>
              )}
            </div>
          ) : null}

          {/* Returns Section */}
          {section === "returns" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-1">🔄 Customer Returns Management</h2>
              <p className="text-xs text-gray-500 mb-4">Review, approve, or reject customer return requests for your products. Approvals will restore stock and trigger refunds.</p>

              {loadingReturns ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading return requests...</p>
              ) : returnsList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap text-left">Buyer</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap text-left">Order Number</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap text-left">Items</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap text-left">Reason</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap text-left">Status</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnsList.map((ret) => (
                        <tr key={ret.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="!py-3 !px-4 text-sm font-semibold text-gray-900 whitespace-nowrap text-left">
                            {ret.userId?.name || "Customer"} ({ret.userId?.email || ""})
                          </td>
                          <td className="!py-3 !px-4 font-bold text-xs text-gray-600 whitespace-nowrap text-left">
                            #{ret.orderNumber}
                          </td>
                          <td className="!py-3 !px-4 text-xs text-gray-800 text-left">
                            {ret.items.map((it) => `${it.name} ${it.variantName ? `(${it.variantName})` : ""} ×${it.quantity}`).join(" · ")}
                          </td>
                          <td className="!py-3 !px-4 text-xs text-gray-600 text-left">{ret.reason}</td>
                          <td className="!py-3 !px-4 whitespace-nowrap text-left">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              ret.status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : ret.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {ret.status}
                            </span>
                          </td>
                          <td className="!py-3 !px-4 text-left">
                            <div className="flex gap-2">
                              {ret.status === "pending" ? (
                                <>
                                  <button
                                    type="button"
                                    className="button text-[10px] px-2.5 py-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border-0 cursor-pointer"
                                    onClick={async () => {
                                      if (confirm("Are you sure you want to APPROVE this return request? Stock will be restored and refund initiated.")) {
                                        try {
                                          await updateReturnRequestStatus(ret.id, "approved");
                                          notify("Return request approved.");
                                          loadReturns(returnsPage).catch(() => {});
                                        } catch (err) {
                                          notify(err.message || "Failed to approve return.");
                                        }
                                      }
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="button text-[10px] px-2.5 py-1.5 font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg border-0 cursor-pointer"
                                    onClick={async () => {
                                      if (confirm("Are you sure you want to REJECT this return request?")) {
                                        try {
                                          await updateReturnRequestStatus(ret.id, "rejected");
                                          notify("Return request rejected.");
                                          loadReturns(returnsPage).catch(() => {});
                                        } catch (err) {
                                          notify(err.message || "Failed to reject return.");
                                        }
                                      }
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-400 text-xs italic">Handled</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={returnsPagination.currentPage}
                    totalPages={returnsPagination.totalPages}
                    onPageChange={(p) => setReturnsPage(p)}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-505 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No return requests recorded yet for your products.
                </p>
              )}
            </div>
          ) : null}

          {/* Reviews Section */}
          {section === "reviews" && dashboard ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-4">⭐ Customer Ratings & Reviews</h2>
              
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">Select Product to View Reviews</label>
                <select
                  value={selectedReviewProductId}
                  onChange={(e) => setSelectedReviewProductId(e.target.value)}
                  className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4622d] transition-all bg-white"
                >
                  {dashboard.products?.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.emoji} {prod.name} ({prod.reviewCount || 0} reviews)
                    </option>
                  ))}
                  {dashboard.products?.length === 0 && (
                    <option value="">No products available</option>
                  )}
                </select>
              </div>

              {loadingReviews ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading reviews...</p>
              ) : productReviews.length > 0 ? (
                <div className="space-y-4">
                  {productReviews.map((rev) => (
                    <article key={rev.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100/50 transition-colors">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-yellow-500 text-sm">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                            <span className="font-bold text-gray-900 text-sm">{rev.title}</span>
                          </div>
                          <p className="text-[0.7rem] text-gray-400 font-semibold mt-0.5">By {rev.name} on {new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mt-1">{rev.body}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-505 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No customer reviews received for this product yet.
                </p>
              )}
            </div>
          ) : null}

          {/* Q&A / FAQs Section */}
          {section === "faqs" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-2">❓ Buyer Product Questions (Q&A)</h2>
              <p className="text-xs text-gray-500 mb-6">Buyers submit questions about your items. Provide concise and accurate answers to boost your conversions!</p>

              {faqs.length > 0 ? (
                <div className="space-y-6">
                  {faqs.map((faq) => {
                    const product = dashboard?.products?.find((p) => p.id === faq.productId);
                    return (
                      <div key={faq.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all text-left">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-xs bg-[#c4622d]/10 text-[#c4622d] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Product
                          </span>
                          <span className="text-xs font-semibold text-gray-600">
                            {product ? `${product.emoji} ${product.name}` : "Unknown Product"}
                          </span>
                        </div>

                        <div className="space-y-4 pl-1">
                          {/* Question */}
                          <div className="flex gap-3">
                            <span className="text-emerald-600 font-black text-sm shrink-0">Q:</span>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm leading-relaxed">{faq.question}</p>
                              <p className="text-[0.68rem] text-gray-400 font-medium mt-0.5">Asked by {faq.buyerName} on {new Date(faq.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Answer */}
                          <div className="flex gap-3 pt-2 border-t border-gray-100">
                            <span className="text-purple-600 font-black text-sm shrink-0">A:</span>
                            <div className="flex-1">
                              {faq.isAnswered ? (
                                <div>
                                  <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                                  <p className="text-[0.68rem] text-gray-400 font-medium mt-0.5">Answered by you on {new Date(faq.updatedAt).toLocaleDateString()}</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <textarea
                                    placeholder="Write your detailed answer here..."
                                    value={answerDrafts[faq.id] || ""}
                                    onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [faq.id]: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d] transition-all bg-white min-h-[70px] resize-y"
                                  />
                                  <button
                                    onClick={() => handleAnswerSubmit(faq.id)}
                                    disabled={submittingAnswers[faq.id] || !answerDrafts[faq.id]?.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm border-0 cursor-pointer"
                                  >
                                    {submittingAnswers[faq.id] ? "Submitting..." : "Submit Answer"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-505 py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No buyer questions received for your products.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Modals */}
      {editingProduct ? (
        <Modal title={`Edit ${editingProduct.name}`} onClose={() => setEditingProduct(null)}>
          <ProductForm
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSubmit={async (payload) => {
              try {
                await updateSellerProductRequest(payload.id, payload);
                notify("Product updated successfully.");
                setEditingProduct(null);
                loadSellerProducts(productsPage);
                loadSellerData();
              } catch (err) {
                notify(err.message || "Failed to update product.");
              }
            }}
          />
        </Modal>
      ) : null}

      {showCreateModal ? (
        <Modal title="Add Product" onClose={() => setShowCreateModal(false)}>
          <ProductForm
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (payload) => {
              try {
                await createSellerProductRequest(payload);
                notify("Product created successfully.");
                setShowCreateModal(false);
                loadSellerProducts(productsPage);
                loadSellerData();
              } catch (err) {
                notify(err.message || "Failed to create product.");
              }
            }}
          />
        </Modal>
      ) : null}

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportType={reportTarget.type}
        targetId={reportTarget.id}
        targetName={reportTarget.name}
      />
    </section>
  );
}
