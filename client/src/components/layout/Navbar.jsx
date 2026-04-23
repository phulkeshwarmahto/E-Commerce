import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../constants/categories";
import { useAppContext } from "../../hooks/useAppContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, wishlistIds, user } = useAppContext();

  const params = new URLSearchParams(location.search);
  const searchValue = params.get("search") || "";
  const categoryValue = params.get("category") || "All";

  const handleSearch = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const search = String(form.get("search") || "");
    const category = String(form.get("category") || "All");
    const nextParams = new URLSearchParams();

    if (search) {
      nextParams.set("search", search);
    }

    if (category !== "All") {
      nextParams.set("category", category);
    }

    navigate(`/shop?${nextParams.toString()}`);
  };

  return (
    <header className="nav-shell">
      <div className="nav-top">
        <button className="brand" onClick={() => navigate("/")}>
          Gram<span>Bazaar</span>
        </button>
        <form className="nav-search" onSubmit={handleSearch}>
          <select name="category" defaultValue={categoryValue}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input name="search" placeholder="Search honey, tea, copper..." defaultValue={searchValue} />
          <button type="submit">Search</button>
        </form>
        <nav className="nav-actions">
          <NavLink to="/wishlist">Wishlist ({wishlistIds.length})</NavLink>
          <NavLink to="/cart">Cart ({cart.summary.itemCount})</NavLink>
          <NavLink to={user ? "/account" : "/auth"}>{user ? user.name.split(" ")[0] : "Sign in"}</NavLink>
        </nav>
      </div>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </div>
    </header>
  );
}
