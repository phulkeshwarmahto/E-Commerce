async function fetchProducts() {
  try {
    const res = await fetch("http://127.0.0.1:5001/api/products");
    const json = await res.json();
    console.log("Success:", json.success);
    console.log("Products Count returned by API:", json.data?.products?.length);
    console.log("Total Items in Pagination:", json.data?.pagination?.totalItems);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
fetchProducts();
