import { statusColors } from "../../constants/statusColors";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export function OrderTable({ orders, onUpdateStatus }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>{formatCurrency(order.total)}</td>
              <td>
                <select
                  className={`status-select ${statusColors[order.status] || ""}`}
                  value={order.status}
                  onChange={(event) => onUpdateStatus(order.id, event.target.value)}
                >
                  {["Processing", "Shipped", "Delivered", "Returned"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
