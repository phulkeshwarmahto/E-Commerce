import { useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const PRODUCTS = [
  {id:1,  name:"Himalayan Rock Salt",     cat:"Pantry",        price:149, orig:null, rating:4.5, rc:1234, e:"🧂",  badge:"new",  stock:true,  desc:"Pure mineral-rich salt from ancient sea beds. 84 trace minerals. No additives or bleaching agents used.", spec:{Weight:"500g", Origin:"Himalayas", Shelf_life:"3 years", Type:"Rock Salt"}, bg:"#fdf0f0"},
  {id:2,  name:"Cold Brew Concentrate",   cat:"Beverages",     price:299, orig:349,  rating:4.3, rc:872,  e:"☕",  badge:"sale", stock:true,  desc:"72-hour cold brewed Arabica concentrate. Smooth, low-acid. Makes up to 6 cups. Refrigerate after opening.", spec:{Volume:"500ml", Serves:"6 cups", Process:"Cold Brew 72hr", Roast:"Medium Dark"}, bg:"#f5ede0"},
  {id:3,  name:"Organic Wild Honey",      cat:"Pantry",        price:399, orig:null, rating:4.8, rc:3421, e:"🍯",  badge:null,   stock:true,  desc:"Raw wildflower honey from forest beehives. Unfiltered & unheated to preserve natural enzymes and antioxidants.", spec:{Weight:"500g", Type:"Wild Honey", Processing:"Raw Unfiltered", Certification:"Organic India"}, bg:"#fdf5e0"},
  {id:4,  name:"Bamboo Dish Brush",       cat:"Home",          price:189, orig:null, rating:4.1, rc:456,  e:"🪥",  badge:"new",  stock:true,  desc:"Eco-friendly natural bristle brush. FSC-certified bamboo handle. Biodegradable. Lasts 3× longer than plastic.", spec:{Material:"Bamboo + Sisal", Length:"28cm", Biodegradable:"Yes", Pack:"Single"}, bg:"#f0f5ee"},
  {id:5,  name:"Olive Oil Extra Virgin",  cat:"Pantry",        price:549, orig:649,  rating:4.6, rc:2103, e:"🫒",  badge:"sale", stock:true,  desc:"Single-origin cold-pressed from Rajasthan. Acidity < 0.5%. Stone-mill extracted for full flavour.", spec:{Volume:"500ml", Acidity:"<0.5%", Process:"Cold Press", Origin:"Rajasthan, India"}, bg:"#f2f5e0"},
  {id:6,  name:"Neem & Turmeric Soap",    cat:"Personal Care", price:220, orig:null, rating:4.4, rc:789,  e:"🧼",  badge:null,   stock:true,  desc:"Handcrafted with real neem leaf extract and turmeric. Zero SLS, parabens or synthetic fragrances. 100g bar.", spec:{Weight:"100g", Skin:"All Types", Free_from:"SLS, Parabens", pH:"5.5–6.5"}, bg:"#f0ecf8"},
  {id:7,  name:"Steel Tiffin 3-Tier",     cat:"Home",          price:349, orig:null, rating:4.2, rc:1876, e:"🍱",  badge:null,   stock:true,  desc:"Food-grade 304 stainless steel. Leak-proof silicone gasket. Dishwasher safe. Fits in standard bags.", spec:{Material:"304 Stainless", Tiers:"3", Capacity:"3×350ml", Dishwasher:"Safe"}, bg:"#eff5f8"},
  {id:8,  name:"Darjeeling Green Tea",    cat:"Beverages",     price:249, orig:null, rating:4.7, rc:5432, e:"🍵",  badge:null,   stock:true,  desc:"First flush hand-rolled Darjeeling leaves. Light floral notes with muscatel character. ~25 cups per pack.", spec:{Weight:"50g", Cups:"~25", Flush:"First Flush", Region:"Darjeeling, WB"}, bg:"#edf5ed"},
  {id:9,  name:"Pure Jaggery Block",      cat:"Pantry",        price:120, orig:null, rating:4.3, rc:643,  e:"🟫",  badge:"new",  stock:true,  desc:"Unprocessed sugarcane jaggery from Maharashtra. No chemicals. Rich in iron and magnesium.", spec:{Weight:"500g", Type:"Sugarcane", Additives:"None", Rich_in:"Iron, Mg"}, bg:"#fdf3e0"},
  {id:10, name:"Handloom Kitchen Towel",  cat:"Home",          price:179, orig:220,  rating:3.9, rc:321,  e:"🏮",  badge:"sale", stock:false, desc:"Handwoven on traditional looms by artisans in Pochampally. Fast-dry 100% cotton. Set of 3.", spec:{Material:"100% Cotton", Qty:"Set of 3", Technique:"Handloom", Care:"Machine Wash"}, bg:"#f8f0ec"},
  {id:11, name:"Moringa Leaf Powder",     cat:"Health",        price:329, orig:null, rating:4.6, rc:987,  e:"🌿",  badge:null,   stock:true,  desc:"Sun-dried drumstick leaves, finely powdered. 7× more Vitamin C than oranges. 200g resealable pouch.", spec:{Weight:"200g", Form:"Fine Powder", Key_Nutrient:"Vit C, Iron, Ca", Shelf:"18 months"}, bg:"#edf5ee"},
  {id:12, name:"Terracotta Planter",      cat:"Home",          price:299, orig:null, rating:4.5, rc:432,  e:"🪴",  badge:"new",  stock:true,  desc:"Handthrown clay pot. Natural porous walls allow air circulation for healthier plant roots.", spec:{Diameter:"6 inch", Material:"Terracotta Clay", Drainage:"Yes", Handmade:"Yes"}, bg:"#f8ece6"},
  {id:13, name:"Virgin Coconut Oil",      cat:"Personal Care", price:280, orig:320,  rating:4.4, rc:2341, e:"🥥",  badge:"sale", stock:true,  desc:"Cold-pressed, unrefined, unbleached. Use as deep conditioning hair mask or skin moisturizer. 300ml.", spec:{Volume:"300ml", Process:"Cold Press", Grade:"Virgin", Refined:"No"}, bg:"#f5f9f0"},
  {id:14, name:"Golden Milk Latte Mix",   cat:"Beverages",     price:199, orig:null, rating:4.2, rc:567,  e:"🌼",  badge:null,   stock:true,  desc:"Turmeric, ginger, black pepper & ashwagandha blend. Just add warm milk. 200g resealable tin.", spec:{Weight:"200g", Key_Herbs:"Turmeric, Ashwagandha", Sugar_free:"Yes", Serves:"~20"}, bg:"#fdf8e0"},
  {id:15, name:"Ashwagandha KSM-66",      cat:"Health",        price:499, orig:599,  rating:4.7, rc:4321, e:"💊",  badge:"sale", stock:true,  desc:"500mg KSM-66 ashwagandha root extract. Clinically studied for stress, stamina & cortisol control.", spec:{Count:"60 capsules", Dose:"500mg", Extract:"KSM-66", Veg:"Yes"}, bg:"#f0f5f0"},
  {id:16, name:"Brass Pooja Thali Set",   cat:"Home",          price:899, orig:null, rating:4.9, rc:876,  e:"🪔",  badge:null,   stock:true,  desc:"Handcrafted pure brass thali. 12-inch antique finish. Includes diya, bell, incense holder & bowl.", spec:{Diameter:"12 inch", Material:"Pure Brass", Finish:"Antique", Includes:"6 pieces"}, bg:"#fdf8e8"},
  {id:17, name:"Kashmiri Saffron",        cat:"Pantry",        price:799, orig:999,  rating:4.8, rc:2109, e:"🌺",  badge:"sale", stock:true,  desc:"Pure Grade A Mongra saffron, 1g. ISO certified. Long red threads, intense colour and deep aroma.", spec:{Weight:"1g", Grade:"Grade A Mongra", Certified:"ISO", Origin:"Kashmir"}, bg:"#fdf0f5"},
  {id:18, name:"Charcoal Detox Soap",     cat:"Personal Care", price:245, orig:null, rating:4.1, rc:334,  e:"⬛",  badge:"new",  stock:true,  desc:"Deep pore cleansing with activated bamboo charcoal. Oil-control for combination and oily skin.", spec:{Weight:"100g", Key_Ingredient:"Activated Bamboo Charcoal", Skin:"Oily/Combo", pH:"Balanced"}, bg:"#f0f0f0"},
  {id:19, name:"Flaxseed Oil",            cat:"Health",        price:380, orig:null, rating:4.5, rc:678,  e:"🌾",  badge:null,   stock:true,  desc:"Cold-pressed, rich in Omega-3 ALA. Refrigerate after opening. Dark glass bottle for freshness. 500ml.", spec:{Volume:"500ml", Omega3:"High ALA", Process:"Cold Press", Refrigerate:"After Opening"}, bg:"#f5f3e8"},
  {id:20, name:"Dhoop Cone Incense",      cat:"Home",          price:149, orig:null, rating:4.6, rc:1234, e:"🕯️", badge:null,   stock:true,  desc:"Natural masala dhoop cones. No bamboo core. Hand-rolled by artisans in Bangalore. 40 cones.", spec:{Count:"40 cones", Burn_Time:"~20 min", Type:"Natural Masala", Bamboo_free:"Yes"}, bg:"#f8f3e5"},
  {id:21, name:"Sabja Seeds",             cat:"Health",        price:159, orig:200,  rating:4.3, rc:543,  e:"🌱",  badge:"sale", stock:true,  desc:"Sweet basil seeds (falooda seeds). High in fibre. Soak 15 min before use in drinks or desserts.", spec:{Weight:"100g", Fibre:"High", Soak:"15 min", Uses:"Drinks, Desserts"}, bg:"#edf5ed"},
  {id:22, name:"Copper Water Bottle",     cat:"Home",          price:599, orig:null, rating:4.7, rc:3201, e:"🫙",  badge:null,   stock:true,  desc:"Pure copper, 1L. Natural antimicrobial properties. Store water overnight for Ayurvedic benefit.", spec:{Volume:"1L", Material:"Pure Copper", Cap:"Leak-proof", Dishwasher:"No"}, bg:"#f8f3e0"},
  {id:23, name:"Bulgarian Rose Water",    cat:"Personal Care", price:320, orig:399,  rating:4.5, rc:1456, e:"🌹",  badge:"sale", stock:true,  desc:"Steam-distilled Bulgarian rose water. No alcohol or additives. Tones, hydrates and soothes. 200ml.", spec:{Volume:"200ml", Source:"Bulgarian Rose", Alcohol:"0%", Shelf:"18 months"}, bg:"#fdf0f5"},
  {id:24, name:"Multani Mitti Pack",      cat:"Personal Care", price:149, orig:null, rating:4.2, rc:876,  e:"🏺",  badge:null,   stock:true,  desc:"Pure Fuller's Earth clay. Cosmetic grade. Unscented deep cleansing face & hair pack. 200g pouch.", spec:{Weight:"200g", Grade:"Cosmetic", Scent:"None", Use:"Face & Hair"}, bg:"#f5f0e8"},
  {id:25, name:"Amla Powder",             cat:"Health",        price:189, orig:null, rating:4.5, rc:765,  e:"🟢",  badge:null,   stock:true,  desc:"Sun-dried Indian gooseberry powder. Highest natural source of Vitamin C. Hair & immunity booster.", spec:{Weight:"200g", Vit_C:"Highest Natural", Form:"Fine Powder", Shelf:"12 months"}, bg:"#edf7ee"},
  {id:26, name:"Ghee Cultured Desi",      cat:"Pantry",        price:699, orig:799,  rating:4.9, rc:5678, e:"🥛",  badge:"sale", stock:true,  desc:"A2 milk cultured desi ghee. Bilona churned. Granular texture. Deep nutty aroma. 500ml glass jar.", spec:{Volume:"500ml", Milk:"A2 Gir Cow", Method:"Bilona Churned", Jar:"Glass"}, bg:"#fdf8e5"},
  {id:27, name:"Bamboo Toothbrush Set",   cat:"Personal Care", price:259, orig:null, rating:4.3, rc:432,  e:"🪷",  badge:"new",  stock:true,  desc:"100% biodegradable bamboo handles. Activated charcoal infused BPA-free bristles. Pack of 4.", spec:{Pack:"4 brushes", Handle:"Bamboo", Bristle:"Charcoal BPA-free", Biodegradable:"Yes"}, bg:"#f0f5f0"},
  {id:28, name:"Tulsi Herbal Tea",        cat:"Beverages",     price:179, orig:null, rating:4.4, rc:987,  e:"🌿",  badge:null,   stock:true,  desc:"Holy basil (Krishna Tulsi) herbal tea. Caffeine-free. Immunity supporting. 25 pyramid bags.", spec:{Count:"25 bags", Type:"Herbal", Caffeine:"Free", Key_Herb:"Krishna Tulsi"}, bg:"#edf5ee"},
  { "id":29, "name":"Almond Butter Crunchy", "cat":"Pantry", "price":450, "orig":520, "rating":4.6, "rc":1543, "e":"🥜", "badge":"sale", "stock":true, "desc":"Stone-ground crunchy almond butter. No added sugar or hydrogenated oils.", "spec":{"Weight":"350g","Type":"Crunchy","Sugar":"0 Added","Protein":"High"}, "bg":"#f5efe0" },
  { "id":30, "name":"Quinoa White Premium", "cat":"Pantry", "price":320, "orig":null, "rating":4.5, "rc":987, "e":"🌾", "badge":null, "stock":true, "desc":"High-protein gluten-free quinoa grains. Quick cooking superfood.", "spec":{"Weight":"500g","Protein":"High","Gluten":"Free","Origin":"India"}, "bg":"#f2f5ed" },
  { "id":31, "name":"Matcha Green Tea", "cat":"Beverages", "price":699, "orig":799, "rating":4.7, "rc":2100, "e":"🍵", "badge":"sale", "stock":true, "desc":"Ceremonial grade Japanese matcha powder. Rich antioxidants.", "spec":{"Weight":"50g","Grade":"Ceremonial","Origin":"Japan","Caffeine":"Low"}, "bg":"#edf7ed" },
  { "id":32, "name":"Reusable Grocery Bag", "cat":"Home", "price":199, "orig":null, "rating":4.3, "rc":654, "e":"🛍️", "badge":"new", "stock":true, "desc":"Foldable eco-friendly cotton grocery bag. Washable and durable.", "spec":{"Material":"Cotton","Washable":"Yes","Capacity":"10kg","Reusable":"Yes"}, "bg":"#eef5f2" },
  { "id":33, "name":"Herbal Hair Oil", "cat":"Personal Care", "price":299, "orig":349, "rating":4.4, "rc":1789, "e":"💆", "badge":"sale", "stock":true, "desc":"Ayurvedic blend of bhringraj, amla & coconut oil for hair growth.", "spec":{"Volume":"200ml","Hair_Type":"All","Chemicals":"Free","Use":"Hair Growth"}, "bg":"#f5f0f8" },
  { "id":34, "name":"Chia Seeds Organic", "cat":"Health", "price":220, "orig":null, "rating":4.6, "rc":1321, "e":"🌱", "badge":null, "stock":true, "desc":"Omega-3 rich chia seeds. Great for smoothies and puddings.", "spec":{"Weight":"250g","Omega3":"High","Fibre":"Rich","Use":"Smoothies"}, "bg":"#edf5ee" },
  { "id":35, "name":"Cast Iron Tawa", "cat":"Home", "price":899, "orig":999, "rating":4.7, "rc":2103, "e":"🍳", "badge":"sale", "stock":true, "desc":"Pre-seasoned cast iron tawa for healthy cooking.", "spec":{"Material":"Cast Iron","Diameter":"28cm","Preseasoned":"Yes","Induction":"No"}, "bg":"#f2f2f2" },
  { "id":36, "name":"Herbal Face Wash", "cat":"Personal Care", "price":199, "orig":null, "rating":4.2, "rc":765, "e":"🧴", "badge":null, "stock":true, "desc":"Gentle herbal cleanser with aloe vera & neem.", "spec":{"Volume":"150ml","Skin":"All","Paraben":"Free","Use":"Daily"}, "bg":"#f0f5f8" },
  { "id":37, "name":"Peanut Chikki", "cat":"Pantry", "price":120, "orig":null, "rating":4.3, "rc":543, "e":"🍬", "badge":"new", "stock":true, "desc":"Traditional jaggery peanut brittle. Energy-rich snack.", "spec":{"Weight":"200g","Sugar":"Jaggery","Protein":"Moderate","Type":"Snack"}, "bg":"#fdf3e0" },
  { "id":38, "name":"Insulated Water Bottle", "cat":"Home", "price":599, "orig":699, "rating":4.6, "rc":1890, "e":"🚰", "badge":"sale", "stock":true, "desc":"Double wall vacuum insulated bottle. Keeps drinks hot/cold.", "spec":{"Volume":"750ml","Material":"Steel","Hot":"12hr","Cold":"24hr"}, "bg":"#eef3f8" },
  { "id":39, "name":"Protein Oats Mix", "cat":"Health", "price":350, "orig":399, "rating":4.5, "rc":1450, "e":"🥣", "badge":"sale", "stock":true, "desc":"Instant oats enriched with plant protein.", "spec":{"Weight":"500g","Protein":"High","Type":"Instant","Flavor":"Natural"}, "bg":"#f5f5ed" },
  { "id":40, "name":"Lavender Essential Oil", "cat":"Personal Care", "price":499, "orig":null, "rating":4.7, "rc":980, "e":"🌸", "badge":null, "stock":true, "desc":"Pure lavender oil for relaxation and aromatherapy.", "spec":{"Volume":"15ml","Type":"Essential Oil","Use":"Aroma","Purity":"100%"}, "bg":"#f5f0f8" },
  { "id":41, "name":"Millet Cookies", "cat":"Pantry", "price":180, "orig":220, "rating":4.2, "rc":432, "e":"🍪", "badge":"sale", "stock":true, "desc":"Healthy cookies made from millet flour.", "spec":{"Weight":"200g","Gluten":"Free","Sugar":"Low","Type":"Snack"}, "bg":"#fdf5e5" },
  { "id":42, "name":"Yoga Mat Eco", "cat":"Health", "price":799, "orig":899, "rating":4.6, "rc":2100, "e":"🧘", "badge":"sale", "stock":true, "desc":"Non-slip eco-friendly yoga mat.", "spec":{"Thickness":"6mm","Material":"TPE","NonSlip":"Yes","Use":"Yoga"}, "bg":"#eef5f0" },
  { "id":43, "name":"Dishwasher Liquid", "cat":"Home", "price":220, "orig":null, "rating":4.3, "rc":876, "e":"🧼", "badge":null, "stock":true, "desc":"Plant-based dishwashing liquid. Tough on grease.", "spec":{"Volume":"500ml","Type":"Liquid","Chemical":"Low","Eco":"Yes"}, "bg":"#f0f5f8" },
  { "id":44, "name":"Dates Premium", "cat":"Pantry", "price":350, "orig":null, "rating":4.7, "rc":1654, "e":"🌴", "badge":null, "stock":true, "desc":"Soft premium dates rich in fiber and natural sugar.", "spec":{"Weight":"500g","Sugar":"Natural","Fibre":"High","Origin":"Middle East"}, "bg":"#fdf0e5" },
  { "id":45, "name":"Turmeric Capsules", "cat":"Health", "price":299, "orig":349, "rating":4.5, "rc":980, "e":"💊", "badge":"sale", "stock":true, "desc":"Curcumin-rich turmeric capsules for immunity.", "spec":{"Count":"60","Dose":"500mg","Type":"Veg","Use":"Immunity"}, "bg":"#fdf5e0" },
  { "id":101, "name":"Herbal Tooth Powder", "cat":"Personal Care", "price":149, "orig":null, "rating":4.4, "rc":876, "e":"🦷", "badge":"new", "stock":true, "desc":"Traditional tooth powder with clove and neem.", "spec":{"Weight":"100g","Fluoride":"Free","Type":"Powder","Use":"Oral Care"}, "bg":"#f0f5f0" },
{"id":46,"name":"Ragi Flour Organic","cat":"Pantry","price":180,"orig":null,"rating":4.4,"rc":765,"e":"🌾","badge":null,"stock":true,"desc":"Stone-ground ragi flour rich in calcium.","spec":{"Weight":"1kg","Type":"Whole Grain","Calcium":"High","Gluten":"Free"},"bg":"#f5f3e8"},
{"id":47,"name":"Herbal Shampoo","cat":"Personal Care","price":299,"orig":349,"rating":4.3,"rc":1230,"e":"🧴","badge":"sale","stock":true,"desc":"Sulfate-free shampoo with aloe & hibiscus.","spec":{"Volume":"200ml","Hair":"All Types","Free_from":"SLS","Use":"Daily"},"bg":"#f0ecf8"},
{"id":48,"name":"Steel Water Jug","cat":"Home","price":499,"orig":null,"rating":4.5,"rc":876,"e":"🫙","badge":null,"stock":true,"desc":"Durable stainless steel water jug.","spec":{"Capacity":"2L","Material":"Steel","Dishwasher":"Yes","Rust":"Resistant"},"bg":"#eff5f8"},
{"id":49,"name":"Pumpkin Seeds","cat":"Health","price":220,"orig":null,"rating":4.6,"rc":543,"e":"🎃","badge":null,"stock":true,"desc":"Roasted pumpkin seeds rich in zinc.","spec":{"Weight":"200g","Protein":"High","Minerals":"Zinc","Snack":"Healthy"},"bg":"#edf5ed"},
{"id":50,"name":"Aloe Vera Gel","cat":"Personal Care","price":180,"orig":220,"rating":4.4,"rc":1650,"e":"🌿","badge":"sale","stock":true,"desc":"Pure aloe vera gel for skin hydration.","spec":{"Volume":"200ml","Skin":"All","Use":"Moisturizer","Paraben":"Free"},"bg":"#edf7ee"},
{"id":51,"name":"Herbal Kadha Mix","cat":"Beverages","price":199,"orig":null,"rating":4.5,"rc":876,"e":"🍵","badge":"new","stock":true,"desc":"Immunity boosting herbal kadha mix.","spec":{"Weight":"150g","Type":"Herbal","Sugar":"Free","Use":"Immunity"},"bg":"#fdf8e0"},
{"id":52,"name":"Wooden Rolling Pin","cat":"Home","price":249,"orig":null,"rating":4.2,"rc":432,"e":"🥖","badge":null,"stock":true,"desc":"Traditional wooden belan for roti.","spec":{"Material":"Wood","Length":"30cm","Finish":"Smooth","Use":"Kitchen"},"bg":"#f8ece6"},
{"id":53,"name":"Protein Peanut Butter","cat":"Health","price":350,"orig":399,"rating":4.6,"rc":1980,"e":"🥜","badge":"sale","stock":true,"desc":"High protein peanut butter with no sugar.","spec":{"Weight":"350g","Protein":"High","Sugar":"0","Type":"Smooth"},"bg":"#f5efe0"},
{"id":54,"name":"Herbal Face Pack","cat":"Personal Care","price":220,"orig":null,"rating":4.3,"rc":654,"e":"🏺","badge":null,"stock":true,"desc":"Natural face pack with multani mitti.","spec":{"Weight":"200g","Skin":"Oily","Use":"Face Pack","Chemical":"Free"},"bg":"#f5f0e8"},
{"id":55,"name":"Black Raisins","cat":"Pantry","price":260,"orig":null,"rating":4.5,"rc":987,"e":"🍇","badge":null,"stock":true,"desc":"Naturally sun-dried black raisins.","spec":{"Weight":"500g","Sugar":"Natural","Iron":"High","Snack":"Healthy"},"bg":"#fdf0f5"},
{"id":56,"name":"Fitness Resistance Band","cat":"Health","price":299,"orig":null,"rating":4.4,"rc":1450,"e":"🏋️","badge":"new","stock":true,"desc":"Elastic resistance band for workouts.","spec":{"Material":"Latex","Level":"Medium","Use":"Workout","Portable":"Yes"},"bg":"#eef5f0"},
{"id":57,"name":"Copper Pooja Kalash","cat":"Home","price":399,"orig":null,"rating":4.7,"rc":654,"e":"🪔","badge":null,"stock":true,"desc":"Pure copper kalash for rituals.","spec":{"Material":"Copper","Finish":"Glossy","Use":"Pooja","Handmade":"Yes"},"bg":"#fdf8e8"},
{"id":58,"name":"Flax Seeds","cat":"Health","price":180,"orig":220,"rating":4.5,"rc":1200,"e":"🌾","badge":"sale","stock":true,"desc":"Omega-3 rich flax seeds.","spec":{"Weight":"250g","Omega3":"High","Fibre":"Rich","Use":"Diet"},"bg":"#f5f3e8"},
{"id":59,"name":"Herbal Lip Balm","cat":"Personal Care","price":99,"orig":null,"rating":4.3,"rc":876,"e":"💄","badge":null,"stock":true,"desc":"Moisturizing lip balm with shea butter.","spec":{"Weight":"10g","Use":"Lip Care","Paraben":"Free","Flavor":"Natural"},"bg":"#fdf0f5"},
{"id":60,"name":"Brown Rice","cat":"Pantry","price":299,"orig":null,"rating":4.6,"rc":2100,"e":"🍚","badge":null,"stock":true,"desc":"Whole grain brown rice rich in fiber.","spec":{"Weight":"1kg","Fibre":"High","Type":"Whole Grain","Origin":"India"},"bg":"#fdf5e0"},
{"id":61,"name":"Herbal Handwash","cat":"Personal Care","price":180,"orig":220,"rating":4.4,"rc":1100,"e":"🧼","badge":"sale","stock":true,"desc":"Antibacterial herbal handwash.","spec":{"Volume":"250ml","Skin":"All","Type":"Liquid","Free":"Paraben"},"bg":"#f0f5f8"},
{"id":62,"name":"Steel Lunch Box","cat":"Home","price":399,"orig":null,"rating":4.5,"rc":1654,"e":"🍱","badge":null,"stock":true,"desc":"Compact stainless steel lunch box.","spec":{"Material":"Steel","Capacity":"800ml","Leakproof":"Yes","Dishwasher":"Yes"},"bg":"#eff5f8"},
{"id":63,"name":"Sunflower Seeds","cat":"Health","price":160,"orig":null,"rating":4.3,"rc":765,"e":"🌻","badge":null,"stock":true,"desc":"Crunchy sunflower seeds snack.","spec":{"Weight":"200g","VitaminE":"High","Snack":"Healthy","Salt":"Light"},"bg":"#edf5ed"},
{"id":64,"name":"Herbal Conditioner","cat":"Personal Care","price":320,"orig":null,"rating":4.4,"rc":876,"e":"🧴","badge":null,"stock":true,"desc":"Smoothening herbal conditioner.","spec":{"Volume":"200ml","Hair":"Dry","Use":"Conditioner","Free":"SLS"},"bg":"#f0ecf8"},
{"id":65,"name":"Masala Chai Mix","cat":"Beverages","price":220,"orig":null,"rating":4.6,"rc":2100,"e":"☕","badge":null,"stock":true,"desc":"Spiced chai mix with herbs.","spec":{"Weight":"200g","Flavor":"Masala","Serves":"20","Type":"Tea"},"bg":"#fdf8e0"},
{"id":66,"name":"Clay Water Pot","cat":"Home","price":350,"orig":null,"rating":4.5,"rc":654,"e":"🏺","badge":"new","stock":true,"desc":"Earthen pot for natural cooling.","spec":{"Capacity":"5L","Material":"Clay","Cooling":"Natural","Handmade":"Yes"},"bg":"#f8ece6"},
{"id":67,"name":"Cashew Nuts Premium","cat":"Pantry","price":650,"orig":750,"rating":4.7,"rc":2100,"e":"🥜","badge":"sale","stock":true,"desc":"Whole premium cashew nuts.","spec":{"Weight":"500g","Grade":"W320","Protein":"High","Snack":"Healthy"},"bg":"#fdf5e5"},
{"id":68,"name":"Skipping Rope","cat":"Health","price":199,"orig":null,"rating":4.3,"rc":987,"e":"🤾","badge":null,"stock":true,"desc":"Adjustable skipping rope for fitness.","spec":{"Length":"Adjustable","Material":"PVC","Use":"Cardio","Portable":"Yes"},"bg":"#eef5f0"},
{"id":69,"name":"Rose Face Mist","cat":"Personal Care","price":249,"orig":299,"rating":4.5,"rc":1321,"e":"🌹","badge":"sale","stock":true,"desc":"Refreshing rose mist toner.","spec":{"Volume":"150ml","Skin":"All","Use":"Toner","Alcohol":"Free"},"bg":"#fdf0f5"},
{"id":70,"name":"Basmati Rice Premium","cat":"Pantry","price":599,"orig":699,"rating":4.8,"rc":3200,"e":"🍚","badge":"sale","stock":true,"desc":"Long grain aromatic basmati rice.","spec":{"Weight":"1kg","Grain":"Long","Aroma":"High","Origin":"India"},"bg":"#fdf5e0"},
{"id":71,"name":"Yoga Block","cat":"Health","price":249,"orig":null,"rating":4.4,"rc":654,"e":"🧘","badge":null,"stock":true,"desc":"Support block for yoga poses.","spec":{"Material":"Foam","Weight":"Light","Use":"Yoga","Grip":"Non-slip"},"bg":"#eef5f0"},
{"id":72,"name":"Dish Scrubber Coconut","cat":"Home","price":99,"orig":null,"rating":4.2,"rc":432,"e":"🧽","badge":"new","stock":true,"desc":"Natural coconut fiber scrubber.","spec":{"Material":"Coconut Fiber","Eco":"Yes","Use":"Dishwash","Pack":"2"},"bg":"#f0f5ee"},
{"id":73,"name":"Walnuts Premium","cat":"Pantry","price":799,"orig":899,"rating":4.7,"rc":1890,"e":"🌰","badge":"sale","stock":true,"desc":"Omega-3 rich premium walnuts.","spec":{"Weight":"500g","Omega3":"High","Snack":"Healthy","Origin":"Kashmir"},"bg":"#fdf3e0"},
{"id":74,"name":"Herbal Kajal","cat":"Personal Care","price":180,"orig":null,"rating":4.3,"rc":876,"e":"👁️","badge":null,"stock":true,"desc":"Smudge-proof herbal kajal.","spec":{"Weight":"3g","Type":"Eye","Smudge":"No","Chemical":"Free"},"bg":"#f0ecf8"},
{"id":75,"name":"Green Moong Dal","cat":"Pantry","price":199,"orig":null,"rating":4.5,"rc":1650,"e":"🌱","badge":null,"stock":true,"desc":"Whole green moong dal rich in protein.","spec":{"Weight":"1kg","Protein":"High","Type":"Whole","Origin":"India"},"bg":"#edf5ed"},
{"id":76,"name":"Foam Roller","cat":"Health","price":599,"orig":null,"rating":4.4,"rc":765,"e":"🏋️","badge":null,"stock":true,"desc":"Muscle recovery foam roller.","spec":{"Length":"30cm","Density":"Medium","Use":"Recovery","Portable":"Yes"},"bg":"#eef5f0"},
{"id":77,"name":"Wooden Spoon Set","cat":"Home","price":299,"orig":null,"rating":4.3,"rc":543,"e":"🥄","badge":null,"stock":true,"desc":"Set of 3 wooden cooking spoons.","spec":{"Material":"Wood","Qty":"3","Heat":"Resistant","Use":"Cooking"},"bg":"#f8ece6"},
{"id":78,"name":"Dry Figs","cat":"Pantry","price":450,"orig":null,"rating":4.6,"rc":1100,"e":"🍑","badge":null,"stock":true,"desc":"Naturally dried figs rich in fiber.","spec":{"Weight":"250g","Fibre":"High","Sugar":"Natural","Snack":"Healthy"},"bg":"#fdf3e0"},
{"id":79,"name":"Herbal Sunscreen","cat":"Personal Care","price":349,"orig":399,"rating":4.4,"rc":980,"e":"☀️","badge":"sale","stock":true,"desc":"SPF 50 herbal sunscreen.","spec":{"Volume":"100ml","SPF":"50","Skin":"All","Chemical":"Free"},"bg":"#fdf5e0"},
{"id":80,"name":"Instant Lemon Drink Mix","cat":"Beverages","price":150,"orig":null,"rating":4.2,"rc":432,"e":"🍋","badge":null,"stock":true,"desc":"Refreshing lemon drink powder.","spec":{"Weight":"200g","Serves":"10","Flavor":"Lemon","Sugar":"Low"},"bg":"#fdf8e0"},
{"id":81,"name":"Push Up Bars","cat":"Health","price":399,"orig":null,"rating":4.5,"rc":876,"e":"🏋️","badge":null,"stock":true,"desc":"Strong push-up support bars.","spec":{"Material":"Steel","Grip":"Anti-slip","Use":"Workout","Portable":"Yes"},"bg":"#eef5f0"},
{"id":82,"name":"Steel Tea Strainer","cat":"Home","price":120,"orig":null,"rating":4.3,"rc":654,"e":"☕","badge":null,"stock":true,"desc":"Fine mesh steel tea strainer.","spec":{"Material":"Steel","Mesh":"Fine","Use":"Tea","Rust":"No"},"bg":"#eff5f8"},
{"id":83,"name":"Black Pepper Whole","cat":"Pantry","price":199,"orig":null,"rating":4.6,"rc":1100,"e":"🧂","badge":null,"stock":true,"desc":"Whole black peppercorns.","spec":{"Weight":"200g","Type":"Whole","Flavor":"Strong","Origin":"India"},"bg":"#fdf0f0"},
{"id":84,"name":"Hair Serum Herbal","cat":"Personal Care","price":320,"orig":null,"rating":4.4,"rc":987,"e":"💆","badge":null,"stock":true,"desc":"Frizz control herbal hair serum.","spec":{"Volume":"100ml","Hair":"Dry","Use":"Serum","Free":"Silicone"},"bg":"#f0ecf8"},
{"id":85,"name":"Masoor Dal","cat":"Pantry","price":160,"orig":null,"rating":4.5,"rc":1450,"e":"🌾","badge":null,"stock":true,"desc":"Split red lentils rich in protein.","spec":{"Weight":"1kg","Protein":"High","Type":"Split","Cook":"Fast"},"bg":"#fdf5e0"},
{"id":86,"name":"Ab Roller","cat":"Health","price":499,"orig":599,"rating":4.6,"rc":1650,"e":"🏋️","badge":"sale","stock":true,"desc":"Core strengthening ab roller.","spec":{"Material":"Steel","Grip":"Foam","Use":"Core","Portable":"Yes"},"bg":"#eef5f0"},
{"id":87,"name":"Glass Storage Jar","cat":"Home","price":299,"orig":null,"rating":4.5,"rc":876,"e":"🫙","badge":null,"stock":true,"desc":"Airtight glass jar for storage.","spec":{"Volume":"1L","Material":"Glass","Lid":"Airtight","Use":"Kitchen"},"bg":"#f8f3e0"},
{"id":88,"name":"Dry Apricots","cat":"Pantry","price":500,"orig":null,"rating":4.6,"rc":765,"e":"🍑","badge":null,"stock":true,"desc":"Sweet dried apricots.","spec":{"Weight":"250g","Fibre":"High","Sugar":"Natural","Snack":"Healthy"},"bg":"#fdf3e0"},
{"id":89,"name":"Body Lotion Herbal","cat":"Personal Care","price":299,"orig":null,"rating":4.4,"rc":1200,"e":"🧴","badge":null,"stock":true,"desc":"Hydrating herbal body lotion.","spec":{"Volume":"200ml","Skin":"Dry","Use":"Daily","Paraben":"Free"},"bg":"#f0ecf8"},
{"id":90,"name":"Green Tea Bags","cat":"Beverages","price":199,"orig":null,"rating":4.5,"rc":2100,"e":"🍵","badge":null,"stock":true,"desc":"Refreshing antioxidant green tea.","spec":{"Count":"25","Type":"Tea Bags","Caffeine":"Low","Use":"Daily"},"bg":"#edf5ed"},
{"id":91,"name":"Dumbbells Set","cat":"Health","price":999,"orig":1199,"rating":4.7,"rc":1890,"e":"🏋️","badge":"sale","stock":true,"desc":"Adjustable dumbbells set.","spec":{"Weight":"10kg","Material":"Iron","Adjustable":"Yes","Use":"Workout"},"bg":"#eef5f0"},
{"id":92,"name":"Kitchen Knife Set","cat":"Home","price":799,"orig":null,"rating":4.6,"rc":1650,"e":"🔪","badge":null,"stock":true,"desc":"Sharp stainless steel knife set.","spec":{"Material":"Steel","Qty":"3","Sharpness":"High","Use":"Kitchen"},"bg":"#f8ece6"},
{"id":93,"name":"Chickpeas Kabuli","cat":"Pantry","price":180,"orig":null,"rating":4.5,"rc":1450,"e":"🌱","badge":null,"stock":true,"desc":"Protein-rich kabuli chana.","spec":{"Weight":"1kg","Protein":"High","Type":"Whole","Cook":"Medium"},"bg":"#edf5ed"},
{"id":94,"name":"Face Serum Vitamin C","cat":"Personal Care","price":499,"orig":599,"rating":4.6,"rc":2100,"e":"✨","badge":"sale","stock":true,"desc":"Brightening vitamin C serum.","spec":{"Volume":"30ml","Skin":"All","Use":"Glow","Free":"Paraben"},"bg":"#fdf0f5"},
{"id":95,"name":"Energy Drink Powder","cat":"Beverages","price":250,"orig":null,"rating":4.3,"rc":876,"e":"⚡","badge":null,"stock":true,"desc":"Instant energy drink mix.","spec":{"Weight":"250g","Serves":"15","Sugar":"Low","Use":"Energy"},"bg":"#fdf8e0"},
{"id":96,"name":"Kettlebell 8kg","cat":"Health","price":899,"orig":999,"rating":4.7,"rc":1320,"e":"🏋️","badge":"sale","stock":true,"desc":"Solid iron kettlebell.","spec":{"Weight":"8kg","Material":"Iron","Grip":"Wide","Use":"Workout"},"bg":"#eef5f0"},
{"id":97,"name":"Non-stick Fry Pan","cat":"Home","price":699,"orig":null,"rating":4.5,"rc":1650,"e":"🍳","badge":null,"stock":true,"desc":"Non-stick frying pan.","spec":{"Diameter":"28cm","Coating":"Non-stick","Induction":"Yes","Use":"Cooking"},"bg":"#f2f2f2"},
{"id":98,"name":"Pistachios Roasted","cat":"Pantry","price":850,"orig":950,"rating":4.8,"rc":2100,"e":"🥜","badge":"sale","stock":true,"desc":"Salted roasted pistachios.","spec":{"Weight":"500g","Protein":"High","Snack":"Premium","Origin":"Iran"},"bg":"#fdf5e5"},
{"id":99,"name":"Charcoal Face Mask","cat":"Personal Care","price":199,"orig":null,"rating":4.3,"rc":987,"e":"⬛","badge":"new","stock":true,"desc":"Deep cleansing charcoal mask.","spec":{"Weight":"100g","Skin":"Oily","Use":"Face","Detox":"Yes"},"bg":"#f0f0f0"},
{"id":100,"name":"Herbal Tooth Powder","cat":"Personal Care","price":149,"orig":null,"rating":4.4,"rc":876,"e":"🦷","badge":"new","stock":true,"desc":"Traditional herbal tooth powder.","spec":{"Weight":"100g","Fluoride":"Free","Type":"Powder","Use":"Oral Care"},"bg":"#f0f5f0"}
];

const CATS = ["All","Pantry","Beverages","Home","Personal Care","Health"];

const REVIEWS = [
  {name:"Ananya S.", rating:5, date:"Apr 2025", text:"Absolutely love this! Quality exceeded my expectations. Already placed a second order."},
  {name:"Rajesh K.", rating:4, date:"Mar 2025", text:"Good product, packaging could be sturdier. Delivery was fast though, came in 2 days."},
  {name:"Priya M.",  rating:5, date:"Feb 2025", text:"Best in this category. Fresh, authentic quality. The whole family loves it. Highly recommend!"},
  {name:"Vikram T.", rating:3, date:"Jan 2025", text:"It's alright. Not exactly as described but decent for the price. Might try other brands."},
  {name:"Sunita R.", rating:5, date:"Dec 2024", text:"Superb quality! Using it daily now. Great value for money. GramBazaar packaging is excellent."},
];

const PROMO_CODES = {GRAM10:10, SAVE20:20, FIRST50:50};


/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500&family=Nunito:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cream:#f5f0e8;--warm:#faf7f2;--tc:#c4622d;--tcl:#e07a4a;
  --dk:#2c1a0e;--mid:#5a3a1a;--lt:#9b6b3a;--sage:#6b8f71;
  --gold:#c9a84c;--bd:#e0d5c5;--sh:rgba(44,26,14,.12);
  --red:#dc2626;--green:#16a34a;--blue:#2563eb;
}
body{font-family:'Nunito',sans-serif;background:var(--cream);color:var(--dk);min-height:100vh}
a{cursor:pointer;text-decoration:none}
button{cursor:pointer;border:none;background:none;font-family:'Nunito',sans-serif}

