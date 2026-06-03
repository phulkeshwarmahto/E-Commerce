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
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr.id}>
                          <td className="font-semibold text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                              {usr.name[0]?.toUpperCase() || "U"}
                            </div>
                            {usr.name}
                          </td>
                          <td className="text-gray-600 text-xs">{usr.email}</td>
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
    </section>
  );
}
