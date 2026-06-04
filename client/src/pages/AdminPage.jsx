import { useCallback, useEffect, useState } from "react";
import {
  createProductRequest,
  getDashboardRequest,
  updateOrderStatusRequest,
  updateProductRequest,
  getUsersRequest,
  updateUserCreditScoreRequest,
  updateUserCertificationRequest,
  updateUserRoleRequest,
  sendAdminNotificationRequest,
  getAdminCouponsRequest,
  createAdminCouponRequest,
  deleteAdminCouponRequest,
  getAdminBrandsRequest,
  createAdminBrandRequest,
  deleteAdminBrandRequest,
} from "../api/admin.api";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { OrderTable } from "../components/admin/OrderTable";
import { ProductForm } from "../components/admin/ProductForm";
import { ProductTable } from "../components/admin/ProductTable";
import { StatCard } from "../components/admin/StatCard";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../hooks/useAppContext";

export function AdminPage() {
  const { user, notify } = useAppContext();
  const [section, setSection] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Message modal state
  const [selectedUserForMsg, setSelectedUserForMsg] = useState(null);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sendEmailCheckbox, setSendEmailCheckbox] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Coupons state
  const [couponsList, setCouponsList] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderAmount: "",
    expiresAt: "",
  });

  // Brands state
  const [brandsList, setBrandsList] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [newBrand, setNewBrand] = useState({
    brand: "",
    title: "",
    copy: "",
    offer: "",
    accent: "#2f5f4b",
    image: "",
  });

  // Users Search, Sort, Filter State
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSort, setUserSort] = useState("name-asc");

  // Products Search, Sort, Filter State
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productSort, setProductSort] = useState("name-asc");

  const loadDashboard = useCallback(async () => {
    const data = await getDashboardRequest();
    setDashboard(data);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await getUsersRequest();
      setUsersList(data.users || []);
    } catch (err) {
      notify(err.message || "Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }, [notify]);

  const loadCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const res = await getAdminCouponsRequest();
      setCouponsList(res.coupons || []);
    } catch (err) {
      notify(err.message || "Failed to load coupons.");
    } finally {
      setLoadingCoupons(false);
    }
  }, [notify]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUserForMsg || !msgTitle || !msgBody) return;
    setSendingMsg(true);
    try {
      await sendAdminNotificationRequest({
        userId: selectedUserForMsg.id,
        title: msgTitle,
        message: msgBody,
        sendEmailCheckbox,
      });
      notify(`Message sent successfully to ${selectedUserForMsg.name}.`);
      setSelectedUserForMsg(null);
      setMsgTitle("");
      setMsgBody("");
    } catch (err) {
      notify(err.message || "Failed to send message.");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) {
      notify("Code and value are required.");
      return;
    }
    try {
      await createAdminCouponRequest({
        ...newCoupon,
        discountValue: Number(newCoupon.discountValue),
        minOrderAmount: Number(newCoupon.minOrderAmount || 0),
      });
      notify("Coupon created successfully.");
      setNewCoupon({
        code: "",
        discountType: "percent",
        discountValue: "",
        minOrderAmount: "",
        expiresAt: "",
      });
      loadCoupons().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to create coupon.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteAdminCouponRequest(id);
      notify("Coupon deleted successfully.");
      loadCoupons().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to delete coupon.");
    }
  };

  const loadBrands = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const res = await getAdminBrandsRequest();
      setBrandsList(res.brands || []);
    } catch (err) {
      notify(err.message || "Failed to load brands.");
    } finally {
      setLoadingBrands(false);
    }
  }, [notify]);

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.brand || !newBrand.title || !newBrand.copy || !newBrand.offer || !newBrand.image) {
      notify("All fields are required.");
      return;
    }
    try {
      await createAdminBrandRequest(newBrand);
      notify("Brand spotlight created successfully.");
      setNewBrand({
        brand: "",
        title: "",
        copy: "",
        offer: "",
        accent: "#2f5f4b",
        image: "",
      });
      loadBrands().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to create brand spotlight.");
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!confirm("Are you sure you want to delete this brand spotlight?")) return;
    try {
      await deleteAdminBrandRequest(id);
      notify("Brand spotlight deleted successfully.");
      loadBrands().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to delete brand spotlight.");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboard().catch(() => {});
    }
  }, [loadDashboard, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "users") {
      loadUsers().catch(() => {});
    }
  }, [section, loadUsers, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "coupons") {
      loadCoupons().catch(() => {});
    }
  }, [section, loadCoupons, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "brands") {
      loadBrands().catch(() => {});
    }
  }, [section, loadBrands, user]);

  if (!user || user.role !== "admin") {
    return (
      <section className="page-content">
        <p>Admin access required.</p>
      </section>
    );
  }

  // Filtered and Sorted Users
  const filteredUsers = usersList
    .filter((usr) => {
      const searchLower = userSearch.toLowerCase();
      const matchesSearch =
        (usr.name || "").toLowerCase().includes(searchLower) ||
        (usr.email || "").toLowerCase().includes(searchLower);

      if (userRoleFilter === "all") return matchesSearch;
      return matchesSearch && usr.role === userRoleFilter;
    })
    .sort((a, b) => {
      if (userSort === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (userSort === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (userSort === "credit-desc") {
        return (b.creditScore ?? 0) - (a.creditScore ?? 0);
      }
      if (userSort === "credit-asc") {
        return (a.creditScore ?? 0) - (b.creditScore ?? 0);
      }
      return 0;
    });

  // Filtered and Sorted Products
  const filteredProducts = (dashboard?.products || [])
    .filter((prod) => {
      const searchLower = productSearch.toLowerCase();
      const matchesSearch =
        (prod.name || "").toLowerCase().includes(searchLower) ||
        (prod.category || "").toLowerCase().includes(searchLower) ||
        (prod.seller?.name || "admin").toLowerCase().includes(searchLower);

      if (productCategoryFilter === "all") return matchesSearch;
      return matchesSearch && prod.category === productCategoryFilter;
    })
    .sort((a, b) => {
      if (productSort === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (productSort === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (productSort === "price-desc") {
        return (b.price ?? 0) - (a.price ?? 0);
      }
      if (productSort === "price-asc") {
        return (a.price ?? 0) - (b.price ?? 0);
      }
      return 0;
    });

  return (
    <section className="page-content admin-page">
      <div className="admin-page-head">
        <div>
          <div className="sec-label">Admin Panel</div>
          <h1 className="page-title">Store Control Center</h1>
        </div>
      </div>
      <div className="admin-layout">
        <AdminSidebar section={section} onChange={setSection} />
        <div className="stack">
          {section === "overview" && dashboard ? (
            <>
              <div className="stats-grid">
                <StatCard label="Revenue" value={dashboard.stats.revenue} currency />
                <StatCard label="Orders" value={dashboard.stats.orders} />
                <StatCard label="Products" value={dashboard.stats.products} />
                <StatCard label="Users" value={dashboard.stats.users} />
              </div>
              <OrderTable
                orders={dashboard.recentOrders}
                readOnly={true}
              />
            </>
          ) : null}

          {section === "products" && dashboard ? (
            <>
              <div className="section-head mb-4">
                <h1 className="page-title">Products</h1>
                <button className="button button-primary" onClick={() => setShowCreateModal(true)}>
                  Add product
                </button>
              </div>

              {/* Search, Filter, and Sort Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 text-sm">
                <div className="flex-grow">
                  <input
                    type="text"
                    placeholder="Search by product name, category, or seller..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d]"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Home">Home</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Health">Health</option>
                  </select>
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-desc">Price (High-Low)</option>
                    <option value="price-asc">Price (Low-High)</option>
                  </select>
                </div>
              </div>

              <ProductTable products={filteredProducts} onEdit={setEditingProduct} />
              
              {filteredProducts.length === 0 && (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No products match your search/filters.
                </p>
              )}
            </>
          ) : null}

          {section === "orders" && dashboard ? (
            <OrderTable
              orders={dashboard.recentOrders}
              readOnly={true}
            />
          ) : null}

          {section === "reviews" && dashboard ? (
            <div className="stack">
              {dashboard.reviews.map((review) => (
                <article key={review.id} className="rcard">
                  <div className="rcard-head">
                    <span className="rcard-name">{review.title}</span>
                  </div>
                  <div className="rcard-text">{review.body}</div>
                </article>
              ))}
            </div>
          ) : null}

          {section === "users" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-1">👤 Buyers & Sellers Management</h2>
              <p className="text-xs text-gray-500 mb-4">Administrate user access permissions, modify credit ratings, and approve certification statuses.</p>

              {/* Search, Filter, and Sort Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 text-sm">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d]"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Customer (Buyer)</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={userSort}
                    onChange={(e) => setUserSort(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="credit-desc">Credit Score (High-Low)</option>
                    <option value="credit-asc">Credit Score (Low-High)</option>
                  </select>
                </div>
              </div>

              {loadingUsers ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading users list...</p>
              ) : filteredUsers.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">User</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Email</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Role</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Certification</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Credit Score</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="!py-3 !px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {usr.name?.[0]?.toUpperCase() || "U"}
                              </div>
                              <span className="font-semibold text-gray-900 text-sm">{usr.name || "Unknown User"}</span>
                            </div>
                          </td>
                          <td className="!py-3 !px-4 text-gray-600 text-xs whitespace-nowrap">{usr.email || "No Email"}</td>
                          <td className="!py-3 !px-4">
                            <select
                              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                              value={usr.role}
                              onChange={async (e) => {
                                try {
                                  await updateUserRoleRequest(usr.id, e.target.value);
                                  notify("User role updated.");
                                  loadUsers().catch(() => {});
                                } catch (err) {
                                  notify(err.message || "Failed to update role.");
                                }
                              }}
                            >
                              <option value="user">Customer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="!py-3 !px-4">
                            <select
                              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                              value={usr.certificationStatus}
                              onChange={async (e) => {
                                try {
                                  await updateUserCertificationRequest(usr.id, e.target.value);
                                  notify("Certification status updated.");
                                  loadUsers().catch(() => {});
                                } catch (err) {
                                  notify(err.message || "Failed to update certification.");
                                }
                              }}
                            >
                              <option value="new">New</option>
                              <option value="certified">Certified</option>
                            </select>
                          </td>
                          <td className="!py-3 !px-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="1000"
                                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-[#c4622d]"
                                defaultValue={usr.creditScore ?? 750}
                                onBlur={async (e) => {
                                  const val = Number(e.target.value);
                                  if (val !== usr.creditScore) {
                                    try {
                                      await updateUserCreditScoreRequest(usr.id, val);
                                      notify("Credit score updated.");
                                      loadUsers().catch(() => {});
                                    } catch (err) {
                                      notify(err.message || "Failed to update credit score.");
                                      e.target.value = usr.creditScore; // reset
                                    }
                                  }
                                }}
                              />
                              <span className="text-[10px] text-gray-400 font-semibold">/1000</span>
                            </div>
                          </td>
                          <td className="!py-3 !px-4">
                            <button
                              type="button"
                              className="button button-secondary text-[11px] px-3 py-1.5 inline-flex items-center gap-1 font-semibold whitespace-nowrap"
                              onClick={() => setSelectedUserForMsg(usr)}
                            >
                              ✉️ Message
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No users match your filters.
                </p>
              )}
            </div>
          ) : null}

          {section === "coupons" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <div className="section-head mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">🎟️ Coupon Code Generator</h2>
                  <p className="text-xs text-gray-500">Create and delete store discount coupons. Users can apply these codes during checkout.</p>
                </div>
              </div>

              {/* Create Coupon Form */}
              <form onSubmit={handleCreateCoupon} className="bg-gray-50 rounded-xl border border-gray-150 p-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6 text-sm">
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Code (uppercase)</label>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="e.g. SAVE25"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase().trim() })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Discount Type</label>
                  <select
                    className="input py-2"
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Value ({newCoupon.discountType === "percent" ? "%" : "₹"})</label>
                  <input
                    type="number"
                    min="1"
                    className="input py-2"
                    required
                    placeholder="e.g. 20"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="input py-2"
                    placeholder="e.g. 500"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })}
                  />
                </div>
                <div className="field flex justify-end">
                  <button type="submit" className="button button-primary w-full py-2 font-semibold">
                    Generate
                  </button>
                </div>
              </form>

              {/* Coupons List */}
              {loadingCoupons ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading coupons...</p>
              ) : couponsList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Min Order</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponsList.map((cpn) => (
                        <tr key={cpn.id}>
                          <td className="font-bold text-[#c4622d] tracking-wider">{cpn.code}</td>
                          <td className="text-xs capitalize font-medium text-gray-600">{cpn.discountType}</td>
                          <td className="font-semibold text-gray-900">
                            {cpn.discountType === "percent" ? `${cpn.discountValue}%` : `₹${cpn.discountValue}`}
                          </td>
                          <td className="text-gray-600">₹{cpn.minOrderAmount || 0}</td>
                          <td>
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors"
                              onClick={() => handleDeleteCoupon(cpn.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No coupons generated yet. Fill in the form above to generate one.
                </p>
              )}
            </div>
          ) : null}

          {section === "brands" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <div className="section-head mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">📢 Brand Spotlight Management</h2>
                  <p className="text-xs text-gray-500">Create and manage the brand spotlights featured on the store homepage.</p>
                </div>
              </div>

              {/* Add Brand Form */}
              <form onSubmit={handleCreateBrand} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-150 mb-6 text-sm">
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Brand Name</label>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="e.g. Pahadi Roots"
                    value={newBrand.brand}
                    onChange={(e) => setNewBrand({ ...newBrand, brand: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Campaign Title</label>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="e.g. Mountain Pantry Festival"
                    value={newBrand.title}
                    onChange={(e) => setNewBrand({ ...newBrand, title: e.target.value })}
                  />
                </div>
                <div className="field col-span-2">
                  <label className="label text-xs font-semibold text-gray-700">Marketing Description / Copy</label>
                  <textarea
                    className="input min-h-[60px] py-2"
                    required
                    placeholder="e.g. Stone-ground flours, wild honey, and Himalayan salts..."
                    value={newBrand.copy}
                    onChange={(e) => setNewBrand({ ...newBrand, copy: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Offer Text</label>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="e.g. Up to 25% off"
                    value={newBrand.offer}
                    onChange={(e) => setNewBrand({ ...newBrand, offer: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Accent Color (HEX)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer bg-white"
                      value={newBrand.accent}
                      onChange={(e) => setNewBrand({ ...newBrand, accent: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input py-2 flex-grow"
                      required
                      placeholder="#2f5f4b"
                      value={newBrand.accent}
                      onChange={(e) => setNewBrand({ ...newBrand, accent: e.target.value })}
                    />
                  </div>
                </div>
                <div className="field col-span-2">
                  <label className="label text-xs font-semibold text-gray-700">Campaign Image URL</label>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="e.g. https://images.unsplash.com/..."
                    value={newBrand.image}
                    onChange={(e) => setNewBrand({ ...newBrand, image: e.target.value })}
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button type="submit" className="button button-primary py-2 font-semibold">
                    Create Brand Spotlight
                  </button>
                </div>
              </form>

              {/* Brands List Table */}
              {loadingBrands ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading brands list...</p>
              ) : brandsList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Brand</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Title</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Offer</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Color</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandsList.map((bd) => (
                        <tr key={bd.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="!py-3 !px-4 font-semibold text-gray-900 text-sm">{bd.brand}</td>
                          <td className="!py-3 !px-4 text-gray-700 text-xs">{bd.title}</td>
                          <td className="!py-3 !px-4 text-gray-700 text-xs font-bold">{bd.offer}</td>
                          <td className="!py-3 !px-4 text-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white font-bold text-[10px]" style={{ backgroundColor: bd.accent }}>
                              {bd.accent}
                            </span>
                          </td>
                          <td className="!py-3 !px-4">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors"
                              onClick={() => handleDeleteBrand(bd.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No brand spotlights created yet. Fill in the form above to add one.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {editingProduct ? (
        <Modal title={`Edit ${editingProduct.name}`} onClose={() => setEditingProduct(null)}>
          <ProductForm
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSubmit={async (payload) => {
              await updateProductRequest(payload.id, payload);
              notify("Product updated.");
              setEditingProduct(null);
              loadDashboard().catch(() => {});
            }}
          />
        </Modal>
      ) : null}

      {showCreateModal ? (
        <Modal title="Add Product" onClose={() => setShowCreateModal(false)}>
          <ProductForm
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (payload) => {
              await createProductRequest(payload);
              notify("Product created.");
              setShowCreateModal(false);
              loadDashboard().catch(() => {});
            }}
          />
        </Modal>
      ) : null}

      {selectedUserForMsg ? (
        <Modal title={`Send Message to ${selectedUserForMsg.name || "Unknown User"}`} onClose={() => setSelectedUserForMsg(null)}>
          <form onSubmit={handleSendMessage} className="stack text-sm">
            <div className="field">
              <label className="label">Subject / Title</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Special Offer or Account Update"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Message Body</label>
              <textarea
                className="input min-h-[120px]"
                required
                placeholder="Write your message here..."
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="sendEmailCheckbox"
                checked={sendEmailCheckbox}
                onChange={(e) => setSendEmailCheckbox(e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor="sendEmailCheckbox" className="font-semibold text-gray-700 cursor-pointer select-none">
                📧 Send direct Email to user
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setSelectedUserForMsg(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary" disabled={sendingMsg}>
                {sendingMsg ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}