/* ── PAGE TRANSITIONS ── */
.page-wrapper{position:relative}
.page-enter{animation:pageIn .32s cubic-bezier(.22,1,.36,1) both}
.page-exit{animation:pageOut .22s cubic-bezier(.55,0,1,.45) both}
@keyframes pageIn{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}
@keyframes pageOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-10px) scale(.99)}}
.slide-right{animation:slideRight .3s cubic-bezier(.22,1,.36,1) both}
.slide-left{animation:slideLeft .3s cubic-bezier(.22,1,.36,1) both}
@keyframes slideRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
@keyframes slideLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}
.fade-up{animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.stagger-1{animation-delay:.05s} .stagger-2{animation-delay:.1s} .stagger-3{animation-delay:.15s} .stagger-4{animation-delay:.2s}

/* ── NAV ── */
.nav{background:var(--dk);position:sticky;top:0;z-index:200;box-shadow:0 2px 16px rgba(0,0,0,.3)}
.nav-top{display:flex;align-items:center;gap:1rem;padding:.7rem 1.5rem;border-bottom:1px solid rgba(255,255,255,.06)}
.nav-logo{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:800;color:var(--cream);white-space:nowrap;display:flex;align-items:center;gap:.4rem;cursor:pointer}
.nav-logo span{color:var(--tc)}
.nav-search{flex:1;display:flex;max-width:680px;border-radius:3px;overflow:hidden;border:2px solid var(--gold)}
.nav-search select{background:var(--cream);border:none;padding:0 .6rem;font-size:.78rem;font-family:'Nunito',sans-serif;color:var(--mid);min-width:90px;cursor:pointer;border-right:1px solid var(--bd)}
.nav-search input{flex:1;padding:.55rem .8rem;border:none;font-size:.9rem;font-family:'Nunito',sans-serif;color:var(--dk);background:white;outline:none}
.nav-search-btn{background:var(--gold);border:none;padding:0 1rem;font-size:1.1rem;cursor:pointer;transition:background .2s}
.nav-search-btn:hover{background:var(--tc)}
.nav-icons{display:flex;align-items:center;gap:.25rem;margin-left:auto}
.nav-icon-btn{background:none;border:none;color:var(--cream);padding:.45rem .8rem;border-radius:3px;font-size:.78rem;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;transition:background .2s;white-space:nowrap}
.nav-icon-btn:hover{background:rgba(255,255,255,.1)}
.nav-icon-btn .icon{font-size:1.15rem}
.nav-icon-btn .lbl{font-size:.65rem;opacity:.8}
.nav-badge{background:var(--tc);color:white;font-size:.6rem;font-weight:700;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;position:absolute;top:2px;right:2px}
.nav-icon-wrap{position:relative;display:inline-flex}
.nav-bottom{display:flex;gap:1.5rem;padding:.45rem 1.5rem;background:rgba(0,0,0,.2)}
.nav-bottom a{color:rgba(245,240,232,.75);font-size:.78rem;font-weight:500;letter-spacing:.04em;transition:color .2s}
.nav-bottom a:hover{color:var(--cream)}
.nav-bottom a.active{color:var(--gold)}

/* ── PAGE LAYOUT ── */
.page{min-height:calc(100vh - 120px)}

/* ── HERO ── */
.hero{background:linear-gradient(135deg,var(--dk) 0%,var(--mid) 55%,#7a3e1c 100%);padding:3.5rem 2rem;display:flex;align-items:center;gap:3rem;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-100px;right:-100px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(196,98,45,.2) 0%,transparent 70%);pointer-events:none}
.hero-text{flex:1;z-index:1}
.hero-tag{display:inline-block;background:var(--tc);color:white;font-size:.68rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:.28rem .75rem;border-radius:2px;margin-bottom:1rem}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:800;line-height:1.15;color:var(--cream);margin-bottom:1rem}
.hero h1 em{color:var(--gold);font-style:normal}
.hero p{font-size:.92rem;color:rgba(245,240,232,.65);line-height:1.7;margin-bottom:1.5rem;max-width:460px}
.hero-cta{background:var(--tc);color:white;padding:.85rem 2rem;border-radius:3px;font-size:.95rem;font-weight:700;letter-spacing:.04em;transition:background .2s,transform .15s;display:inline-block}
.hero-cta:hover{background:var(--tcl);transform:translateY(-1px)}
.hero-emoji{font-size:clamp(5rem,10vw,9rem);filter:drop-shadow(0 8px 32px rgba(0,0,0,.4));z-index:1}
.trust-bar{display:flex;gap:2rem;padding:1rem 2rem;background:var(--warm);border-bottom:1px solid var(--bd);overflow-x:auto}
.trust-item{display:flex;align-items:center;gap:.5rem;white-space:nowrap;font-size:.8rem;color:var(--mid);font-weight:600}
.trust-item span:first-child{font-size:1.2rem}
.section{padding:2rem}
.sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1.2rem}
.sec-head h2{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700}
.sec-head a{font-size:.82rem;color:var(--tc);font-weight:600;transition:opacity .2s}
.sec-head a:hover{opacity:.7}
.sec-label{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--lt);margin-bottom:.2rem}
.hscroll{display:flex;gap:1rem;overflow-x:auto;padding-bottom:.5rem;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}
.hscroll::-webkit-scrollbar{height:4px}
.hscroll::-webkit-scrollbar-track{background:transparent}
.hscroll::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px}
.cat-card{flex:0 0 120px;background:white;border:1px solid var(--bd);border-radius:6px;padding:1.2rem .8rem;text-align:center;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:.5rem}
.cat-card:hover{border-color:var(--tc);transform:translateY(-2px);box-shadow:0 4px 16px var(--sh)}
.cat-emoji{font-size:2rem}
.cat-name{font-size:.78rem;font-weight:600;color:var(--dk)}
.deal-section{padding:0 2rem 2rem}
.deal-card{background:linear-gradient(135deg,#2c1a0e,#5a3a1a);border-radius:8px;padding:2rem;display:flex;align-items:center;gap:2rem;position:relative;overflow:hidden}
.deal-card::after{content:'';position:absolute;right:-60px;top:-60px;width:280px;height:280px;border-radius:50%;background:rgba(196,98,45,.15);pointer-events:none}
.deal-label{font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:.5rem}
.deal-name{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;color:var(--cream);margin-bottom:.5rem}
.deal-desc{font-size:.83rem;color:rgba(245,240,232,.6);margin-bottom:1rem;line-height:1.6;max-width:380px}
.deal-price{display:flex;align-items:baseline;gap:.75rem;margin-bottom:1rem}
.deal-price .now{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--cream)}
.deal-price .was{font-size:1rem;color:rgba(245,240,232,.4);text-decoration:line-through}
.deal-price .off{background:var(--tc);color:white;font-size:.72rem;font-weight:700;padding:.25rem .6rem;border-radius:100px}
.deal-timer{display:flex;gap:.75rem;margin-bottom:1.2rem}
.timer-box{background:rgba(255,255,255,.1);border-radius:4px;padding:.5rem .75rem;text-align:center;min-width:56px}
.timer-box strong{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:white;display:block}
.timer-box span{font-size:.65rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em}
.deal-emoji{font-size:7rem;filter:drop-shadow(0 4px 16px rgba(0,0,0,.3));z-index:1}
.promo-strip{display:grid;grid-template-columns:1fr 1fr;gap:1rem;padding:0 2rem 2rem}
.promo-card{border-radius:6px;padding:1.5rem;display:flex;justify-content:space-between;align-items:center}
.promo-card h3{font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:.3rem}
.promo-card p{font-size:.78rem;opacity:.75;line-height:1.5}
.promo-card .pe{font-size:2.5rem}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}

