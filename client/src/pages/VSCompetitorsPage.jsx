import { useNavigate } from "react-router-dom";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export function VSCompetitorsPage() {
  const navigate = useNavigate();

  useDocumentMetadata({
    title: "GaramBazaar vs Blinkit, BigBasket, Amazon Fresh & Flipkart Grocery",
    description: "Compare GaramBazaar's farm-direct organic purity with Amazon Fresh, Flipkart, BigBasket, Blinkit, and Swiggy Instamart. Healthier and more sustainable than commercial aggregators.",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "GaramBazaar vs Blinkit, BigBasket, Amazon Fresh & Flipkart Grocery Sourcing Comparison",
      "description": "A comprehensive sourcing and purity comparison between GaramBazaar and grocery aggregators."
    }
  });

  return (
    <section className="page-content bg-gray-50 py-12 px-4 md:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-1">Purity & Sourcing Blueprint</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#2c1a0e] leading-tight">
            GaramBazaar vs. E-Grocery Aggregators
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
            Why health-conscious buyers choose GaramBazaar's certified organic, direct-from-farm ingredients over mass-market retail supply lines.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-8 overflow-x-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sourcing and Purity Comparison Table</h2>
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="p-3 font-bold text-gray-700">Feature</th>
                <th className="p-3 font-bold text-[#c4622d]">GaramBazaar</th>
                <th className="p-3 font-bold text-gray-600">Blinkit / Zepto / Swiggy Instamart</th>
                <th className="p-3 font-bold text-gray-600">BigBasket / Amazon Fresh / Flipkart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3 font-semibold text-gray-800">Direct Farm Sourcing</td>
                <td className="p-3 text-[#c4622d] font-semibold">✅ Yes (100% Traceable to Local SHGs & Cooperatives)</td>
                <td className="p-3 text-gray-500">❌ No (Sourced from commercial wholesale agents)</td>
                <td className="p-3 text-gray-500">⚠️ Partial (Contracted third-party packaging aggregators)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-gray-800">Chemical & Pesticide Free</td>
                <td className="p-3 text-[#c4622d] font-semibold">✅ Certified Organic & Small Batch Tested</td>
                <td className="p-3 text-gray-500">❌ Commercial mass-market stock</td>
                <td className="p-3 text-gray-500">⚠️ Premium category only (high markups)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-gray-800">Artisan Cooperatives Revenue</td>
                <td className="p-3 text-[#c4622d] font-semibold">✅ Over 70% revenue returns to local farmers</td>
                <td className="p-3 text-gray-500">❌ 0% (Corporate profits & venture margins)</td>
                <td className="p-3 text-gray-500">❌ 0% (Corporate logistics distribution structures)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-gray-800">Processing Method</td>
                <td className="p-3 text-[#c4622d] font-semibold">✅ Traditional (Cold-pressed, stone-ground, raw)</td>
                <td className="p-3 text-gray-500">❌ High-heat commercial processing & shelf preservatives</td>
                <td className="p-3 text-gray-500">❌ Standard industrial refining & mass chemical filters</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-gray-800">Focus Area</td>
                <td className="p-3 text-[#c4622d] font-semibold">✅ Pure Nutrition & Community Empowerment</td>
                <td className="p-3 text-gray-500">❌ 10-minute bulk delivery logistics convenience</td>
                <td className="p-3 text-gray-500">❌ Corporate inventory scale & discount promotions</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Peoples Also Asked Interceptions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 text-center">Frequently Asked Sourcing Questions</h2>
          
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Google Search People Also Ask</span>
            <h3 className="font-bold text-gray-900 text-sm">Is there an organic local alternative to Amazon Fresh and Flipkart Grocery in Ranchi?</h3>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              Yes! <strong>GaramBazaar</strong> is Ranchi's local community marketplace offering traceable, certified organic pantry staples and A2 dairy products sourced directly from regional farmer cooperatives, delivering fresh produce faster and cleaner than mass corporate warehouses.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Google Search People Also Ask</span>
            <h3 className="font-bold text-gray-900 text-sm">How does GaramBazaar's honey and ghee compare to Blinkit or Zepto listings?</h3>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              Unlike Blinkit or Zepto which list factory-processed, pasteurized honey and mass-refined ghee, GaramBazaar specializes in raw, unprocessed, wild forest honey and wood-churned A2 Desi cow ghee. We prioritize health and purity over immediate 10-minute convenience.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate("/shop")}
            className="bg-[#c4622d] hover:bg-[#a95223] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md text-sm cursor-pointer"
          >
            🌿 Browse Organic Catalog
          </button>
        </div>

      </div>
    </section>
  );
}
