import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSellerDashboardRequest,
  createSellerProductRequest,
  updateSellerProductRequest,
  deleteSellerProductRequest,
  getSellerFAQsRequest,
  updateSellerOrderStatusRequest,
} from "../api/seller.api";
import { getReviewsRequest } from "../api/reviews.api";
import { answerQuestionRequest } from "../api/faq.api";
import { ProductForm } from "../components/admin/ProductForm";
import { StatCard } from "../components/admin/StatCard";
import { OrderTable } from "../components/admin/OrderTable";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";

export function SellerPage() {
  const { user, notify } = useAppContext();
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
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

  useEffect(() => {
    if (user?.role === "seller" || user?.role === "admin") {
      loadSellerData().catch(() => {});
    }
  }, [loadSellerData, user]);

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

  const filteredProducts = dashboard?.products?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sections = [
    { id: "overview", label: "Dashboard Overview", icon: "📊" },
    { id: "products", label: "My Products", icon: "📦" },
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
              className={`flex items-center gap-2 text-left py-3 px-4 w-full rounded-xl transition-all ${
                section === entry.id
                  ? "bg-[#c4622d] text-white font-bold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => setSection(entry.id)}
            >
              <span className="text-lg">{entry.icon}</span>
              <span className="text-sm">{entry.label}</span>
            </button>
          ))}
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
              
              <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">📦 Recent Orders Containing My Products</h2>
              {dashboard.recentOrders?.length > 0 ? (
                <OrderTable
                  orders={dashboard.recentOrders}
                  onUpdateStatus={async (id, status) => {
                    try {
                      await updateSellerOrderStatusRequest(id, status);
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
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c4622d] transition-all"
                  />
                </div>
                <button
                  className="button button-primary bg-[#c4622d] hover:bg-[#a95223] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
                  onClick={() => setShowCreateModal(true)}
                >
                  ➕ Add New Product
                </button>
              </div>

              {filteredProducts.length > 0 ? (
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
                              {product.stockCount > 0 ? (
                                <span className="text-green-600 font-bold">{product.stockCount} in stock</span>
                              ) : (
                                <span className="text-red-500 font-bold">Out of stock</span>
                              )}
                            </td>
                            <td className="text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
                                  onClick={() => setEditingProduct(product)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
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
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500 text-sm mt-4">
                  {searchQuery ? "No products match your search query." : "You haven't listed any products yet. Click Add Product to begin!"}
                </div>
              )}
            </>
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
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
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
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-sm"
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
                <p className="text-sm text-gray-500 py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
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
                loadSellerData();
              } catch (err) {
                notify(err.message || "Failed to create product.");
              }
            }}
          />
        </Modal>
      ) : null}
    </section>
  );
}
