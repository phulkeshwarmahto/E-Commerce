import { useParams, useNavigate } from "react-router-dom";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

const staticPages = {
  "shipping-policy": {
    title: "Shipping & Delivery Policy",
    subtitle: "Transparent, secure, and reliable shipping direct from local partners to your doorstep.",
    content: (
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="bg-[#f5f0e8] border border-[#e0d5c5] rounded-xl p-5">
          <h3 className="font-bold text-[#2c1a0e] text-base mb-2">🚚 Shipping Charges & Free Delivery</h3>
          <p>
            We offer flat rate shipping fees based on your delivery destination and order subtotal. All orders above the free shipping threshold qualify for <strong>FREE Delivery</strong> across India. You can configure and manage the free shipping threshold dynamically in the administrator settings panel.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base">🕒 Dispatch & Transit Times</h3>
          <p>
            Orders are typically dispatched within <strong>1–2 business days</strong> of payment confirmation. Once shipped, you will receive an SMS and email notification with details about tracking.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Local Deliveries (Ranchi & Jharkhand):</strong> Delivered within 1–2 business days.</li>
            <li><strong>Metro Regions (Delhi, Mumbai, Bengaluru, etc.):</strong> Delivered within 3–5 business days.</li>
            <li><strong>Rest of India:</strong> Delivered within 5–7 business days depending on location accessibility.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base">📦 Packaging & Freshness Commitment</h3>
          <p>
            We package all flour, honey, ghee, and pantry items in food-grade, eco-friendly, carbon-neutral glass jars and paper boxes to ensure optimal purity and zero plastic contamination. Ghee and wild honeys are bubble-wrapped safely using biodegradable paper wraps to survive transit.
          </p>
        </div>
      </div>
    )
  },
  "easy-returns": {
    title: "Easy Returns & Cancellations",
    subtitle: "7-day hassle-free return policy for organic food products and handlooms.",
    content: (
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="bg-[#f5f0e8] border border-[#e0d5c5] rounded-xl p-5">
          <h3 className="font-bold text-[#2c1a0e] text-base mb-2">↩️ Our 7-Day Return Policy</h3>
          <p>
            We strive to deliver the absolute highest quality organic ingredients. If you are dissatisfied with the quality, freshness, or condition of your items, you can request a replacement or refund within <strong>7 days of delivery</strong> under "My Orders" page.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base">📋 Return Eligibility Guidelines</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Perishables & Food Items:</strong> Eligible for return if received damaged, spoiled, or past expiration date. No physical return of food is required in cases of damage — simply submit a photo during the return claim.</li>
            <li><strong>Non-Perishables & Crafts:</strong> Must be unused, unwashed, and returned in original packaging tags.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base">💰 Refund Process</h3>
          <p>
            Once a return is approved by the admin team, refunds are processed immediately back to the original payment method. Card/Net Banking refunds take <strong>3–5 bank working days</strong> to reflect, while UPI/Wallet refunds are credited within <strong>24 hours</strong>.
          </p>
        </div>
      </div>
    )
  },
  "faq": {
    title: "Frequently Asked Questions",
    subtitle: "Common answers about ordering, farmer cooperatives, organic certification, and shipping.",
    content: (
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">🌾 How does GramBazaar source its products?</h3>
          <p className="text-gray-600">
            We partner directly with Self-Help Groups (SHGs), organic farmer collectives, and traditional artisan families. There are no middlemen in our supply line. 70%+ of consumer revenue goes directly to rural farmers.
          </p>
        </div>
        <hr className="border-gray-150" />
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">🔒 Are the payments on GramBazaar secure?</h3>
          <p className="text-gray-600">
            Yes! We integrate with Razorpay, a fully secure, PCI-DSS compliant Indian payment gateway. We support all major Credit/Debit cards, UPI VPAs, and Net Banking. All transactions are SSL encrypted.
          </p>
        </div>
        <hr className="border-gray-150" />
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">🐝 Is your forest honey pasteurized?</h3>
          <p className="text-gray-600">
            Absolutely not. GramBazaar honey is raw, single-source forest honey. It is double-filtered to remove physical debris but is not heated or pasteurized, preserving all enzymes, minerals, and healthy pollen.
          </p>
        </div>
        <hr className="border-gray-150" />
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">📦 Can I track my order status?</h3>
          <p className="text-gray-600">
            Yes, you can track the status of all orders under "My Orders" tab on your profile page. We also send real-time SMS and email updates at every stage of packaging and transit.
          </p>
        </div>
      </div>
    )
  },
  "about-us": {
    title: "Our Story & Sourcing Blueprint",
    subtitle: "Empowering rural communities and bringing clean organic heritage foods back to urban tables.",
    content: (
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed text-left">
        <p>
          GramBazaar was founded in Ranchi with a simple, powerful vision: <strong>to bridge the gap between India's organic farmers and urban families seeking clean food.</strong>
        </p>
        <p>
          Our regional farmlands are rich in biodiversity and traditional agricultural wisdom. However, local smallholder farmers often lack access to premium markets, forcing them to sell healthy harvest to brokers at unviable wholesale prices.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div className="bg-[#f5f0e8] border border-[#e0d5c5] rounded-xl p-4 text-center">
            <span className="text-3xl block mb-2">🌿</span>
            <strong className="block text-[#2c1a0e] text-sm mb-1">100% Traceable</strong>
            <span className="text-xs text-gray-500">Every pack features farmer group identification and sourcing area.</span>
          </div>
          <div className="bg-[#f5f0e8] border border-[#e0d5c5] rounded-xl p-4 text-center">
            <span className="text-3xl block mb-2">🤝</span>
            <strong className="block text-[#2c1a0e] text-sm mb-1">Fair Trade Returns</strong>
            <span className="text-xs text-gray-500">Farmers receive fair prices determined together, avoiding predatory broker margins.</span>
          </div>
        </div>
        <p>
          By establishing direct farm-to-table traceability and ensuring cold-pressed, stone-ground, preservative-free minimal processing, we bring pure nutrition to Ranchi households while raising agricultural livelihoods in regional villages.
        </p>
      </div>
    )
  },
  "blog": {
    title: "GramBazaar Journal",
    subtitle: "Traditional agricultural wisdom, seasonal recipes, and rural artisan spotlight stories.",
    content: (
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="space-y-2 border-b border-gray-100 pb-5 text-left">
          <span className="text-[10px] bg-orange-50 border border-orange-200 text-[#ea580c] font-black uppercase tracking-wider px-2 py-0.5 rounded">Spotlight</span>
          <h3 className="font-bold text-gray-900 text-base mt-2">🌾 The Rise of Traditional Millets: Sourced from Ranchi Cooperatives</h3>
          <p className="text-gray-500 text-xs mt-1">Published on June 2, 2026 by GramBazaar Editorial</p>
          <p className="text-xs md:text-sm text-gray-600 mt-2">
            Millets are climate-resilient, water-efficient crops packed with iron, protein, and calcium. Read our deep dive into how smallholder farmer groups in rural Ranchi are reviving ragi, bajra, and jowar cultivation using organic farming methods.
          </p>
        </div>

        <div className="space-y-2 border-b border-gray-100 pb-5 text-left">
          <span className="text-[10px] bg-orange-50 border border-orange-200 text-[#ea580c] font-black uppercase tracking-wider px-2 py-0.5 rounded">Nutrition</span>
          <h3 className="font-bold text-gray-900 text-base mt-2">🍯 Raw Wild Forest Honey vs Commercial Honey: The Sugar Truth</h3>
          <p className="text-gray-500 text-xs mt-1">Published on May 28, 2026 by Dr. Anjali Mehta, Nutrition Consultant</p>
          <p className="text-xs md:text-sm text-gray-600 mt-2">
            Most commercial supermarket honeys are ultra-filtered and pasteurized at high heat, destroying natural pollen and nutritional value. Discover the enzymes, health benefits, and natural crystallization process of raw, unpasteurized honey.
          </p>
        </div>
      </div>
    )
  },
  "careers": {
    title: "Careers at GramBazaar",
    subtitle: "Help us build a cleaner, fairer, and more community-driven supply chain. Join our mission.",
    content: (
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed text-left">
        <p>
          We are always looking for passionate, impact-driven professionals to join our corporate and field teams. Based out of Ranchi, Jharkhand, our roles offer competitive compensation, health benefits, and unique opportunities to work directly with rural collectives.
        </p>
        <div className="space-y-4 mt-6">
          <h3 className="font-bold text-gray-900 text-base">🔥 Open Positions</h3>
          <div className="border border-gray-200 rounded-xl p-4 bg-white flex justify-between items-center hover:shadow-sm transition-all">
            <div>
              <strong className="block text-gray-950 text-sm">📦 Logistics Operations Manager</strong>
              <span className="text-xs text-gray-500 mt-0.5 block">Full-time · Ranchi HQ</span>
            </div>
            <button className="text-[#c4622d] font-bold text-xs hover:underline cursor-pointer border-0 bg-transparent">Apply Now</button>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 bg-white flex justify-between items-center hover:shadow-sm transition-all">
            <div>
              <strong className="block text-gray-950 text-sm">🌾 Farmer Cooperative Field Coordinator</strong>
              <span className="text-xs text-gray-500 mt-0.5 block">Full-time · Jharkhand Regional Villages</span>
            </div>
            <button className="text-[#c4622d] font-bold text-xs hover:underline cursor-pointer border-0 bg-transparent">Apply Now</button>
          </div>
        </div>
      </div>
    )
  },
  "press": {
    title: "Press & Media Center",
    subtitle: "Official press releases, media coverage, brand assets, and story coordinates.",
    content: (
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed text-left">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-base">📢 Media Coverage</h3>
          <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-start gap-4">
            <span className="text-2xl mt-1">🗞️</span>
            <div>
              <strong className="block text-gray-950 text-sm">GramBazaar Awarded 'Rural Impact Enterprise of the Year' 2026</strong>
              <p className="text-gray-500 text-xs mt-1">
                Local newspapers featured our efforts in training over 500+ tribal women in sustainable honey harvesting and organic spice grading.
              </p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-start gap-4">
            <span className="text-2xl mt-1">📺</span>
            <div>
              <strong className="block text-gray-950 text-sm">Cooperative Spotlight on Ranchi Doordarshan</strong>
              <p className="text-gray-500 text-xs mt-1">
                A documentary segment showcasing the cold-press wood-churned mustard oil processing units established in collaboration with GramBazaar.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "sustainability": {
    title: "Sustainability & Carbon-Neutral Goals",
    subtitle: "Protecting biodiversity, reducing food miles, and committing to carbon-neutral packaging.",
    content: (
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed text-left">
        <p>
          GramBazaar is dedicated to maintaining a carbon-neutral footprint and preserving local eco-systems. Our sustainability directives target three key areas:
        </p>
        <ul className="list-decimal pl-5 space-y-4 mt-4">
          <li>
            <strong>Zero-Plastic Glass Container Initiative:</strong> We package dry grains, flours, cold-pressed oils, and wild honeys in reusable, food-grade glass jars and cardboard boxes. We encourage Ranchi consumers to return empty jars upon their next delivery in exchange for loyalty GramCoins.
          </li>
          <li>
            <strong>Reducing Food Miles:</strong> We source 100% of our honey, ghee, millets, and spices from farmers inside a 200km radius of our Ranchi distribution hub, keeping logistics emissions lower than commercial national aggregators.
          </li>
          <li>
            <strong>Biodiversity Protection:</strong> We fund organic farming workshops, composting training, and seed preservation for local farmer cooperatives to safeguard Soil Health and surrounding flora.
          </li>
        </ul>
      </div>
    )
  }
};

export function StaticContentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const page = staticPages[slug] || {
    title: "Page Not Found",
    subtitle: "The requested information page could not be located.",
    content: (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm mb-6">We apologize for the inconvenience. The page may have been moved or renamed.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#c4622d] hover:bg-[#a95223] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs cursor-pointer border-0"
        >
          Return Home
        </button>
      </div>
    )
  };

  useDocumentMetadata({
    title: `${page.title} - GramBazaar Information`,
    description: page.subtitle,
  });

  return (
    <section className="page-content bg-gray-50 py-12 px-4 md:px-8 min-h-screen text-left">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-1">Information Center</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#2c1a0e] leading-tight">
            {page.title}
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
            {page.subtitle}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {page.content}
        </div>

        {/* Back navigation */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate("/")}
            className="text-xs font-semibold text-gray-500 hover:text-[#c4622d] transition-colors bg-transparent border-0 cursor-pointer"
          >
            ← Return to Homepage
          </button>
        </div>

      </div>
    </section>
  );
}
