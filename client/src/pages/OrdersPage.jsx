import { statusColors } from "../constants/statusColors";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

export function OrdersPage() {
  const { orders } = useAppContext();

  return (
    <section className="page-content">
      <div className="section-head">
        <h1 className="page-title">Orders</h1>
      </div>
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
            {orders.orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{formatCurrency(order.total)}</td>
                <td>
                  <span className={`status-pill ${statusColors[order.status]}`}>{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!orders.orders.length ? <p>No orders yet.</p> : null}
    </section>
  );
}