/* ── PRODUCT CARDS ── */
.pcard{background:white;border:1px solid var(--bd);border-radius:6px;overflow:hidden;transition:box-shadow .2s,transform .2s;cursor:default;display:flex;flex-direction:column}
.pcard:hover{box-shadow:0 6px 24px var(--sh);transform:translateY(-3px)}
.pcard-img{height:160px;display:flex;align-items:center;justify-content:center;font-size:3.5rem;position:relative;overflow:hidden;cursor:pointer}
.pcard-badge{position:absolute;top:8px;left:8px;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .5rem;border-radius:2px}
.pcard-badge.sale{background:var(--tc);color:white}
.pcard-badge.new{background:var(--sage);color:white}
.pcard-wl{position:absolute;top:8px;right:8px;background:white;border:1px solid var(--bd);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.95rem;color:#aaa;transition:all .2s;z-index:1}
.pcard-wl:hover{border-color:var(--tc);color:var(--tc)}
.pcard-wl.active{border-color:var(--tc);color:var(--tc)}
.pcard-out{position:absolute;inset:0;background:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:var(--red);letter-spacing:.08em}
.pcard-body{padding:.9rem;flex:1;display:flex;flex-direction:column}
.pcard-cat{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--lt);margin-bottom:.3rem}
.pcard-name{font-family:'Playfair Display',serif;font-size:.95rem;font-weight:600;line-height:1.25;margin-bottom:.4rem;color:var(--dk)}
.pcard-name:hover{color:var(--tc)}
.stars{color:var(--gold);letter-spacing:.05em}
.pcard-rating{display:flex;align-items:center;gap:.4rem;font-size:.72rem;color:#999;margin-bottom:.5rem}
.pcard-rating .stars{font-size:.75rem}
.pcard-price-row{display:flex;align-items:baseline;gap:.5rem;margin-bottom:.7rem}
.pcard-price{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:var(--dk)}
.pcard-orig{font-size:.75rem;color:#bbb;text-decoration:line-through}
.pcard-off{font-size:.68rem;color:var(--tc);font-weight:700}
.pcard-add{width:100%;background:var(--cream);border:1px solid var(--bd);color:var(--dk);padding:.5rem;border-radius:3px;font-size:.82rem;font-weight:600;letter-spacing:.04em;transition:all .2s;margin-top:auto}
.pcard-add:hover:not(:disabled){background:var(--tc);color:white;border-color:var(--tc)}
.pcard-add.added{background:var(--sage);color:white;border-color:var(--sage)}
.pcard-add:disabled{opacity:.5;cursor:not-allowed}

/* ── SHOP ── */
.shop-layout{display:grid;grid-template-columns:220px 1fr;gap:1.5rem;padding:1.5rem 2rem;align-items:start}
.filter-sidebar{background:white;border:1px solid var(--bd);border-radius:6px;padding:1.2rem;position:sticky;top:130px}
.filter-sidebar h3{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;margin-bottom:1rem;padding-bottom:.6rem;border-bottom:1px solid var(--bd)}
.filter-group{margin-bottom:1.2rem}
.filter-group label{display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--mid);margin-bottom:.5rem}
.filter-option{display:flex;align-items:center;gap:.5rem;font-size:.82rem;padding:.25rem 0;cursor:pointer;color:var(--dk)}
.filter-option input{accent-color:var(--tc)}
.price-inputs{display:flex;gap:.5rem;align-items:center}
.price-inputs input{flex:1;padding:.35rem .5rem;border:1px solid var(--bd);border-radius:3px;font-size:.8rem;font-family:'Nunito',sans-serif;text-align:center;width:60px;outline:none}
.filter-apply{width:100%;background:var(--tc);color:white;padding:.6rem;border-radius:3px;font-size:.82rem;font-weight:600;margin-bottom:.4rem;transition:background .2s}
.filter-apply:hover{background:var(--tcl)}
.filter-clear{width:100%;background:none;border:1px solid var(--bd);color:var(--lt);padding:.5rem;border-radius:3px;font-size:.78rem;transition:all .2s}
.filter-clear:hover{border-color:var(--tc);color:var(--tc)}
.shop-main{}
.shop-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;padding-bottom:.8rem;border-bottom:1px solid var(--bd)}
.shop-toolbar span{font-size:.83rem;color:var(--lt)}
.sort-sel{border:1px solid var(--bd);border-radius:3px;padding:.4rem .7rem;font-size:.82rem;font-family:'Nunito',sans-serif;color:var(--dk);background:white;cursor:pointer;outline:none}
.pgrid-lg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:1rem}
.active-filters{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.8rem}
.filter-tag{background:var(--cream);border:1px solid var(--bd);border-radius:100px;padding:.2rem .7rem;font-size:.75rem;display:flex;align-items:center;gap:.3rem;color:var(--dk)}
.filter-tag button{color:var(--lt);font-size:.85rem;line-height:1;background:none;border:none;cursor:pointer}
.no-results{text-align:center;padding:4rem 2rem;color:var(--lt)}
.no-results p{font-size:3rem;margin-bottom:1rem}

