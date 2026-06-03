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
          {products.map((product) => {
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
                <td>{product.category}</td>
                <td className="font-bold text-gray-800">{formatCurrency(product.price)}</td>
                <td className="text-gray-600">
                  {product.stockCount > 0 ? (
                    <span className="text-green-600 font-bold">{product.stockCount}</span>
                  ) : (
                    <span className="text-red-500 font-bold">0</span>
                  )}
                </td>
                <td className="text-xs text-gray-600 font-semibold">{product.seller?.name || "Admin"}</td>
                <td>
                  <button className="link-button font-bold text-amber-700 hover:text-amber-900" onClick={() => onEdit(product)}>
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

