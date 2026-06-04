import { statusColors } from "../../constants/statusColors";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export function OrderTable({ orders, onUpdateStatus, readOnly = false }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>{formatCurrency(order.total)}</td>
              <td>
                {readOnly ? (
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {order.status}
                  </span>
                ) : (
                  <select
                    className={`status-select ${statusColors[order.status] || ""}`}
                    value={order.status}
                    onChange={(event) => onUpdateStatus(order.id, event.target.value, order.payment?.status)}
                  >
                    {["Processing", "On the Way", "Delivered", "Cancelled", "Returned"].map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                )}
              </td>
              <td>
                {readOnly ? (
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                    order.payment?.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : order.payment?.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : order.payment?.status === "refunded"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {order.payment?.method === "cod" ? "COD - " : ""}
                    {order.payment?.status === "paid" ? "Paid" : order.payment?.status === "failed" ? "Cancelled" : order.payment?.status === "refunded" ? "Returned" : "Pending"}
                  </span>
                ) : (
                  order.payment?.method === "cod" ? (
                    <select
                      className="status-select bg-gray-50 border border-gray-250 text-xs rounded px-2.5 py-1.5 font-bold text-gray-700 focus:outline-none focus:border-[#c4622d] cursor-pointer"
                      value={order.payment?.status || "pending"}
                      onChange={(event) => onUpdateStatus(order.id, order.status, event.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid on Delivery</option>
                      <option value="failed">Cancelled</option>
                      <option value="refunded">Returned</option>
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-gray-600 capitalize">
                      {order.payment?.method.toUpperCase()} ({order.payment?.status})
                    </span>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