/* ── PRODUCT DETAIL ── */
.detail-layout{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;padding:2rem;max-width:1100px;margin:0 auto}
.detail-img-main{background:white;border:1px solid var(--bd);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:6rem;height:320px;margin-bottom:.8rem;position:relative}
.detail-img-thumbs{display:flex;gap:.6rem}
.detail-thumb{width:64px;height:64px;background:white;border:2px solid var(--bd);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;cursor:pointer;transition:border-color .2s}
.detail-thumb.active{border-color:var(--tc)}
.detail-info-col{display:flex;flex-direction:column;gap:1rem}
.detail-brand{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--lt)}
.detail-name{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;line-height:1.2;color:var(--dk)}
.detail-rating{display:flex;align-items:center;gap:.7rem}
.detail-rating .stars{font-size:1rem}
.detail-rating .rc{font-size:.82rem;color:var(--tc)}
.detail-price-row{display:flex;align-items:baseline;gap:.75rem}
.detail-price{font-family:'Playfair Display',serif;font-size:2rem;font-weight:800;color:var(--dk)}
.detail-was{font-size:1rem;color:#bbb;text-decoration:line-through}
.detail-off{background:var(--green);color:white;font-size:.72rem;font-weight:700;padding:.25rem .55rem;border-radius:3px}
.detail-stock{font-size:.82rem;font-weight:600}
.detail-stock.in{color:var(--green)} .detail-stock.out{color:var(--red)}
.detail-qty-row{display:flex;align-items:center;gap:1rem}
.detail-qty-row label{font-size:.8rem;font-weight:600;color:var(--mid)}
.qty-ctrl{display:flex;align-items:center;border:1px solid var(--bd);border-radius:3px;overflow:hidden}
.qty-ctrl button{padding:.4rem .75rem;font-size:1rem;font-weight:600;color:var(--dk);transition:background .15s}
.qty-ctrl button:hover{background:var(--cream)}
.qty-ctrl span{padding:.4rem .85rem;border-left:1px solid var(--bd);border-right:1px solid var(--bd);font-size:.9rem;font-weight:600;min-width:42px;text-align:center}
.detail-actions{display:flex;gap:.75rem}
.btn-cart{flex:1;background:var(--gold);color:var(--dk);padding:.85rem;border-radius:3px;font-size:.9rem;font-weight:700;letter-spacing:.04em;transition:background .2s,transform .15s}
.btn-cart:hover{background:#d4b255;transform:translateY(-1px)}
.btn-buy{flex:1;background:var(--tc);color:white;padding:.85rem;border-radius:3px;font-size:.9rem;font-weight:700;letter-spacing:.04em;transition:background .2s}
.btn-buy:hover{background:var(--tcl)}
.btn-wl{border:1.5px solid var(--bd);padding:.85rem 1rem;border-radius:3px;font-size:1.2rem;transition:all .2s;background:white}
.btn-wl:hover{border-color:var(--tc);background:var(--cream)}
.btn-wl.active{border-color:var(--tc);background:#fff0eb}
.detail-delivery{background:var(--warm);border:1px solid var(--bd);border-radius:4px;padding:1rem}
.detail-delivery h4{font-size:.8rem;font-weight:700;margin-bottom:.6rem;color:var(--mid);text-transform:uppercase;letter-spacing:.05em}
.delivery-row{display:flex;align-items:center;gap:.6rem;font-size:.8rem;margin-bottom:.4rem;color:var(--dk)}
.pin-check{display:flex;gap:.5rem;margin-top:.6rem}
.pin-check input{flex:1;padding:.4rem .7rem;border:1px solid var(--bd);border-radius:3px;font-size:.8rem;font-family:'Nunito',sans-serif}
.pin-check button{background:var(--tc);color:white;padding:.4rem .9rem;border-radius:3px;font-size:.78rem;font-weight:600}
.accordion-item{border:1px solid var(--bd);border-radius:4px;overflow:hidden;margin-bottom:.5rem}
.accordion-head{padding:.75rem 1rem;font-size:.85rem;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;background:white;transition:background .15s}
.accordion-head:hover{background:var(--cream)}
.accordion-body{padding:1rem;background:var(--warm);font-size:.82rem;line-height:1.7;color:#555;display:grid;grid-template-columns:auto 1fr;gap:.4rem .8rem}
.accordion-body span:nth-child(odd){font-weight:600;color:var(--dk)}

/* ── REVIEWS ── */
.reviews-section{padding:2rem;max-width:1100px;margin:0 auto;border-top:1px solid var(--bd)}
.rating-summary{display:flex;gap:2.5rem;align-items:center;background:white;border:1px solid var(--bd);border-radius:6px;padding:1.5rem;margin-bottom:1.5rem}
.big-rating{text-align:center}
.big-rating strong{font-family:'Playfair Display',serif;font-size:3rem;display:block;line-height:1}
.big-rating .stars{font-size:1.1rem}
.big-rating small{font-size:.78rem;color:#999;display:block;margin-top:.3rem}
.rating-bars{flex:1}
.rbar-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.4rem}
.rbar-row span{font-size:.75rem;white-space:nowrap;color:var(--mid);width:32px}
.rbar{flex:1;height:8px;background:var(--cream);border-radius:4px;overflow:hidden}
.rbar-fill{height:100%;background:var(--gold);border-radius:4px}
.rcard{background:white;border:1px solid var(--bd);border-radius:4px;padding:1rem;margin-bottom:.8rem;transition:box-shadow .2s}
.rcard:hover{box-shadow:0 2px 12px var(--sh)}
.rcard-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
.rcard-name{font-size:.85rem;font-weight:700}
.rcard-date{font-size:.72rem;color:#999}
.rcard-text{font-size:.83rem;line-height:1.65;color:#555}
.rcard-media{display:flex;gap:.5rem;margin-top:.7rem;flex-wrap:wrap}
.rcard-media-item{width:64px;height:64px;border-radius:4px;border:1px solid var(--bd);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:var(--cream);cursor:pointer;position:relative}
.rcard-media-item video{width:100%;height:100%;object-fit:cover}
.rcard-media-item img{width:100%;height:100%;object-fit:cover}
.rcard-media-item .play-icon{position:absolute;background:rgba(0,0,0,.5);color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:.7rem}
.review-form{background:white;border:1.5px solid var(--gold);border-radius:6px;padding:1.5rem;margin-bottom:1.5rem}
.review-form h3{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;margin-bottom:1rem}
.star-picker{display:flex;gap:.3rem;margin-bottom:.8rem}
.star-picker span{font-size:1.6rem;cursor:pointer;color:#ddd;transition:color .15s}
.star-picker span.lit{color:var(--gold)}
.review-textarea{width:100%;border:1px solid var(--bd);border-radius:4px;padding:.7rem;font-size:.85rem;font-family:'Nunito',sans-serif;resize:vertical;min-height:90px;outline:none;transition:border-color .2s;color:var(--dk)}
.review-textarea:focus{border-color:var(--tc)}
.review-media-upload{display:flex;gap:.5rem;margin:.7rem 0;flex-wrap:wrap;align-items:center}
.upload-btn{border:1.5px dashed var(--bd);border-radius:4px;padding:.4rem .8rem;font-size:.78rem;color:var(--lt);font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:.3rem}
.upload-btn:hover{border-color:var(--tc);color:var(--tc)}
.uploaded-preview{width:48px;height:48px;border-radius:4px;border:1px solid var(--bd);overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;font-size:1.2rem;background:var(--cream)}
.uploaded-preview img{width:100%;height:100%;object-fit:cover}
.uploaded-preview .rm-preview{position:absolute;top:-4px;right:-4px;background:var(--red);color:white;border-radius:50%;width:16px;height:16px;font-size:.6rem;display:flex;align-items:center;justify-content:center;cursor:pointer}
.review-submit-btn{background:var(--tc);color:white;padding:.6rem 1.5rem;border-radius:3px;font-size:.85rem;font-weight:700;transition:background .2s;margin-top:.5rem}
.review-submit-btn:hover{background:var(--tcl)}

/* ── CART ── */
.cart-layout{display:grid;grid-template-columns:1fr 340px;gap:1.5rem;padding:1.5rem 2rem;align-items:start}
.cart-title{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;margin-bottom:1.2rem;padding-bottom:.8rem;border-bottom:2px solid var(--bd)}
.citem{background:white;border:1px solid var(--bd);border-radius:4px;padding:1rem;display:grid;grid-template-columns:72px 1fr auto;gap:1rem;align-items:center;margin-bottom:.8rem}
.citem-img{width:72px;height:72px;background:var(--cream);border:1px solid var(--bd);border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer}
.citem-name{font-family:'Playfair Display',serif;font-size:.95rem;font-weight:600;cursor:pointer;margin-bottom:.25rem;color:var(--dk)}
.citem-name:hover{color:var(--tc)}
.citem-cat{font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--lt);margin-bottom:.5rem}
.citem-actions{display:flex;align-items:center;gap:.75rem}
.cqty{display:flex;align-items:center;border:1px solid var(--bd);border-radius:3px;overflow:hidden}
.cqty button{padding:.3rem .6rem;font-size:.9rem;font-weight:600;transition:background .15s}
.cqty button:hover{background:var(--cream)}
.cqty span{padding:.3rem .7rem;border-left:1px solid var(--bd);border-right:1px solid var(--bd);font-size:.85rem;font-weight:600;min-width:36px;text-align:center}
.rm-btn{font-size:.75rem;color:var(--red);font-weight:600;text-decoration:underline;background:none;border:none;cursor:pointer}
.save-btn{font-size:.75rem;color:var(--blue);font-weight:600;text-decoration:underline;background:none;border:none;cursor:pointer}
.citem-total{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;text-align:right}
.order-summary{background:white;border:1px solid var(--bd);border-radius:6px;padding:1.2rem;position:sticky;top:130px}
.order-summary h3{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;padding-bottom:.8rem;border-bottom:1px solid var(--bd);margin-bottom:1rem}
.sum-row{display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.6rem;color:#555}
.sum-row.total{font-size:1rem;font-weight:700;color:var(--dk);padding-top:.8rem;border-top:1px solid var(--bd);margin-top:.4rem}
.sum-row.save{color:var(--green);font-weight:600}
.promo-box{display:flex;gap:.5rem;margin:1rem 0}
.promo-box input{flex:1;padding:.5rem .7rem;border:1px solid var(--bd);border-radius:3px;font-size:.82rem;font-family:'Nunito',sans-serif;text-transform:uppercase}
.promo-box button{background:var(--dk);color:white;padding:.5rem .9rem;border-radius:3px;font-size:.8rem;font-weight:600}
.promo-success{font-size:.78rem;color:var(--green);font-weight:600;margin-bottom:.5rem}
.checkout-cta{width:100%;background:var(--tc);color:white;padding:.9rem;border-radius:3px;font-size:.95rem;font-weight:700;letter-spacing:.04em;transition:background .2s;margin-top:.8rem}
.checkout-cta:hover{background:var(--tcl)}
.checkout-cta:disabled{background:#ccc;cursor:not-allowed}
.secure-icons{display:flex;justify-content:center;gap:.6rem;margin-top:.8rem;font-size:.7rem;color:#999}
.empty-state{text-align:center;padding:4rem 2rem;color:var(--lt)}
.empty-state p{font-size:3rem;margin-bottom:1rem}
.empty-state h3{font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:.5rem;color:var(--dk)}
.empty-state small{font-size:.85rem}

/* ── CHECKOUT ── */
.checkout-layout{max-width:860px;margin:0 auto;padding:1.5rem 2rem;display:grid;grid-template-columns:1fr 300px;gap:1.5rem;align-items:start}
.steps{display:flex;gap:0;margin-bottom:1.5rem;grid-column:1/-1}
.step{flex:1;text-align:center;padding:.6rem;background:var(--cream);font-size:.78rem;font-weight:600;color:var(--lt);position:relative;border-bottom:3px solid var(--bd)}
.step.active{color:var(--tc);border-bottom-color:var(--tc);background:white}
.step.done{color:var(--green);border-bottom-color:var(--green);background:white}
.form-section{background:white;border:1px solid var(--bd);border-radius:6px;padding:1.5rem}
.form-section h3{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;margin-bottom:1.2rem}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-bottom:.8rem}
.form-row.full{grid-template-columns:1fr}
.form-group{display:flex;flex-direction:column;gap:.3rem}
.form-group label{font-size:.75rem;font-weight:600;color:var(--mid);text-transform:uppercase;letter-spacing:.05em}
.form-group input,.form-group select{padding:.55rem .75rem;border:1.5px solid var(--bd);border-radius:3px;font-size:.85rem;font-family:'Nunito',sans-serif;color:var(--dk);transition:border-color .2s;outline:none}
.form-group input:focus,.form-group select:focus{border-color:var(--tc)}
.payment-options{display:flex;flex-direction:column;gap:.6rem}
.pay-option{border:1.5px solid var(--bd);border-radius:4px;padding:.8rem 1rem;cursor:pointer;display:flex;align-items:center;gap:.8rem;transition:border-color .2s}
.pay-option:hover{border-color:var(--lt)}
.pay-option.selected{border-color:var(--tc);background:#fff8f5}
.pay-option .pay-icon{font-size:1.5rem}
.pay-option .pay-name{font-size:.85rem;font-weight:600;color:var(--dk)}
.pay-option .pay-desc{font-size:.72rem;color:#999}
.next-btn{width:100%;background:var(--tc);color:white;padding:.85rem;border-radius:3px;font-size:.9rem;font-weight:700;margin-top:1rem;transition:background .2s}
.next-btn:hover{background:var(--tcl)}
.success-card{background:white;border:1px solid var(--bd);border-radius:6px;padding:3rem 2rem;text-align:center;grid-column:1/-1}
.success-icon{font-size:4rem;margin-bottom:1rem}
.success-card h2{font-family:'Playfair Display',serif;font-size:2rem;font-weight:800;color:var(--dk);margin-bottom:.5rem}
.success-card p{color:var(--lt);font-size:.9rem;margin-bottom:1.5rem;line-height:1.6}
.order-id{background:var(--cream);border:1px solid var(--bd);border-radius:4px;padding:.6rem 1.2rem;display:inline-block;font-family:monospace;font-size:.9rem;font-weight:700;color:var(--dk);margin-bottom:1.5rem}
.mini-cart{background:white;border:1px solid var(--bd);border-radius:6px;padding:1rem}
.mini-cart h4{font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--mid);margin-bottom:.8rem}
.mini-item{display:flex;align-items:center;gap:.6rem;margin-bottom:.6rem;font-size:.8rem}
.mini-item .me{font-size:1.3rem}
.mini-item .mn{flex:1;color:var(--dk);font-weight:500;line-height:1.3}
.mini-item .mp{color:var(--lt);font-weight:600}

/* ── ORDERS ── */
.orders-page{padding:1.5rem 2rem;max-width:860px;margin:0 auto}
.orders-page h2{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;margin-bottom:1.5rem}
.order-card{background:white;border:1px solid var(--bd);border-radius:6px;overflow:hidden;margin-bottom:1rem}
.order-card-head{background:var(--warm);padding:.8rem 1.2rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--bd)}
.order-meta{font-size:.78rem;color:var(--lt)}
.order-meta strong{color:var(--dk);font-size:.85rem}
.order-status{font-size:.75rem;font-weight:700;padding:.25rem .75rem;border-radius:100px}
.status-delivered{background:#dcfce7;color:var(--green)}
.status-processing{background:#dbeafe;color:var(--blue)}
.status-returned{background:#fee2e2;color:var(--red)}
.status-shipped{background:#fef9c3;color:#a16207}
.order-card-body{padding:1rem 1.2rem}
.order-items{font-size:.82rem;color:var(--dk);margin-bottom:.75rem;line-height:1.7}
.order-footer{display:flex;justify-content:space-between;align-items:center}
.order-total{font-family:'Playfair Display',serif;font-weight:700;font-size:1rem}
.track-btn{background:none;border:1.5px solid var(--tc);color:var(--tc);padding:.4rem 1rem;border-radius:3px;font-size:.78rem;font-weight:600;transition:all .2s}
.track-btn:hover{background:var(--tc);color:white}
.track-panel{background:var(--warm);border-top:1px solid var(--bd);padding:1rem 1.2rem}
.track-steps{display:flex;flex-direction:column;gap:.4rem}
.track-step{display:flex;align-items:center;gap:.7rem;font-size:.8rem}
.track-dot{width:12px;height:12px;border-radius:50%;border:2px solid var(--bd);background:white;flex-shrink:0}
.track-dot.done{background:var(--green);border-color:var(--green)}
.track-dot.current{background:var(--tc);border-color:var(--tc)}
.track-step span:last-child{color:#999;font-size:.72rem;margin-left:auto}

/* ── WISHLIST ── */
.wishlist-page{padding:1.5rem 2rem}
.wishlist-page h2{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;margin-bottom:1.5rem}

/* ── ACCOUNT ── */
.account-page{padding:1.5rem 2rem;max-width:860px;margin:0 auto}
.account-grid{display:grid;grid-template-columns:280px 1fr;gap:1.5rem;align-items:start}
.profile-card{background:white;border:1px solid var(--bd);border-radius:6px;padding:1.5rem;text-align:center}
.profile-avatar{width:80px;height:80px;border-radius:50%;background:var(--dk);color:var(--cream);font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}
.profile-name{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;margin-bottom:.25rem}
.profile-email{font-size:.8rem;color:var(--lt);margin-bottom:1rem}
.profile-badge{background:var(--gold);color:var(--dk);font-size:.68rem;font-weight:700;padding:.2rem .7rem;border-radius:100px;display:inline-block;letter-spacing:.08em}
.account-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-top:1.2rem}
.account-stat{background:var(--cream);border-radius:4px;padding:.8rem;text-align:center}
.account-stat strong{font-family:'Playfair Display',serif;font-size:1.4rem;display:block;color:var(--dk)}
.account-stat span{font-size:.7rem;color:var(--lt)}
.account-links{background:white;border:1px solid var(--bd);border-radius:6px;overflow:hidden}
.acct-link{display:flex;align-items:center;gap:.8rem;padding:.9rem 1.2rem;border-bottom:1px solid var(--bd);cursor:pointer;transition:background .15s;font-size:.85rem;font-weight:600;color:var(--dk)}
.acct-link:last-child{border-bottom:none}
.acct-link:hover{background:var(--cream)}
.acct-link .al-icon{font-size:1.2rem}
.acct-link .al-arrow{margin-left:auto;color:var(--lt)}
.preferences-card{background:white;border:1px solid var(--bd);border-radius:6px;padding:1.2rem;margin-top:1rem}
.preferences-card h4{font-size:.85rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.06em;margin-bottom:1rem}
.pref-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem;font-size:.83rem}
.toggle{width:38px;height:20px;background:var(--bd);border-radius:100px;cursor:pointer;transition:background .2s;position:relative;flex-shrink:0}
.toggle.on{background:var(--sage)}
.toggle::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.toggle.on::after{transform:translateX(18px)}

/* ── AUTH ── */
.auth-overlay{position:fixed;inset:0;background:rgba(44,26,14,.6);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeOverlay .2s ease}
@keyframes fadeOverlay{from{opacity:0}to{opacity:1}}
.auth-modal{background:white;border-radius:10px;padding:2.5rem;width:min(420px,90vw);position:relative;animation:modalIn .28s cubic-bezier(.22,1,.36,1)}
@keyframes modalIn{from{opacity:0;transform:translateY(32px) scale(.95)}to{opacity:1;transform:none}}
.auth-close{position:absolute;top:1rem;right:1rem;font-size:1.3rem;color:#bbb;cursor:pointer;transition:color .2s;background:none;border:none}
.auth-close:hover{color:var(--dk)}
.auth-logo{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:800;color:var(--dk);text-align:center;margin-bottom:.3rem}
.auth-logo span{color:var(--tc)}
.auth-subtitle{font-size:.82rem;color:var(--lt);text-align:center;margin-bottom:1.5rem}
.auth-tabs{display:flex;border-bottom:2px solid var(--bd);margin-bottom:1.5rem}
.auth-tab{flex:1;padding:.6rem;font-size:.85rem;font-weight:700;text-align:center;cursor:pointer;color:var(--lt);transition:color .2s;border-bottom:2px solid transparent;margin-bottom:-2px}
.auth-tab.active{color:var(--tc);border-bottom-color:var(--tc)}
.auth-field{display:flex;flex-direction:column;gap:.3rem;margin-bottom:.9rem}
.auth-field label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--mid)}
.auth-field input{padding:.6rem .8rem;border:1.5px solid var(--bd);border-radius:4px;font-size:.88rem;font-family:'Nunito',sans-serif;color:var(--dk);outline:none;transition:border-color .2s}
.auth-field input:focus{border-color:var(--tc)}
.auth-btn{width:100%;background:var(--tc);color:white;padding:.8rem;border-radius:4px;font-size:.95rem;font-weight:700;margin-top:.4rem;transition:background .2s,transform .15s}
.auth-btn:hover{background:var(--tcl);transform:translateY(-1px)}
.auth-divider{text-align:center;font-size:.75rem;color:#bbb;margin:1rem 0;position:relative}
.auth-divider::before,.auth-divider::after{content:'';position:absolute;top:50%;width:40%;height:1px;background:var(--bd)}
.auth-divider::before{left:0} .auth-divider::after{right:0}
.auth-error{background:#fee2e2;border:1px solid #fca5a5;border-radius:4px;padding:.5rem .7rem;font-size:.78rem;color:var(--red);margin-bottom:.8rem}
.auth-success{background:#dcfce7;border:1px solid #86efac;border-radius:4px;padding:.5rem .7rem;font-size:.78rem;color:var(--green);margin-bottom:.8rem}
.user-chip{display:flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.12);border-radius:100px;padding:.2rem .6rem .2rem .2rem}
.user-chip .chip-av{width:24px;height:24px;border-radius:50%;background:var(--gold);color:var(--dk);font-size:.65rem;font-weight:700;display:flex;align-items:center;justify-content:center}
.user-chip .chip-name{font-size:.7rem;color:var(--cream);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ── ADMIN ── */
.admin-layout{display:grid;grid-template-columns:220px 1fr;min-height:calc(100vh - 120px)}
.admin-sidebar{background:var(--dk);padding:1.5rem 0;position:sticky;top:120px;align-self:start;min-height:calc(100vh - 120px)}
.admin-sidebar-title{font-family:'Playfair Display',serif;font-size:.85rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.12em;padding:0 1.2rem 1rem;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:.5rem}
.admin-nav-item{display:flex;align-items:center;gap:.7rem;padding:.75rem 1.2rem;font-size:.83rem;font-weight:600;color:rgba(245,240,232,.65);cursor:pointer;transition:all .2s;border-left:3px solid transparent}
.admin-nav-item:hover{background:rgba(255,255,255,.06);color:var(--cream)}
.admin-nav-item.active{background:rgba(196,98,45,.15);color:var(--tc);border-left-color:var(--tc)}
.admin-nav-item .nav-icon{font-size:1rem;width:20px;text-align:center}
.admin-content{padding:1.5rem;background:var(--cream)}
.admin-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}
.admin-header h2{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:var(--dk)}
.admin-header p{font-size:.8rem;color:var(--lt);margin-top:.2rem}
.admin-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem}
.admin-stat-card{background:white;border:1px solid var(--bd);border-radius:6px;padding:1.2rem;transition:box-shadow .2s}
.admin-stat-card:hover{box-shadow:0 4px 16px var(--sh)}
.admin-stat-card .stat-icon{font-size:1.8rem;margin-bottom:.5rem}
.admin-stat-card .stat-val{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;color:var(--dk)}
.admin-stat-card .stat-lbl{font-size:.72rem;color:var(--lt);margin-top:.2rem}
.admin-stat-card .stat-trend{font-size:.72rem;margin-top:.3rem;font-weight:600}
.stat-trend.up{color:var(--green)} .stat-trend.dn{color:var(--red)}
.admin-card{background:white;border:1px solid var(--bd);border-radius:6px;padding:1.2rem;margin-bottom:1.2rem}
.admin-card h3{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center}
.admin-table{width:100%;border-collapse:collapse;font-size:.83rem}
.admin-table th{text-align:left;padding:.6rem .8rem;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--lt);border-bottom:2px solid var(--bd);background:var(--warm)}
.admin-table td{padding:.7rem .8rem;border-bottom:1px solid var(--bd);color:var(--dk)}
.admin-table tr:hover td{background:var(--warm)}
.admin-table tr:last-child td{border-bottom:none}
.status-badge{font-size:.68rem;font-weight:700;padding:.2rem .6rem;border-radius:100px;white-space:nowrap}
.admin-action-btn{background:none;border:1px solid var(--bd);border-radius:3px;padding:.25rem .6rem;font-size:.72rem;font-weight:600;color:var(--mid);cursor:pointer;transition:all .2s}
.admin-action-btn:hover{border-color:var(--tc);color:var(--tc)}
.admin-action-btn.primary{background:var(--tc);color:white;border-color:var(--tc)}
.admin-action-btn.primary:hover{background:var(--tcl)}
.admin-action-btn.danger{border-color:var(--red);color:var(--red)}
.admin-action-btn.danger:hover{background:var(--red);color:white}
.product-edit-form{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.product-edit-form .full{grid-column:1/-1}
.img-upload-zone{border:2px dashed var(--bd);border-radius:6px;padding:2rem;text-align:center;cursor:pointer;transition:all .2s;background:var(--warm)}
.img-upload-zone:hover{border-color:var(--tc);background:white}
.img-upload-zone .upload-icon{font-size:2.5rem;margin-bottom:.5rem}
.img-upload-zone p{font-size:.82rem;color:var(--lt)}
.img-upload-zone small{font-size:.72rem;color:#bbb}
.img-preview-grid{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem}
.img-preview-thumb{width:72px;height:72px;border-radius:4px;border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:2rem;background:var(--cream);position:relative;overflow:hidden}
.img-preview-thumb img{width:100%;height:100%;object-fit:cover}
.img-preview-thumb .rm-img{position:absolute;top:0;right:0;background:var(--red);color:white;width:20px;height:20px;font-size:.7rem;display:flex;align-items:center;justify-content:center;cursor:pointer}
.admin-search{padding:.5rem .8rem;border:1px solid var(--bd);border-radius:3px;font-size:.83rem;font-family:'Nunito',sans-serif;outline:none;transition:border-color .2s;width:200px}
.admin-search:focus{border-color:var(--tc)}
.admin-select{padding:.5rem .8rem;border:1px solid var(--bd);border-radius:3px;font-size:.83rem;font-family:'Nunito',sans-serif;outline:none;background:white;cursor:pointer;color:var(--dk)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;display:flex;align-items:center;justify-content:center;animation:fadeOverlay .2s ease}
.modal-box{background:white;border-radius:8px;padding:2rem;width:min(600px,90vw);max-height:85vh;overflow-y:auto;animation:modalIn .25s cubic-bezier(.22,1,.36,1)}
.modal-box h3{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;margin-bottom:1.2rem;padding-bottom:.8rem;border-bottom:1px solid var(--bd)}
.modal-actions{display:flex;gap:.7rem;justify-content:flex-end;margin-top:1.2rem;padding-top:1rem;border-top:1px solid var(--bd)}

/* ── TOAST ── */
.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(12px);background:var(--dk);color:var(--cream);font-size:.85rem;padding:.65rem 1.4rem;border-radius:100px;border-left:3px solid var(--tc);opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;white-space:nowrap;z-index:999}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* ── FOOTER ── */
.footer{background:var(--dk);padding:2.5rem 2rem;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2.5rem;border-top:2px solid var(--tc);margin-top:3rem}
.footer-brand h3{font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--cream);margin-bottom:.6rem}
.footer-brand p{font-size:.78rem;color:rgba(245,240,232,.45);line-height:1.7}
.footer-col h4{font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:.8rem}
.footer-col ul{list-style:none}
.footer-col ul li{font-size:.78rem;color:rgba(245,240,232,.45);margin-bottom:.4rem;cursor:pointer;transition:color .15s}
.footer-col ul li:hover{color:var(--cream)}
.footer-bottom{background:var(--dk);text-align:center;padding:1rem 2rem;font-size:.7rem;color:rgba(245,240,232,.25);border-top:1px solid rgba(255,255,255,.05)}
.back-btn{display:flex;align-items:center;gap:.5rem;font-size:.82rem;font-weight:600;color:var(--lt);padding:1rem 2rem 0;cursor:pointer;transition:color .2s;background:none;border:none}
.back-btn:hover{color:var(--tc)}
`;


/* ═══════════════════════════════════════════════════════════
   HELPERS & SHARED
═══════════════════════════════════════════════════════════ */
const renderStars = (r) => {
  const full = Math.floor(r), half = r % 1 >= 0.5;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
};
const Stars = ({ r, lg }) => <span className="stars" style={{ fontSize: lg ? "1rem" : undefined }}>{renderStars(r)}</span>;
const useTimer = () => {
  const [time, setTime] = useState(() => { const now = new Date(), end = new Date(now); end.setHours(23, 59, 59, 999); return Math.floor((end - now) / 1000); });
  useEffect(() => { const t = setInterval(() => setTime(s => s > 0 ? s - 1 : 0), 1000); return () => clearInterval(t); }, []);
  return [String(Math.floor(time / 3600)).padStart(2,"0"), String(Math.floor((time % 3600) / 60)).padStart(2,"0"), String(time % 60).padStart(2,"0")];
};

/* Page Transition Wrapper */
const Page = ({ children, dir = "up" }) => {
  const cls = dir === "right" ? "slide-right" : dir === "left" ? "slide-left" : "page-enter";
  return <div className={`page ${cls}`}>{children}</div>;
};

/* ═══════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════ */
const AuthModal = ({ onClose, onLogin, initialTab = "signin" }) => {
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const DEMO_USER = { name:"Phulkeshwar Mahto", email:"phulkeshwar@example.com", password:"password123" };

  const handleSignIn = () => {
    setErr("");
    if (!form.email || !form.password) return setErr("Please fill all fields.");
    if (form.email === DEMO_USER.email && form.password === DEMO_USER.password) {
      onLogin({ name: DEMO_USER.name, email: DEMO_USER.email, initials:"PM", membership:"Gold Member" });
    } else if (form.email && form.password.length >= 6) {
      // any valid-looking credentials work for demo
      const name = form.email.split("@")[0].replace(/\./g," ").replace(/\b\w/g,c=>c.toUpperCase());
      onLogin({ name, email: form.email, initials: name.slice(0,2).toUpperCase(), membership:"Silver Member" });
    } else setErr("Invalid credentials. Try phulkeshwar@example.com / password123");
  };

  const handleSignUp = () => {
    setErr("");
    if (!form.name || !form.email || !form.password) return setErr("Please fill all fields.");
    if (form.password.length < 6) return setErr("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setErr("Passwords don't match.");
    const initials = form.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    setOk("Account created successfully! Signing you in...");
    setTimeout(() => onLogin({ name: form.name, email: form.email, initials, membership:"Silver Member" }), 1000);
  };

  return (
    <div className="auth-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>✕</button>
        <div className="auth-logo">🛒 Gram<span>Bazaar</span></div>
        <div className="auth-subtitle">India's trusted organic marketplace</div>
        <div className="auth-tabs">
          <div className={`auth-tab ${tab==="signin"?"active":""}`} onClick={() => { setTab("signin"); setErr(""); setOk(""); }}>Sign In</div>
          <div className={`auth-tab ${tab==="signup"?"active":""}`} onClick={() => { setTab("signup"); setErr(""); setOk(""); }}>Create Account</div>
        </div>
        {err && <div className="auth-error">⚠️ {err}</div>}
        {ok && <div className="auth-success">✅ {ok}</div>}
        {tab === "signin" ? (
          <>
            <div className="auth-field"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleSignIn()} /></div>
            <div className="auth-field"><label>Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleSignIn()} /></div>
            <button className="auth-btn" onClick={handleSignIn}>Sign In →</button>
            <div style={{fontSize:".72rem",color:"#bbb",textAlign:"center",marginTop:".8rem"}}>Demo: phulkeshwar@example.com / password123</div>
          </>
        ) : (
          <>
            <div className="auth-field"><label>Full Name</label><input placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div className="auth-field"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
            <div className="auth-field"><label>Password</label><input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
            <div className="auth-field"><label>Confirm Password</label><input type="password" placeholder="Repeat password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleSignUp()} /></div>
            <button className="auth-btn" onClick={handleSignUp}>Create Account →</button>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════════ */
const PCard = ({ p, addCart, toggleWl, wl, go, compact }) => {
  const [added, setAdded] = useState(false);
  const onAdd = (e) => {
    e.stopPropagation();
    if (!p.stock) return;
    addCart(p); setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  return (
    <div className="pcard">
      <div className="pcard-img" style={{ background: p.bg }} onClick={() => go("detail", p.id)}>
        {p.badge && <span className={`pcard-badge ${p.badge}`}>{p.badge}</span>}
        <button className={`pcard-wl ${wl.includes(p.id) ? "active" : ""}`} onClick={e => { e.stopPropagation(); toggleWl(p.id); }}>{wl.includes(p.id) ? "♥" : "♡"}</button>
        {!p.stock && <div className="pcard-out">OUT OF STOCK</div>}
        {p.e}
      </div>
      <div className="pcard-body">
        <div className="pcard-cat">{p.cat}</div>
        <div className="pcard-name" onClick={() => go("detail", p.id)}>{p.name}</div>
        <div className="pcard-rating"><Stars r={p.rating} /><span>{p.rating}</span><span>({p.rc.toLocaleString()})</span></div>
        <div className="pcard-price-row">
          <span className="pcard-price">₹{p.price}</span>
          {p.orig && <span className="pcard-orig">₹{p.orig}</span>}
          {p.orig && <span className="pcard-off">{Math.round((1-p.price/p.orig)*100)}% off</span>}
        </div>
        <button className={`pcard-add ${added?"added":""}`} disabled={!p.stock} onClick={onAdd}>
          {!p.stock ? "Out of Stock" : added ? "✓ Added!" : "+ Add to Cart"}
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════ */
const catEmojis = { All:"🛒", Pantry:"🫙", Beverages:"☕", Home:"🏠", "Personal Care":"💆", Health:"💊" };
const Nav = ({ page, go, cart, wl, search, setSearch, catFilter, setCatFilter, user, onAuthOpen, onSignOut }) => (
  <nav className="nav">
    <div className="nav-top">
      <div className="nav-logo" onClick={() => go("home")}>🛒 Gram<span>Bazaar</span></div>
      <div className="nav-search">
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {["All","Pantry","Beverages","Home","Personal Care","Health"].map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Search products, brands..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && go("shop")} />
        <button className="nav-search-btn" onClick={() => go("shop")}>🔍</button>
      </div>
      <div className="nav-icons">
        {user ? (
          <>
            <div className="user-chip" style={{cursor:"pointer"}} onClick={() => go("account")}>
              <div className="chip-av">{user.initials}</div>
              <span className="chip-name">{user.name.split(" ")[0]}</span>
            </div>
            <button className="nav-icon-btn" onClick={onSignOut}><span className="icon">🚪</span><span className="lbl">Sign Out</span></button>
          </>
        ) : (
          <button className="nav-icon-btn" onClick={() => onAuthOpen("signin")}><span className="icon">👤</span><span className="lbl">Sign In</span></button>
        )}
        <button className="nav-icon-btn" onClick={() => go("wishlist")}>
          <div className="nav-icon-wrap"><span className="icon">❤️</span>{wl.length > 0 && <span className="nav-badge">{wl.length}</span>}</div>
          <span className="lbl">Wishlist</span>
        </button>
        <button className="nav-icon-btn" onClick={() => go("cart")}>
          <div className="nav-icon-wrap"><span className="icon">🛒</span>{cart.length > 0 && <span className="nav-badge">{cart.reduce((s,i)=>s+i.qty,0)}</span>}</div>
          <span className="lbl">Cart</span>
        </button>
        {user && <button className="nav-icon-btn" onClick={() => go("admin")} style={{borderLeft:"1px solid rgba(255,255,255,.1)",marginLeft:".25rem"}}><span className="icon">⚙️</span><span className="lbl">Admin</span></button>}
      </div>
    </div>
    <div className="nav-bottom">
      {[["home","Home"],["shop","Shop All"],["orders","My Orders"],["wishlist","Wishlist"],["account","Account"]].map(([p,l]) => (
        <a key={p} className={page===p?"active":""} onClick={() => go(p)}>{l}</a>
      ))}
      {user && <a className={page==="admin"?"active":""} onClick={() => go("admin")} style={{color:"var(--gold)"}}>⚙️ Admin Panel</a>}
    </div>
  </nav>
);


/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
const HomePage = ({ go, addCart, toggleWl, wl, showToast, setSearch, setCatFilter }) => {
  const [h, m, s] = useTimer();
  const deal = PRODUCTS.filter(p => p.orig).sort((a,b) => (1-a.price/a.orig)-(1-b.price/b.orig))[0] || PRODUCTS[4];
  const top = [...PRODUCTS].sort((a,b) => b.rating-a.rating).slice(0,8);
  const newArr = PRODUCTS.filter(p => p.badge==="new").slice(0,8);
  return (
    <Page>
      <div className="hero">
        <div className="hero-text fade-up">
          <div className="hero-tag">🌿 100% Natural & Organic</div>
          <h1>India's Finest<br/><em>Everyday Essentials</em></h1>
          <p>From Himalayan kitchens to your doorstep. Artisan products, pure ingredients, honest prices.</p>
          <button className="hero-cta" onClick={() => go("shop")}>Shop Now →</button>
        </div>
        <div className="hero-emoji fade-up stagger-2">🛒</div>
      </div>
      <div className="trust-bar">
        {[["🚚","Free Delivery ₹500+"],["🌿","100% Natural"],["↩️","7-Day Returns"],["🔒","Secure Checkout"],["⭐","50K+ Happy Customers"]].map(([e,t]) => (
          <div className="trust-item fade-up" key={t}><span>{e}</span><span>{t}</span></div>
        ))}
      </div>
      <div className="section fade-up stagger-1">
        <div className="sec-head"><div><div className="sec-label">Browse By</div><h2>Categories</h2></div></div>
        <div className="hscroll">
          {CATS.map(c => (
            <div key={c} className="cat-card" onClick={() => { setCatFilter(c); setSearch(""); go("shop"); }}>
              <div className="cat-emoji">{catEmojis[c]}</div>
              <div className="cat-name">{c}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="deal-section fade-up stagger-2">
        <div className="deal-card">
          <div style={{ flex:1 }}>
            <div className="deal-label">⚡ Deal of the Day</div>
            <div className="deal-name">{deal.name}</div>
            <div className="deal-desc">{deal.desc}</div>
            <div className="deal-price">
              <span className="now">₹{deal.price}</span>
              <span className="was">₹{deal.orig}</span>
              <span className="off">{Math.round((1-deal.price/deal.orig)*100)}% OFF</span>
            </div>
            <div className="deal-timer">
              {[[h,"Hrs"],[m,"Min"],[s,"Sec"]].map(([val,lbl]) => (
                <div key={lbl} className="timer-box"><strong>{val}</strong><span>{lbl}</span></div>
              ))}
            </div>
            <button className="hero-cta" onClick={() => { addCart(deal); showToast(`${deal.name} added to cart!`); }}>Add to Cart →</button>
          </div>
          <div className="deal-emoji">{deal.e}</div>
        </div>
      </div>
      <div className="section fade-up stagger-3">
        <div className="sec-head"><div><div className="sec-label">Highest Rated</div><h2>Top Picks</h2></div><a onClick={() => go("shop")}>See all →</a></div>
        <div className="hscroll">
          {top.map(p => <div key={p.id} style={{ flex:"0 0 210px" }}><PCard p={p} addCart={addCart} toggleWl={toggleWl} wl={wl} go={go} /></div>)}
        </div>
      </div>
      <div className="promo-strip fade-up stagger-4">
        <div className="promo-card" style={{ background:"linear-gradient(135deg,#2c1a0e,#5a3a1a)",color:"white" }}>
          <div><h3>Free Delivery</h3><p>On orders above ₹500. No minimum on select items.</p></div>
          <div className="pe">🚚</div>
        </div>
        <div className="promo-card" style={{ background:"linear-gradient(135deg,#7a8c6e,#4e6b55)",color:"white" }}>
          <div><h3>100% Natural</h3><p>All products verified. No harmful additives.</p></div>
          <div className="pe">🌿</div>
        </div>
      </div>
      <div className="section fade-up">
        <div className="sec-head"><div><div className="sec-label">Just In</div><h2>New Arrivals</h2></div><a onClick={() => go("shop")}>See all →</a></div>
        <div className="pgrid">{newArr.map(p => <PCard key={p.id} p={p} addCart={addCart} toggleWl={toggleWl} wl={wl} go={go} />)}</div>
      </div>
      <footer className="footer">
        <div className="footer-brand"><h3>🛒 GramBazaar</h3><p>Everyday essentials, thoughtfully sourced from artisans and local producers across India.</p></div>
        {[["Shop",CATS.filter(c=>c!=="All")],["Help",["Shipping Policy","Returns","Track Order","Contact Us","FAQ"]],["Company",["About Us","Blog","Careers","Press","Sustainability"]]].map(([title,items]) => (
          <div className="footer-col" key={title}><h4>{title}</h4><ul>{items.map(i=><li key={i}>{i}</li>)}</ul></div>
        ))}
      </footer>
      <div className="footer-bottom">© 2025 GramBazaar Pvt. Ltd. | Built with ♥ in India 🇮🇳</div>
    </Page>
  );
};

/* ═══════════════════════════════════════════════════════════
   SHOP PAGE
═══════════════════════════════════════════════════════════ */
const ShopPage = ({ go, addCart, toggleWl, wl, search, catFilter, setCatFilter }) => {
  const [minPrice,setMinPrice] = useState(0);
  const [maxPrice,setMaxPrice] = useState(1000);
  const [minRating,setMinRating] = useState(0);
  const [onlyStock,setOnlyStock] = useState(false);
  const [sort,setSort] = useState("relevance");
  const [badge,setBadge] = useState("all");
  const filtered = useMemo(() => {
    let res = PRODUCTS.filter(p => {
      return (catFilter==="All"||p.cat===catFilter) && (!search||p.name.toLowerCase().includes(search.toLowerCase())||p.cat.toLowerCase().includes(search.toLowerCase())) && p.price>=minPrice && p.price<=maxPrice && p.rating>=minRating && (!onlyStock||p.stock) && (badge==="all"||p.badge===badge);
    });
    if(sort==="price-asc") res=[...res].sort((a,b)=>a.price-b.price);
    else if(sort==="price-desc") res=[...res].sort((a,b)=>b.price-a.price);
    else if(sort==="rating") res=[...res].sort((a,b)=>b.rating-a.rating);
    else if(sort==="newest") res=[...res].sort((a,b)=>b.id-a.id);
    return res;
  }, [search,catFilter,minPrice,maxPrice,minRating,onlyStock,sort,badge]);
  return (
    <Page dir="right">
      <div className="shop-layout">
        <aside className="filter-sidebar">
          <h3>🔧 Filters</h3>
          <div className="filter-group"><label>Category</label>{CATS.map(c=><div key={c} className="filter-option" onClick={()=>setCatFilter(c)}><input type="radio" readOnly checked={catFilter===c}/><span>{c}</span></div>)}</div>
          <div className="filter-group"><label>Price Range (₹)</label><div className="price-inputs"><input type="number" value={minPrice} onChange={e=>setMinPrice(+e.target.value)} placeholder="Min"/><span style={{color:"#999"}}>–</span><input type="number" value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)} placeholder="Max"/></div></div>
          <div className="filter-group"><label>Min Rating</label>{[4,3.5,3,0].map(r=><div key={r} className="filter-option" onClick={()=>setMinRating(r)}><input type="radio" readOnly checked={minRating===r}/><span>{r>0?`${r}★ & above`:"All Ratings"}</span></div>)}</div>
          <div className="filter-group"><label>Availability</label><div className="filter-option" onClick={()=>setOnlyStock(!onlyStock)}><input type="checkbox" readOnly checked={onlyStock}/><span>In Stock Only</span></div></div>
          <div className="filter-group"><label>Badge</label>{["all","sale","new"].map(b=><div key={b} className="filter-option" onClick={()=>setBadge(b)}><input type="radio" readOnly checked={badge===b}/><span>{b==="all"?"All":b==="sale"?"On Sale":"New Arrivals"}</span></div>)}</div>
          <button className="filter-clear" onClick={()=>{setCatFilter("All");setMinPrice(0);setMaxPrice(1000);setMinRating(0);setOnlyStock(false);setBadge("all");}}>Clear All</button>
        </aside>
        <div className="shop-main">
          <div className="shop-toolbar"><span>{filtered.length} result{filtered.length!==1?"s":""}{search?` for "${search}"`:""}  </span><select className="sort-sel" value={sort} onChange={e=>setSort(e.target.value)}><option value="relevance">Sort: Relevance</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="rating">Highest Rated</option><option value="newest">Newest First</option></select></div>
          {filtered.length===0?(<div className="no-results"><p>😕</p><p>No products found. Try clearing filters.</p></div>):(<div className="pgrid-lg">{filtered.map(p=><PCard key={p.id} p={p} addCart={addCart} toggleWl={toggleWl} wl={wl} go={go}/>)}</div>)}
        </div>
      </div>
    </Page>
  );
};


/* ═══════════════════════════════════════════════════════════
   DETAIL PAGE (with enhanced reviews)
═══════════════════════════════════════════════════════════ */
const DetailPage = ({ pid, go, addCart, cart, toggleWl, wl, showToast, user, onAuthOpen }) => {
  const p = PRODUCTS.find(x => x.id === pid);
  const [qty,setQty] = useState(1);
  const [pincode,setPincode] = useState("");
  const [pinMsg,setPinMsg] = useState("");
  const [open,setOpen] = useState("desc");
  const [thumb,setThumb] = useState(0);
  const [reviews,setReviews] = useState(REVIEWS);
  const [myReview,setMyReview] = useState({ rating:0, text:"", hoverStar:0, images:[], editing:null });
  const [myExisting,setMyExisting] = useState(null);

  if(!p) return null;
  const inCart = cart.find(i=>i.id===p.id);
  const related = PRODUCTS.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,4);
  const checkPin = () => setPinMsg(pincode.length===6?`✅ Delivery by ${["Mon","Tue","Wed","Thu","Fri"][Math.floor(Math.random()*5)]}, expected 2–4 days.`:"❌ Enter valid 6-digit pincode.");

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ type: f.type.startsWith("video") ? "video" : "image", url: URL.createObjectURL(f), name: f.name }));
    setMyReview(r => ({ ...r, images: [...r.images, ...previews].slice(0,4) }));
  };

  const submitReview = () => {
    if (!user) return onAuthOpen("signin");
    if (myReview.rating === 0) return showToast("Please pick a star rating!");
    if (!myReview.text.trim()) return showToast("Please write a review!");
    const newR = { name: user.name, rating: myReview.rating, date: "Apr 2026", text: myReview.text, images: myReview.images, isOwn: true };
    if (myExisting !== null) {
      setReviews(r => r.map((x,i) => i===myExisting ? newR : x));
    } else {
      setReviews(r => [newR, ...r]);
      setMyExisting(0);
    }
    setMyReview({ rating:0, text:"", hoverStar:0, images:[], editing:null });
    showToast("✅ Review submitted! Thank you.");
  };

  const startEdit = (idx) => {
    const r = reviews[idx];
    setMyReview({ rating:r.rating, text:r.text, hoverStar:0, images:r.images||[], editing:idx });
    document.getElementById("review-form")?.scrollIntoView({ behavior:"smooth" });
  };

  const avgRating = (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1);
  const dist = [5,4,3,2,1].map(s=>({ s, cnt: reviews.filter(r=>r.rating===s).length }));

  return (
    <Page dir="right">
      <button className="back-btn" onClick={() => go("shop")}>← Back to Shop</button>
      <div className="detail-layout">
        <div className="detail-img-col">
          <div className="detail-img-main" style={{ background:p.bg, fontSize:["6rem","5.5rem","6rem"][thumb] }}>
            {p.e}
            {p.badge && <span className="pcard-badge" style={{position:"absolute",top:12,left:12}}>{p.badge}</span>}
          </div>
          <div className="detail-img-thumbs">
            {[0,1,2].map(i=><div key={i} className={`detail-thumb ${thumb===i?"active":""}`} style={{background:p.bg}} onClick={()=>setThumb(i)}>{p.e}</div>)}
          </div>
        </div>
        <div className="detail-info-col">
          <div className="detail-brand">{p.cat}</div>
          <h1 className="detail-name">{p.name}</h1>
          <div className="detail-rating"><Stars r={p.rating} lg/><span>{p.rating}</span><span className="rc">{p.rc.toLocaleString()} ratings</span></div>
          <div className="detail-price-row">
            <span className="detail-price">₹{p.price}</span>
            {p.orig&&<span className="detail-was">₹{p.orig}</span>}
            {p.orig&&<span className="detail-off">{Math.round((1-p.price/p.orig)*100)}% off</span>}
          </div>
          <div className={`detail-stock ${p.stock?"in":"out"}`}>{p.stock?"✅ In Stock":"❌ Out of Stock"}</div>
          <div className="detail-qty-row">
            <label>Quantity:</label>
            <div className="qty-ctrl"><button onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button><span>{qty}</span><button onClick={()=>setQty(q=>q+1)}>+</button></div>
            {inCart&&<span style={{fontSize:".78rem",color:"var(--sage)",fontWeight:600}}>({inCart.qty} in cart)</span>}
          </div>
          <div className="detail-actions">
            <button className="btn-cart" disabled={!p.stock} onClick={()=>{for(let i=0;i<qty;i++)addCart(p);showToast(`Added ${qty}× ${p.name}!`);}}>🛒 Add to Cart</button>
            <button className="btn-buy" disabled={!p.stock} onClick={()=>{for(let i=0;i<qty;i++)addCart(p);go("checkout");}}>⚡ Buy Now</button>
            <button className={`btn-wl ${wl.includes(p.id)?"active":""}`} onClick={()=>{toggleWl(p.id);showToast(wl.includes(p.id)?"Removed from wishlist":"Saved to wishlist!");}}>
              {wl.includes(p.id)?"♥":"♡"}
            </button>
          </div>
          <div className="detail-delivery">
            <h4>📍 Delivery Info</h4>
            <div className="delivery-row">📦 Free delivery on orders above ₹500</div>
            <div className="delivery-row">↩️ 7-day easy returns</div>
            <div className="delivery-row">🔒 Secure & encrypted checkout</div>
            <div className="pin-check">
              <input placeholder="Enter pincode" value={pincode} onChange={e=>setPincode(e.target.value)} maxLength={6}/>
              <button onClick={checkPin}>Check</button>
            </div>
            {pinMsg&&<p style={{fontSize:".75rem",marginTop:".5rem",color:pinMsg.includes("✅")?"var(--green)":"var(--red)"}}>{pinMsg}</p>}
          </div>
          {[["desc","📝 Description",<p style={{color:"#555",fontSize:".83rem",lineHeight:"1.7",gridColumn:"1/-1"}}>{p.desc}</p>],
            ["spec","📋 Product Details",Object.entries(p.spec).flatMap(([k,v])=>[<span key={k+"-k"}>{k.replace(/_/g," ")}</span>,<span key={k+"-v"} style={{color:"#666"}}>{v}</span>])]
          ].map(([key,title,content])=>(
            <div className="accordion-item" key={key}>
              <div className="accordion-head" onClick={()=>setOpen(o=>o===key?null:key)}><span>{title}</span><span>{open===key?"▲":"▼"}</span></div>
              {open===key&&<div className="accordion-body">{content}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="reviews-section">
        <div className="sec-head" style={{marginBottom:"1rem"}}><div><div className="sec-label">Customer Feedback</div><h2>Reviews & Ratings</h2></div></div>
        <div className="rating-summary">
          <div className="big-rating"><strong>{avgRating}</strong><Stars r={parseFloat(avgRating)} lg/><small>{reviews.length} reviews</small></div>
          <div className="rating-bars">
            {dist.map(({s,cnt})=>(
              <div className="rbar-row" key={s}><span>{s}★</span><div className="rbar"><div className="rbar-fill" style={{width:`${reviews.length?cnt/reviews.length*100:0}%`}}/></div><span style={{fontSize:".72rem",color:"#999",width:24}}>{cnt}</span></div>
            ))}
          </div>
        </div>

        {/* REVIEW FORM */}
        <div className="review-form" id="review-form">
          <h3>{myExisting!==null && myReview.editing===null ? "✏️ Edit Your Review" : "✍️ Write a Review"}</h3>
          {!user && <p style={{fontSize:".83rem",color:"var(--lt)",marginBottom:".8rem"}}>👋 <span style={{color:"var(--tc)",cursor:"pointer",fontWeight:700}} onClick={()=>onAuthOpen("signin")}>Sign in</span> to post your review.</p>}
          <div className="star-picker">
            {[1,2,3,4,5].map(s=>(
              <span key={s} className={(myReview.hoverStar||myReview.rating)>=s?"lit":""}
                onMouseEnter={()=>setMyReview(r=>({...r,hoverStar:s}))}
                onMouseLeave={()=>setMyReview(r=>({...r,hoverStar:0}))}
                onClick={()=>setMyReview(r=>({...r,rating:s}))}>★</span>
            ))}
            {myReview.rating>0&&<span style={{fontSize:".82rem",color:"var(--lt)",marginLeft:".5rem"}}>{["","Poor","Fair","Good","Very Good","Excellent"][myReview.rating]}</span>}
          </div>
          <textarea className="review-textarea" placeholder="Share your experience with this product..." value={myReview.text} onChange={e=>setMyReview(r=>({...r,text:e.target.value}))} rows={3}/>
          <div className="review-media-upload">
            <label className="upload-btn" style={{cursor:"pointer"}}>
              📷 Add Photos
              <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleImageUpload}/>
            </label>
            <label className="upload-btn" style={{cursor:"pointer"}}>
              🎥 Add Video
              <input type="file" accept="video/*" style={{display:"none"}} onChange={handleImageUpload}/>
            </label>
            {myReview.images.map((img,i)=>(
              <div key={i} className="uploaded-preview">
                {img.type==="video"?<span>🎥</span>:<img src={img.url} alt="preview"/>}
                <div className="rm-preview" onClick={()=>setMyReview(r=>({...r,images:r.images.filter((_,j)=>j!==i)}))}>✕</div>
              </div>
            ))}
          </div>
          <button className="review-submit-btn" onClick={submitReview}>
            {user?(myReview.editing!==null?"Update Review →":"Post Review →"):"Sign In to Review →"}
          </button>
        </div>

        {reviews.map((r,i)=>(
          <div className="rcard" key={i}>
            <div className="rcard-head">
              <div>
                <span className="rcard-name">{r.name}</span>
                {r.isOwn&&<span style={{fontSize:".7rem",background:"var(--cream)",border:"1px solid var(--bd)",borderRadius:"100px",padding:".1rem .5rem",marginLeft:".5rem",color:"var(--tc)",fontWeight:700}}>Your Review</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>
                <Stars r={r.rating}/>
                <span className="rcard-date">{r.date}</span>
                {r.isOwn&&<button style={{fontSize:".75rem",color:"var(--blue)",fontWeight:600,cursor:"pointer",background:"none",border:"none",textDecoration:"underline"}} onClick={()=>startEdit(i)}>Edit</button>}
              </div>
            </div>
            <div className="rcard-text">{r.text}</div>
            {r.images&&r.images.length>0&&(
              <div className="rcard-media">
                {r.images.map((img,j)=>(
                  <div key={j} className="rcard-media-item">
                    {img.type==="video"?<><span style={{fontSize:"2rem"}}>🎥</span><div className="play-icon">▶</div></>:<img src={img.url} alt="review"/>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {related.length>0&&(
        <div className="section"><div className="sec-head"><div><div className="sec-label">You May Also Like</div><h2>Related Products</h2></div></div>
          <div className="pgrid">{related.map(rp=><PCard key={rp.id} p={rp} addCart={addCart} toggleWl={toggleWl} wl={wl} go={go}/>)}</div>
        </div>
      )}
    </Page>
  );
};

/* ═══════════════════════════════════════════════════════════
   CART PAGE
═══════════════════════════════════════════════════════════ */
const CartPage = ({ go, addCart, toggleWl, wl, showToast, cart, setCart }) => {
  const [promo,setPromo] = useState("");
  const [promoMsg,setPromoMsg] = useState("");
  const [discount,setDiscount] = useState(0);
  const sub = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping = sub>=500?0:49;
  const total = sub+shipping-discount;
  const changeQty = (id,d) => setCart(prev=>prev.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i));
  const remove = (id) => setCart(prev=>prev.filter(i=>i.id!==id));
  const applyPromo = () => {
    const code = promo.toUpperCase();
    if(PROMO_CODES[code]){ setDiscount(PROMO_CODES[code]); setPromoMsg(`✅ ₹${PROMO_CODES[code]} discount applied!`); }
    else setPromoMsg("❌ Invalid promo code.");
  };
  return (
    <Page dir="left">
      <div className="cart-layout">
        <div>
          <div className="cart-title">🛒 My Cart ({cart.length} items)</div>
          {cart.length===0?(<div className="empty-state"><p>🛒</p><h3>Your cart is empty</h3><small>Add some products to get started.</small><br/><br/><button className="hero-cta" onClick={()=>go("shop")}>Browse Products →</button></div>):(
            cart.map(item=>(
              <div className="citem" key={item.id}>
                <div className="citem-img" onClick={()=>go("detail",item.id)}>{item.e}</div>
                <div>
                  <div className="citem-name" onClick={()=>go("detail",item.id)}>{item.name}</div>
                  <div className="citem-cat">{item.cat}</div>
                  {item.stock&&<div style={{fontSize:".72rem",color:"var(--green)",fontWeight:600}}>✅ In Stock</div>}
                  <div className="citem-actions">
                    <div className="cqty"><button onClick={()=>changeQty(item.id,-1)}>−</button><span>{item.qty}</span><button onClick={()=>changeQty(item.id,1)}>+</button></div>
                    <button className="rm-btn" onClick={()=>remove(item.id)}>Delete</button>
                    <button className="save-btn" onClick={()=>showToast(`${item.name} saved!`)}>Save for later</button>
                  </div>
                </div>
                <div className="citem-total">₹{item.price*item.qty}</div>
              </div>
            ))
          )}
        </div>
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="sum-row"><span>Subtotal ({cart.reduce((s,i)=>s+i.qty,0)} items)</span><span>₹{sub}</span></div>
          <div className="sum-row"><span>Shipping</span><span>{shipping===0?"FREE 🎉":`₹${shipping}`}</span></div>
          {discount>0&&<div className="sum-row save"><span>Promo Discount</span><span>−₹{discount}</span></div>}
          <div className="sum-row total"><span>Total</span><span>₹{total}</span></div>
          {shipping>0&&<p style={{fontSize:".72rem",color:"#999",marginBottom:".8rem"}}>Add ₹{500-sub} more for free shipping!</p>}
          <div className="promo-box"><input placeholder="Promo code" value={promo} onChange={e=>setPromo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&applyPromo()}/><button onClick={applyPromo}>Apply</button></div>
          {promoMsg&&<div className="promo-success" style={{color:promoMsg.includes("✅")?"var(--green)":"var(--red)"}}>{promoMsg}</div>}
          <p style={{fontSize:".7rem",color:"#aaa",marginBottom:".5rem"}}>Try: GRAM10, SAVE20, FIRST50</p>
          <button className="checkout-cta" disabled={cart.length===0} onClick={()=>go("checkout")}>Proceed to Checkout →</button>
          <div className="secure-icons">🔒 Secure · 💳 All Cards · 📦 Easy Returns</div>
        </div>
      </div>
    </Page>
  );
};

/* ═══════════════════════════════════════════════════════════
   CHECKOUT PAGE
═══════════════════════════════════════════════════════════ */
const CheckoutPage = ({ go, cart, clearCart }) => {
  const [step,setStep] = useState(1);
  const [form,setForm] = useState({name:"Phulkeshwar Mahto",phone:"9800000001",email:"phulkeshwar@example.com",addr:"",city:"Ranchi",state:"Jharkhand",pin:"834001"});
  const [payMethod,setPayMethod] = useState("upi");
  const [orderId,setOrderId] = useState("");
  const sub = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping = sub>=500?0:49;
  const total = sub+shipping;
  const placeOrder = () => { const id=`ORD-${Math.floor(Math.random()*9000)+1000}`; setOrderId(id); clearCart(); setStep(4); };
  const MiniCart = ()=>(
    <div className="mini-cart"><h4>Your Items ({cart.reduce((s,i)=>s+i.qty,0)})</h4>
      {cart.map(i=><div className="mini-item" key={i.id}><span className="me">{i.e}</span><span className="mn">{i.name} ×{i.qty}</span><span className="mp">₹{i.price*i.qty}</span></div>)}
      <div style={{borderTop:"1px solid var(--bd)",marginTop:".8rem",paddingTop:".8rem",display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:".88rem"}}><span>Total</span><span>₹{total}</span></div>
    </div>
  );
  if(step===4) return <Page><div style={{padding:"2rem"}}><div className="success-card"><div className="success-icon">🎉</div><h2>Order Placed!</h2><div className="order-id">{orderId}</div><p>Thank you! Confirmation sent to {form.email}.<br/>Expected delivery: 3–5 business days.</p><div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}><button className="hero-cta" onClick={()=>go("orders")}>Track Order →</button><button className="hero-cta" style={{background:"var(--sage)"}} onClick={()=>go("shop")}>Continue Shopping →</button></div></div></div></Page>;
  return (
    <Page dir="right">
      <div className="checkout-layout">
        <div className="steps" style={{gridColumn:"1/-1"}}>
          {["Delivery Address","Payment","Review & Pay"].map((s,i)=><div key={s} className={`step ${step===i+1?"active":step>i+1?"done":""}`}>{step>i+1?"✓ ":""}{s}</div>)}
        </div>
        {step===1&&<div className="form-section"><h3>📍 Delivery Address</h3><div className="form-row"><div className="form-group"><label>Full Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div></div><div className="form-row full"><div className="form-group"><label>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div><div className="form-row full"><div className="form-group"><label>Address Line</label><input value={form.addr} onChange={e=>setForm({...form,addr:e.target.value})} placeholder="House no, street, area"/></div></div><div className="form-row"><div className="form-group"><label>City</label><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div><div className="form-group"><label>State</label><select value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>{["Jharkhand","Bihar","West Bengal","Maharashtra","Delhi","Rajasthan","Tamil Nadu","Karnataka","Uttar Pradesh"].map(s=><option key={s}>{s}</option>)}</select></div></div><div className="form-row"><div className="form-group"><label>Pincode</label><input value={form.pin} onChange={e=>setForm({...form,pin:e.target.value})} maxLength={6}/></div></div><button className="next-btn" onClick={()=>setStep(2)}>Continue to Payment →</button></div>}
        {step===2&&<div className="form-section"><h3>💳 Payment Method</h3><div className="payment-options">{[{id:"upi",icon:"📲",name:"UPI",desc:"PhonePe, GPay, Paytm"},{id:"card",icon:"💳",name:"Credit / Debit Card",desc:"Visa, Mastercard, RuPay"},{id:"netbanking",icon:"🏦",name:"Net Banking",desc:"All major Indian banks"},{id:"cod",icon:"💵",name:"Cash on Delivery",desc:"Pay when you receive"}].map(pm=><div key={pm.id} className={`pay-option ${payMethod===pm.id?"selected":""}`} onClick={()=>setPayMethod(pm.id)}><span className="pay-icon">{pm.icon}</span><div><div className="pay-name">{pm.name}</div><div className="pay-desc">{pm.desc}</div></div><input type="radio" readOnly checked={payMethod===pm.id} style={{marginLeft:"auto"}}/></div>)}</div>{payMethod==="upi"&&<div className="form-row full" style={{marginTop:"1rem"}}><div className="form-group"><label>UPI ID</label><input placeholder="yourname@upi"/></div></div>}<div style={{display:"flex",gap:".75rem",marginTop:"1rem"}}><button className="next-btn" style={{flex:0,background:"var(--cream)",color:"var(--dk)",border:"1px solid var(--bd)"}} onClick={()=>setStep(1)}>← Back</button><button className="next-btn" style={{flex:1}} onClick={()=>setStep(3)}>Review Order →</button></div></div>}
        {step===3&&<div className="form-section"><h3>📋 Review Your Order</h3><div style={{background:"var(--warm)",border:"1px solid var(--bd)",borderRadius:4,padding:"1rem",marginBottom:"1rem",fontSize:".83rem",lineHeight:"1.8"}}><strong>Delivering to:</strong><br/>{form.name} · {form.phone}<br/>{form.addr?`${form.addr}, `:""}{form.city}, {form.state} — {form.pin}</div><div style={{background:"var(--warm)",border:"1px solid var(--bd)",borderRadius:4,padding:"1rem",marginBottom:"1rem",fontSize:".83rem"}}><strong>Payment:</strong> {payMethod.toUpperCase()}</div><div style={{display:"flex",justifyContent:"space-between",fontFamily:"'Playfair Display',serif",fontSize:"1rem",fontWeight:700,marginBottom:"1rem"}}><span>Order Total:</span><span>₹{total}</span></div><div style={{display:"flex",gap:".75rem"}}><button className="next-btn" style={{flex:0,background:"var(--cream)",color:"var(--dk)",border:"1px solid var(--bd)"}} onClick={()=>setStep(2)}>← Back</button><button className="next-btn" style={{flex:1,background:"var(--green)"}} onClick={placeOrder}>✅ Place Order</button></div></div>}
        <MiniCart/>
      </div>
    </Page>
  );
};


/* ═══════════════════════════════════════════════════════════
   ORDERS PAGE
═══════════════════════════════════════════════════════════ */
const OrdersPage = ({ orders }) => {
  const [tracking,setTracking] = useState(null);
  const statusClass = { Delivered:"status-delivered", Processing:"status-processing", Returned:"status-returned", Shipped:"status-shipped" };
  const trackSteps = ["Order Placed","Order Confirmed","Shipped","Out for Delivery","Delivered"];
  return (
    <Page dir="left">
      <div className="orders-page">
        <h2>📦 My Orders</h2>
        {orders.length===0&&<div className="empty-state"><p>📦</p><h3>No orders yet</h3><small>Your orders will appear here.</small></div>}
        {orders.map(o=>(
          <div className="order-card" key={o.id}>
            <div className="order-card-head">
              <div><div className="order-meta">Order ID: <strong>{o.id}</strong></div><div className="order-meta">Placed on {o.date}</div></div>
              <span className={`order-status ${statusClass[o.status]||"status-processing"}`}>{o.status}</span>
            </div>
            <div className="order-card-body">
              <div className="order-items">{o.items.join(" · ")}</div>
              <div className="order-footer">
                <span className="order-total">₹{o.total}</span>
                <button className="track-btn" onClick={()=>setTracking(tracking===o.id?null:o.id)}>{tracking===o.id?"Hide Tracking ▲":"Track Order ▼"}</button>
              </div>
            </div>
            {tracking===o.id&&(
              <div className="track-panel">
                <div className="track-steps">
                  {trackSteps.map((s,i)=>{
                    const doneIdx=o.status==="Delivered"?4:o.status==="Shipped"?2:o.status==="Processing"?1:0;
                    return (<div className="track-step" key={s}><div className={`track-dot ${i<doneIdx?"done":i===doneIdx?"current":""}`}/><span style={{fontWeight:i===doneIdx?700:400}}>{s}</span>{i<=doneIdx&&<span>{i===0?o.date:i===1?"Confirmed":i===2?"Dispatched":i===3?"Arriving":o.status==="Delivered"?"Delivered":""}</span>}</div>);
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Page>
  );
};

/* ═══════════════════════════════════════════════════════════
   WISHLIST PAGE
═══════════════════════════════════════════════════════════ */
const WishlistPage = ({ wl, toggleWl, addCart, go, showToast }) => {
  const items = PRODUCTS.filter(p=>wl.includes(p.id));
  return (
    <Page dir="right">
      <div className="wishlist-page">
        <h2>❤️ My Wishlist ({items.length})</h2>
        {items.length===0?(<div className="empty-state"><p>❤️</p><h3>Your wishlist is empty</h3><small>Heart products to save them here.</small><br/><br/><button className="hero-cta" onClick={()=>go("shop")}>Browse Products →</button></div>):(<div className="pgrid-lg">{items.map(p=><PCard key={p.id} p={p} addCart={addCart} toggleWl={toggleWl} wl={wl} go={go}/>)}</div>)}
      </div>
    </Page>
  );
};

/* ═══════════════════════════════════════════════════════════
   ACCOUNT PAGE
═══════════════════════════════════════════════════════════ */
const AccountPage = ({ go, orders, wl, user, onAuthOpen, onSignOut }) => {
  const [prefs,setPrefs] = useState({emails:true,sms:false,deals:true});
  const toggle = k => setPrefs(p=>({...p,[k]:!p[k]}));
  if(!user) return (
    <Page>
      <div style={{maxWidth:420,margin:"4rem auto",padding:"0 2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>👤</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.8rem",marginBottom:".8rem"}}>Welcome to GramBazaar</h2>
        <p style={{color:"var(--lt)",marginBottom:"2rem",lineHeight:1.6}}>Sign in to access your orders, wishlist, and account settings.</p>
        <button className="hero-cta" style={{display:"block",width:"100%",marginBottom:"1rem",textAlign:"center"}} onClick={()=>onAuthOpen("signin")}>Sign In →</button>
        <button className="hero-cta" style={{display:"block",width:"100%",background:"var(--sage)",textAlign:"center"}} onClick={()=>onAuthOpen("signup")}>Create Account →</button>
      </div>
    </Page>
  );
  return (
    <Page dir="right">
      <div className="account-page">
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",fontWeight:700,marginBottom:"1.5rem"}}>👤 My Account</h2>
        <div className="account-grid">
          <div>
            <div className="profile-card">
              <div className="profile-avatar">{user.initials}</div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
              <div className="profile-badge">⭐ {user.membership}</div>
              <div className="account-stat-grid">
                <div className="account-stat"><strong>{orders.length}</strong><span>Orders</span></div>
                <div className="account-stat"><strong>{wl.length}</strong><span>Wishlisted</span></div>
                <div className="account-stat"><strong>₹{orders.reduce((s,o)=>s+o.total,0)}</strong><span>Total Spent</span></div>
                <div className="account-stat"><strong>4.9★</strong><span>Avg Rating</span></div>
              </div>
            </div>
            <div className="preferences-card">
              <h4>Notifications</h4>
              {[["emails","Email Updates"],["sms","SMS Alerts"],["deals","Deal Notifications"]].map(([k,l])=>(
                <div className="pref-row" key={k}><span style={{fontSize:".83rem"}}>{l}</span><div className={`toggle ${prefs[k]?"on":""}`} onClick={()=>toggle(k)}/></div>
              ))}
            </div>
          </div>
          <div>
            <div className="account-links">
              {[["📦","My Orders",()=>go("orders")],["❤️","My Wishlist",()=>go("wishlist")],["📍","Saved Addresses",()=>go("checkout")],["💳","Payment Methods",()=>go("checkout")],["🔔","Notifications",null],["🎫","Promo Codes",null],["⭐","My Reviews",null],["🔒","Security Settings",null],["🚪","Sign Out",onSignOut]].map(([icon,label,action])=>(
                <div className="acct-link" key={label} onClick={action||undefined} style={label==="Sign Out"?{color:"var(--red)"}:{}}><span className="al-icon">{icon}</span>{label}<span className="al-arrow">›</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};


/* ═══════════════════════════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════════════════════════ */
const AdminPanel = ({ go, orders, setOrders, user }) => {
  const [section,setSection] = useState("dashboard");
  const [productSearch,setProductSearch] = useState("");
  const [products,setProducts] = useState(PRODUCTS.slice(0,20).map(p=>({...p})));
  const [editProduct,setEditProduct] = useState(null);
  const [orderFilter,setOrderFilter] = useState("All");
  const [orderSearch,setOrderSearch] = useState("");
  const [editOrderId,setEditOrderId] = useState(null);
  const [editOrderStatus,setEditOrderStatus] = useState("");
  const [showAddProduct,setShowAddProduct] = useState(false);
  const [newProduct,setNewProduct] = useState({ name:"",cat:"Pantry",price:"",orig:"",desc:"",stock:true,badge:"",images:[] });
  const [imgPreviews,setImgPreviews] = useState([]);

  if(!user) return (
    <Page>
      <div style={{maxWidth:400,margin:"4rem auto",textAlign:"center",padding:"2rem"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🔒</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",marginBottom:"1rem"}}>Admin Access Only</h2>
        <p style={{color:"var(--lt)",marginBottom:"1.5rem"}}>Please sign in to access the admin panel.</p>
        <button className="hero-cta" onClick={()=>go("account")}>Go to Account →</button>
      </div>
    </Page>
  );

  const handleProductImgUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f=>({ url:URL.createObjectURL(f), name:f.name, emoji:newProduct.e||"📦" }));
    setImgPreviews(prev=>[...prev,...previews].slice(0,6));
  };

  const handleEditImgUpload = (e) => {
    if(!editProduct) return;
    const files = Array.from(e.target.files);
    const previews = files.map(f=>({ url:URL.createObjectURL(f), name:f.name }));
    setEditProduct(p=>({...p,images:[...(p.images||[]),...previews].slice(0,6)}));
  };

  const saveEditProduct = () => {
    setProducts(prev=>prev.map(p=>p.id===editProduct.id?editProduct:p));
    setEditProduct(null);
  };

  const addNewProduct = () => {
    const id = Math.max(...PRODUCTS.map(p=>p.id))+Math.floor(Math.random()*100)+1;
    const p = { ...newProduct, id, price:+newProduct.price, orig:newProduct.orig?+newProduct.orig:null, rating:4.0, rc:0, e:"📦", bg:"#f5f0e8", images:imgPreviews };
    setProducts(prev=>[p,...prev]);
    setNewProduct({name:"",cat:"Pantry",price:"",orig:"",desc:"",stock:true,badge:"",images:[]});
    setImgPreviews([]);
    setShowAddProduct(false);
  };

  const updateOrderStatus = (id, status) => {
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o));
    setEditOrderId(null);
  };

  const filteredOrders = orders.filter(o=>(orderFilter==="All"||o.status===orderFilter)&&(!orderSearch||o.id.toLowerCase().includes(orderSearch.toLowerCase())||o.items.some(i=>i.toLowerCase().includes(orderSearch.toLowerCase()))));
  const filteredProducts = products.filter(p=>!productSearch||p.name.toLowerCase().includes(productSearch.toLowerCase())||p.cat.toLowerCase().includes(productSearch.toLowerCase()));

  const statusColors = { Delivered:"status-delivered", Processing:"status-processing", Returned:"status-returned", Shipped:"status-shipped" };
  const totalRevenue = orders.filter(o=>o.status==="Delivered").reduce((s,o)=>s+o.total,0);

  const navItems = [
    ["dashboard","📊","Dashboard"],["orders","📦","Manage Orders"],["products","🏷️","Product Catalog"],["add-product","➕","Add Product"],["reviews","⭐","Reviews"],
  ];

  return (
    <Page dir="right">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">⚙️ Admin Panel</div>
          {navItems.map(([id,icon,label])=>(
            <div key={id} className={`admin-nav-item ${section===id?"active":""}`} onClick={()=>setSection(id)}>
              <span className="nav-icon">{icon}</span>{label}
            </div>
          ))}
          <div style={{borderTop:"1px solid rgba(255,255,255,.08)",marginTop:"1rem",padding:"1rem 1.2rem"}}>
            <div style={{fontSize:".72rem",color:"rgba(245,240,232,.4)"}}>Logged in as</div>
            <div style={{fontSize:".8rem",color:"var(--cream)",fontWeight:600,marginTop:".2rem"}}>{user.name}</div>
          </div>
        </aside>

        <div className="admin-content">

          {/* DASHBOARD */}
          {section==="dashboard"&&(
            <>
              <div className="admin-header"><div><h2>Dashboard</h2><p>Welcome back, {user.name.split(" ")[0]}! Here's your store overview.</p></div></div>
              <div className="admin-stats-grid">
                {[
                  {icon:"💰",val:`₹${totalRevenue.toLocaleString()}`,lbl:"Total Revenue",trend:"+12% this month",up:true},
                  {icon:"📦",val:orders.length,lbl:"Total Orders",trend:`${orders.filter(o=>o.status==="Processing").length} pending`,up:true},
                  {icon:"🏷️",val:products.length,lbl:"Products Listed",trend:"3 low stock",up:false},
                  {icon:"👥",val:"1,284",lbl:"Customers",trend:"+48 this week",up:true},
                ].map((s,i)=>(
                  <div className="admin-stat-card fade-up" key={i} style={{animationDelay:`${i*.05}s`}}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-lbl">{s.lbl}</div>
                    <div className={`stat-trend ${s.up?"up":"dn"}`}>{s.up?"↑":"↓"} {s.trend}</div>
                  </div>
                ))}
              </div>
              <div className="admin-card">
                <h3>Recent Orders <button className="admin-action-btn primary" onClick={()=>setSection("orders")}>View All</button></h3>
                <table className="admin-table">
                  <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {orders.slice(0,5).map(o=>(
                      <tr key={o.id}>
                        <td><code style={{fontSize:".8rem"}}>{o.id}</code></td>
                        <td>{o.date}</td>
                        <td style={{maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.items.join(", ")}</td>
                        <td><strong>₹{o.total}</strong></td>
                        <td><span className={`status-badge ${statusColors[o.status]||"status-processing"}`}>{o.status}</span></td>
                        <td><button className="admin-action-btn" onClick={()=>{setSection("orders");setEditOrderId(o.id);setEditOrderStatus(o.status);}}>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-card">
                <h3>Top Products</h3>
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Rating</th><th>Stock</th></tr></thead>
                  <tbody>
                    {[...PRODUCTS].sort((a,b)=>b.rating-a.rating).slice(0,5).map(p=>(
                      <tr key={p.id}>
                        <td style={{display:"flex",alignItems:"center",gap:".5rem"}}><span style={{fontSize:"1.2rem"}}>{p.e}</span>{p.name}</td>
                        <td>{p.cat}</td>
                        <td>₹{p.price}</td>
                        <td><Stars r={p.rating}/> {p.rating}</td>
                        <td><span style={{color:p.stock?"var(--green)":"var(--red)",fontWeight:600}}>{p.stock?"✅ In Stock":"❌ Out"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* MANAGE ORDERS */}
          {section==="orders"&&(
            <>
              <div className="admin-header">
                <div><h2>Manage Orders</h2><p>Update order statuses and track fulfillment.</p></div>
                <div style={{display:"flex",gap:".5rem"}}>
                  <input className="admin-search" placeholder="Search orders..." value={orderSearch} onChange={e=>setOrderSearch(e.target.value)}/>
                  <select className="admin-select" value={orderFilter} onChange={e=>setOrderFilter(e.target.value)}>
                    {["All","Processing","Shipped","Delivered","Returned"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-card">
                <h3>Orders ({filteredOrders.length})</h3>
                <table className="admin-table">
                  <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredOrders.map(o=>(
                      <>
                        <tr key={o.id}>
                          <td><code style={{fontSize:".8rem"}}>{o.id}</code></td>
                          <td>{o.date}</td>
                          <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.items.join(", ")}</td>
                          <td><strong>₹{o.total}</strong></td>
                          <td><span className={`status-badge ${statusColors[o.status]||"status-processing"}`}>{o.status}</span></td>
                          <td style={{display:"flex",gap:".4rem",flexWrap:"wrap"}}>
                            <button className="admin-action-btn" onClick={()=>{setEditOrderId(editOrderId===o.id?null:o.id);setEditOrderStatus(o.status);}}>✏️ Edit</button>
                          </td>
                        </tr>
                        {editOrderId===o.id&&(
                          <tr key={o.id+"-edit"}>
                            <td colSpan={6} style={{background:"#fff8f5",padding:"1rem",borderBottom:"2px solid var(--tc)"}}>
                              <div style={{display:"flex",alignItems:"center",gap:".8rem",flexWrap:"wrap"}}>
                                <span style={{fontWeight:700,fontSize:".85rem"}}>Update Status for {o.id}:</span>
                                {["Processing","Shipped","Delivered","Returned"].map(s=>(
                                  <button key={s} className={`admin-action-btn ${editOrderStatus===s?"primary":""}`} onClick={()=>setEditOrderStatus(s)}>{s}</button>
                                ))}
                                <button className="admin-action-btn primary" onClick={()=>updateOrderStatus(o.id,editOrderStatus)}>✅ Save</button>
                                <button className="admin-action-btn" onClick={()=>setEditOrderId(null)}>✕ Cancel</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PRODUCT CATALOG */}
          {section==="products"&&(
            <>
              <div className="admin-header">
                <div><h2>Product Catalog</h2><p>Edit product details, descriptions and images.</p></div>
                <div style={{display:"flex",gap:".5rem"}}>
                  <input className="admin-search" placeholder="Search products..." value={productSearch} onChange={e=>setProductSearch(e.target.value)}/>
                  <button className="admin-action-btn primary" onClick={()=>setSection("add-product")}>+ Add Product</button>
                </div>
              </div>
              <div className="admin-card">
                <h3>Products ({filteredProducts.length})</h3>
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>Cat</th><th>Price</th><th>Rating</th><th>Badge</th><th>Stock</th><th>Edit</th></tr></thead>
                  <tbody>
                    {filteredProducts.map(p=>(
                      <tr key={p.id}>
                        <td style={{display:"flex",alignItems:"center",gap:".5rem"}}><span style={{fontSize:"1.2rem"}}>{p.e}</span><span style={{fontWeight:600}}>{p.name}</span></td>
                        <td>{p.cat}</td>
                        <td>₹{p.price}{p.orig&&<span style={{fontSize:".72rem",color:"#aaa",marginLeft:".3rem"}}>/ ₹{p.orig}</span>}</td>
                        <td><Stars r={p.rating}/></td>
                        <td>{p.badge?<span className={`pcard-badge ${p.badge}`}>{p.badge}</span>:"—"}</td>
                        <td><span style={{color:p.stock?"var(--green)":"var(--red)",fontWeight:600}}>{p.stock?"✅":"❌"}</span></td>
                        <td><button className="admin-action-btn" onClick={()=>setEditProduct({...p,images:p.images||[]})}>✏️ Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {editProduct&&(
                <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setEditProduct(null)}>
                  <div className="modal-box">
                    <h3>✏️ Edit Product: {editProduct.name}</h3>
                    <div className="product-edit-form">
                      <div className="form-group"><label>Product Name</label><input value={editProduct.name} onChange={e=>setEditProduct(p=>({...p,name:e.target.value}))}/></div>
                      <div className="form-group"><label>Category</label><select value={editProduct.cat} onChange={e=>setEditProduct(p=>({...p,cat:e.target.value}))}>{CATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
                      <div className="form-group"><label>Price (₹)</label><input type="number" value={editProduct.price} onChange={e=>setEditProduct(p=>({...p,price:+e.target.value}))}/></div>
                      <div className="form-group"><label>Original Price (₹)</label><input type="number" value={editProduct.orig||""} onChange={e=>setEditProduct(p=>({...p,orig:e.target.value?+e.target.value:null}))} placeholder="Leave blank if no discount"/></div>
                      <div className="form-group full"><label>Description</label><textarea value={editProduct.desc} onChange={e=>setEditProduct(p=>({...p,desc:e.target.value}))} style={{border:"1.5px solid var(--bd)",borderRadius:4,padding:".7rem",fontFamily:"'Nunito',sans-serif",fontSize:".85rem",resize:"vertical",minHeight:80,outline:"none",width:"100%"}}/></div>
                      <div className="form-group"><label>Badge</label><select value={editProduct.badge||""} onChange={e=>setEditProduct(p=>({...p,badge:e.target.value||null}))}><option value="">None</option><option value="sale">sale</option><option value="new">new</option></select></div>
                      <div className="form-group"><label>In Stock</label><select value={editProduct.stock?"yes":"no"} onChange={e=>setEditProduct(p=>({...p,stock:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No</option></select></div>
                      <div className="form-group full">
                        <label>Product Images</label>
                        <div className="img-upload-zone" onClick={()=>document.getElementById("edit-img-input").click()}>
                          <div className="upload-icon">📷</div>
                          <p>Click to upload product images</p>
                          <small>PNG, JPG, WEBP up to 10MB each</small>
                          <input id="edit-img-input" type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleEditImgUpload}/>
                        </div>
                        {editProduct.images&&editProduct.images.length>0&&(
                          <div className="img-preview-grid">
                            {editProduct.images.map((img,i)=>(
                              <div key={i} className="img-preview-thumb">
                                {img.url?<img src={img.url} alt="preview"/>:<span style={{fontSize:"2rem"}}>{editProduct.e}</span>}
                                <div className="rm-img" onClick={()=>setEditProduct(p=>({...p,images:p.images.filter((_,j)=>j!==i)}))}>✕</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button className="admin-action-btn" onClick={()=>setEditProduct(null)}>Cancel</button>
                      <button className="admin-action-btn primary" onClick={saveEditProduct}>✅ Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ADD PRODUCT */}
          {section==="add-product"&&(
            <>
              <div className="admin-header"><div><h2>Add New Product</h2><p>Fill in the details to list a new product.</p></div></div>
              <div className="admin-card">
                <h3>Product Details</h3>
                <div className="product-edit-form">
                  <div className="form-group"><label>Product Name *</label><input placeholder="e.g., Organic Turmeric Powder" value={newProduct.name} onChange={e=>setNewProduct(p=>({...p,name:e.target.value}))}/></div>
                  <div className="form-group"><label>Category *</label><select value={newProduct.cat} onChange={e=>setNewProduct(p=>({...p,cat:e.target.value}))}>{CATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label>Price (₹) *</label><input type="number" placeholder="299" value={newProduct.price} onChange={e=>setNewProduct(p=>({...p,price:e.target.value}))}/></div>
                  <div className="form-group"><label>Original Price (₹)</label><input type="number" placeholder="Leave blank if no discount" value={newProduct.orig} onChange={e=>setNewProduct(p=>({...p,orig:e.target.value}))}/></div>
                  <div className="form-group full"><label>Description *</label><textarea placeholder="Describe the product, its benefits, ingredients, etc." value={newProduct.desc} onChange={e=>setNewProduct(p=>({...p,desc:e.target.value}))} style={{border:"1.5px solid var(--bd)",borderRadius:4,padding:".7rem",fontFamily:"'Nunito',sans-serif",fontSize:".85rem",resize:"vertical",minHeight:100,outline:"none",width:"100%",color:"var(--dk)"}}/></div>
                  <div className="form-group"><label>Badge</label><select value={newProduct.badge} onChange={e=>setNewProduct(p=>({...p,badge:e.target.value}))}><option value="">None</option><option value="sale">sale</option><option value="new">new</option></select></div>
                  <div className="form-group"><label>In Stock</label><select value={newProduct.stock?"yes":"no"} onChange={e=>setNewProduct(p=>({...p,stock:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No</option></select></div>
                  <div className="form-group full">
                    <label>Product Images</label>
                    <div className="img-upload-zone" onClick={()=>document.getElementById("new-img-input").click()}>
                      <div className="upload-icon">📷</div>
                      <p>Drag & drop or click to upload images</p>
                      <small>PNG, JPG, WEBP — up to 6 images, 10MB each</small>
                      <input id="new-img-input" type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleProductImgUpload}/>
                    </div>
                    {imgPreviews.length>0&&(
                      <div className="img-preview-grid">
                        {imgPreviews.map((img,i)=>(
                          <div key={i} className="img-preview-thumb">
                            <img src={img.url} alt="preview"/>
                            <div className="rm-img" onClick={()=>setImgPreviews(prev=>prev.filter((_,j)=>j!==i))}>✕</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{display:"flex",gap:"1rem",marginTop:"1.5rem",justifyContent:"flex-end"}}>
                  <button className="admin-action-btn" onClick={()=>{setNewProduct({name:"",cat:"Pantry",price:"",orig:"",desc:"",stock:true,badge:"",images:[]});setImgPreviews([]); }}>Reset</button>
                  <button className="admin-action-btn primary" onClick={addNewProduct} disabled={!newProduct.name||!newProduct.price||!newProduct.desc}>✅ Add Product</button>
                </div>
              </div>
            </>
          )}

          {/* REVIEWS */}
          {section==="reviews"&&(
            <>
              <div className="admin-header"><div><h2>Customer Reviews</h2><p>Monitor and manage product reviews.</p></div></div>
              <div className="admin-card">
                <h3>Recent Reviews</h3>
                {REVIEWS.map((r,i)=>(
                  <div key={i} style={{borderBottom:"1px solid var(--bd)",paddingBottom:"1rem",marginBottom:"1rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".4rem"}}>
                      <div style={{display:"flex",alignItems:"center",gap:".7rem"}}><strong style={{fontSize:".88rem"}}>{r.name}</strong><Stars r={r.rating}/><span style={{fontSize:".72rem",color:"#999"}}>{r.date}</span></div>
                      <div style={{display:"flex",gap:".4rem"}}>
                        <button className="admin-action-btn">Approve</button>
                        <button className="admin-action-btn danger">Remove</button>
                      </div>
                    </div>
                    <p style={{fontSize:".83rem",color:"#555",lineHeight:1.6}}>{r.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </Page>
  );
};


/* ═══════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [pid, setPid] = useState(null);
  const [cart, setCart] = useState([]);
  const [wl, setWl] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [showToast, setShowToastState] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState("signin");
  const [orders, setOrders] = useState([
    { id:"ORD-8472", date:"Apr 15, 2025", items:["Organic Wild Honey","Olive Oil Extra Virgin"], total:948, status:"Delivered" },
    { id:"ORD-7310", date:"Apr 2, 2025", items:["Darjeeling Green Tea","Moringa Leaf Powder"], total:578, status:"Delivered" },
    { id:"ORD-6185", date:"Mar 20, 2025", items:["Ashwagandha KSM-66"], total:499, status:"Returned" },
  ]);

  const go = (p, id = null) => { setPid(id); setPage(p); window.scrollTo(0,0); };
  const addCart = (p) => setCart(prev => { const ex = prev.find(i=>i.id===p.id); return ex ? prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i) : [...prev,{...p,qty:1}]; });
  const toggleWl = (id) => setWl(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const showToastMsg = (msg) => { setToast(msg); setShowToastState(true); setTimeout(()=>setShowToastState(false), 2500); };
  const clearCart = () => {
    const o = { id:`ORD-${Math.floor(Math.random()*9000)+1000}`, date:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}), items:cart.map(i=>i.name), total:cart.reduce((s,i)=>s+i.price*i.qty,0), status:"Processing" };
    setOrders(prev=>[o,...prev]);
    setCart([]);
  };
  const handleLogin = (u) => { setUser(u); setShowAuth(false); showToastMsg(`✅ Welcome back, ${u.name.split(" ")[0]}!`); };
  const handleSignOut = () => { setUser(null); showToastMsg("👋 Signed out successfully."); go("home"); };
  const openAuth = (tab = "signin") => { setAuthTab(tab); setShowAuth(true); };

  const sharedProps = { go, addCart, toggleWl, wl, showToast: showToastMsg, user, onAuthOpen: openAuth };

  return (
    <>
      <style>{CSS}</style>
      <Nav page={page} go={go} cart={cart} wl={wl} search={search} setSearch={setSearch} catFilter={catFilter} setCatFilter={setCatFilter} user={user} onAuthOpen={openAuth} onSignOut={handleSignOut} />

      {page === "home"     && <HomePage     {...sharedProps} setSearch={setSearch} setCatFilter={setCatFilter} />}
      {page === "shop"     && <ShopPage     {...sharedProps} search={search} catFilter={catFilter} setCatFilter={setCatFilter} />}
      {page === "detail"   && <DetailPage   {...sharedProps} pid={pid} cart={cart} />}
      {page === "cart"     && <CartPage     {...sharedProps} cart={cart} setCart={setCart} />}
      {page === "checkout" && <CheckoutPage go={go} cart={cart} clearCart={clearCart} />}
      {page === "orders"   && <OrdersPage   orders={orders} />}
      {page === "wishlist" && <WishlistPage {...sharedProps} />}
      {page === "account"  && <AccountPage  {...sharedProps} orders={orders} onSignOut={handleSignOut} />}
      {page === "admin"    && <AdminPanel   go={go} orders={orders} setOrders={setOrders} user={user} />}

      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onLogin={handleLogin} initialTab={authTab} />}
      <div className={`toast ${showToast ? "show" : ""}`}>{toast}</div>
    </>
  );
}