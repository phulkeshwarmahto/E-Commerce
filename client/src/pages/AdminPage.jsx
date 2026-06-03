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

  if (!user || user.role !== "admin") {
    return (
      <section className="page-content">
        <p>Admin access required.</p>
      </section>
    );
  }

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
              <div className="section-head">
                <h1 className="page-title">Products</h1>
                <button className="button button-primary" onClick={() => setShowCreateModal(true)}>
                  Add product
                </button>
              </div>
              <ProductTable products={dashboard.products} onEdit={setEditingProduct} />
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-2">👤 Buyers & Sellers Management</h2>
              <p className="text-xs text-gray-500 mb-6">Administrate user access permissions, modify credit ratings, and approve certification statuses.</p>

              {loadingUsers ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading users list...</p>
              ) : usersList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Certification</th>
                        <th>Credit Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr.id}>
                          <td className="font-semibold text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                              {usr.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            {usr.name || "Unknown User"}
                          </td>
                          <td className="text-gray-600 text-xs">{usr.email || "No Email"}</td>
                          <td>
                            <select
                              className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
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
                          <td>
                            <select
                              className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
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
                          <td>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="1000"
                                className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-[#c4622d]"
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
                          <td>
                            <button
                              type="button"
                              className="button button-secondary text-[11px] px-2 py-1 flex items-center gap-1 font-semibold"
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
                  No users found.
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
        <Modal title={`Send Message to ${selectedUserForMsg.name}`} onClose={() => setSelectedUserForMsg(null)}>
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
