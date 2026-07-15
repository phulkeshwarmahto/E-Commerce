async function checkApi() {
  try {
    const urls = [
      "http://localhost:5001/api/products?category=Personal%20Care",
      "http://localhost:5001/api/products?category=Home",
      "http://localhost:5001/api/products?category=Health",
      "http://localhost:5001/api/products?category=All"
    ];

    for (const url of urls) {
      const res = await fetch(url);
      const json = await res.json();
      console.log(`URL: ${url}`);
      console.log(`- Success: ${json.success}`);
      console.log(`- Count: ${json.data?.products?.length}`);
      console.log(`- Total: ${json.data?.pagination?.totalItems}`);
      if (json.data?.products) {
        json.data.products.forEach(p => console.log(`  * ${p.name} (${p.category})`));
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
checkApi();
