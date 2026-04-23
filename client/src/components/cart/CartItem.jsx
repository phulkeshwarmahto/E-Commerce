import { formatCurrency } from "../../utils/formatCurrency";

export function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <article className="cart-item">
      <div className="cart-item-image" style={{ backgroundImage: `url(${item.images?.[0]?.url})` }} />
      <div className="cart-item-body">
        <h3>{item.name}</h3>
        <p>{item.category}</p>
        <strong>{formatCurrency(item.price)}</strong>
      </div>
      <div className="cart-controls">
        <button onClick={() => onQuantityChange(item.id, item.quantity - 1)}>-</button>
        <span>{item.quantity}</span>
        <button onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</button>
        <button className="link-button" onClick={() => onRemove(item.id)}>
          Remove
        </button>
      </div>
    </article>
  );
}
