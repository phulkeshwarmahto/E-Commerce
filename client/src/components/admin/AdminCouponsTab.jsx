import { createAdminCouponRequest, deleteAdminCouponRequest } from "../../api/admin.api";

export function AdminCouponsTab({
  couponsList,
  loadingCoupons,
  newCoupon,
  setNewCoupon,
  loadCoupons,
  notify,
  confirm
}) {
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) {
      notify("Please fill in code and discount value.");
      return;
    }

    try {
      await createAdminCouponRequest({
        code: newCoupon.code,
        discountType: newCoupon.discountType,
        discountValue: Number(newCoupon.discountValue),
        minOrderAmount: Number(newCoupon.minOrderAmount || 0),
        expiresAt: newCoupon.expiresAt ? new Date(newCoupon.expiresAt).toISOString() : null,
      });

      notify(`Coupon "${newCoupon.code.toUpperCase()}" created successfully!`);
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

  const handleDeleteCoupon = async (id, code) => {
    if (await confirm(`Delete coupon "${code}"?`)) {
      try {
        await deleteAdminCouponRequest(id);
        notify(`Coupon "${code}" deleted.`);
        loadCoupons().catch(() => {});
      } catch (err) {
        notify(err.message || "Failed to delete coupon.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">🎟️ Create Platform Coupon</h2>
        <p className="text-xs text-gray-500 mb-4">Create global promotional discount codes for all shoppers.</p>

        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. FESTIVE20"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={newCoupon.discountType}
              onChange={(e) => setNewCoupon((prev) => ({ ...prev, discountType: e.target.value }))}
            >
              <option value="percent">Percentage Off (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Discount Value ({newCoupon.discountType === "percent" ? "%" : "₹"})
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={newCoupon.discountType === "percent" ? "e.g. 15" : "e.g. 100"}
              value={newCoupon.discountValue}
              onChange={(e) => setNewCoupon((prev) => ({ ...prev, discountValue: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Min Order Amount (₹)</label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. 499 (0 for none)"
              value={newCoupon.minOrderAmount}
              onChange={(e) => setNewCoupon((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={newCoupon.expiresAt}
              onChange={(e) => setNewCoupon((prev) => ({ ...prev, expiresAt: e.target.value }))}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              ➕ Create Coupon
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Active Platform Coupons</h2>

        {loadingCoupons ? (
          <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading coupons...</p>
        ) : couponsList.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Code</th>
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Discount</th>
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Min Order</th>
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Expires</th>
                  <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {couponsList.map((cp) => (
                  <tr key={cp.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="!py-3 !px-4 text-sm font-mono font-bold text-amber-700">{cp.code}</td>
                    <td className="!py-3 !px-4 text-sm text-gray-800">
                      {cp.discountType === "percent" ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`}
                    </td>
                    <td className="!py-3 !px-4 text-sm text-gray-600">
                      {cp.minOrderAmount ? `₹${cp.minOrderAmount}` : "None"}
                    </td>
                    <td className="!py-3 !px-4 text-xs text-gray-500">
                      {cp.expiresAt ? new Date(cp.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="!py-3 !px-4">
                      <button
                        type="button"
                        className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
                        onClick={() => handleDeleteCoupon(cp.id, cp.code)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-4">
            No active platform coupons.
          </p>
        )}
      </div>
    </div>
  );
}
