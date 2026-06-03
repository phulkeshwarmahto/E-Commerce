import { formatCurrency } from "../../utils/formatCurrency";

export function ProductTable({ products, onEdit }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Seller</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{formatCurrency(product.price)}</td>
              <td>{product.stockCount}</td>
              <td className="text-xs text-gray-600 font-semibold">{product.seller?.name || "Admin"}</td>
              <td>
                <button className="link-button" onClick={() => onEdit(product)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
