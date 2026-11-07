import { Product, Order, StoreFinancials, ProductCategory } from '../types/store';

// Representative flagship items from the 186+ daily essentials catalog
const flagshipProducts: Product[] = [
  {
    id: 'prod-001',
    sku: 'TOW-GRO-001',
    title: 'Teer Fortified Soybean Oil 5 Litre',
    titleBn: 'তীর ফর্টিফাইড সয়াবিন তেল ৫ লিটার',
    category: 'Groceries & Cooking',
    costPriceBDT: 780,
    retailPriceBDT: 850,
    stock: 14,
    reorderLevel: 25,
    monthlyVelocityUnits: 145,
    supplier: 'City Group (Dhaka)',
    status: 'low_stock',
    descriptionEnglish: 'Teer Fortified Soybean Oil is enriched with Vitamin A and D, cold-filtered for light absorption and clean frying. Essential for Bangladeshi home cooking with low cholesterol buildup.',
    descriptionBengali: 'তীর ভিটামিন এ এবং ডি সমৃদ্ধ পরিশোধিত সয়াবিন তেল। স্বাস্থ্যকর রান্না ও সুষম পুষ্টির জন্য প্রতিটি বাংলাদেশি পরিবারের নির্ভরযোগ্য পছন্দ।',
    updatedAt: '2026-11-06T10:00:00Z'
  },
  {
    id: 'prod-002',
    sku: 'TOW-GRO-002',
    title: 'Radhuni Turmeric Powder (হলুদ গুঁড়া) 200g',
    titleBn: 'রাঁধুনী গুঁড়া হলুদ ২০০ গ্রাম',
    category: 'Groceries & Cooking',
    costPriceBDT: 88,
    retailPriceBDT: 105,
    stock: 68,
    reorderLevel: 30,
    monthlyVelocityUnits: 210,
    supplier: 'Square Consumer Products Ltd',
    status: 'in_stock',
    descriptionEnglish: 'Radhuni Turmeric Powder is ground from select grade sun-dried turmeric fingers, preserving high curcumin content and natural vibrant color without artificial additives.',
    descriptionBengali: 'বাছাইকৃত উৎকৃষ্ট কাঁচা হলুদ শুকিয়ে তৈরি রাঁধুনী হলুদ গুঁড়া। তরকারিতে আনে উজ্জ্বল সোনালী রঙ এবং খাঁটি সুবাস।',
    updatedAt: '2026-11-05T14:20:00Z'
  },
  {
    id: 'prod-003',
    sku: 'TOW-GRO-003',
    title: 'ACI Pure Vacuum Evaporated Iodized Salt 1kg',
    titleBn: 'এসিআই পিওর আয়োডিনযুক্ত লবণ ১ কেজি',
    category: 'Groceries & Cooking',
    costPriceBDT: 34,
    retailPriceBDT: 42,
    stock: 9,
    reorderLevel: 40,
    monthlyVelocityUnits: 320,
    supplier: 'ACI Consumer Brands',
    status: 'low_stock',
    descriptionEnglish: 'Vacuum evaporated free-flowing iodized salt for optimal thyroid health and clean culinary seasoning. 99.8% pure sodium chloride crystal formulation.',
    descriptionBengali: 'ভ্যাকুয়াম ইভাপোরেটেড পদ্ধতিতে তৈরি ঝরঝরে আয়োডিনযুক্ত এসিআই পিওর লবণ। স্বাস্থ্যসম্মত ও নিরাপদ দৈনন্দিন রান্নার ভরসা।',
    updatedAt: '2026-11-06T09:15:00Z'
  },
  {
    id: 'prod-004',
    sku: 'TOW-SNK-004',
    title: 'Maggi 2-Minute Masala Noodles 8 Packs Family Saver',
    titleBn: 'ম্যাগি ২-মিনিট মাসালা নুডলস ৮ প্যাক',
    category: 'Snacks & Beverages',
    costPriceBDT: 142,
    retailPriceBDT: 170,
    stock: 52,
    reorderLevel: 30,
    monthlyVelocityUnits: 280,
    supplier: 'Nestlé Bangladesh Ltd',
    status: 'in_stock',
    descriptionEnglish: 'Quick wholesome family noodles pack infused with signature Bangladeshi roasted spice blend (Tastemaker). Fortified with Iron and Vitamin A for afternoon tea-time.',
    descriptionBengali: 'জনপ্রিয় মসলাদার স্বাদের ম্যাগি ২-মিনিট নুডলস ফ্যামিলি প্যাক। আয়রন সমৃদ্ধ ও চটজলদি বিকেলের নাস্তার সেরা সমাধান।',
    updatedAt: '2026-11-04T16:00:00Z'
  },
  {
    id: 'prod-005',
    sku: 'TOW-BSC-005',
    title: 'Olympic Energy Plus Glucose Biscuits 300g Pack',
    titleBn: 'অলিম্পিক এনার্জি প্লাস গ্লুকোজ বিস্কুট ৩০০ গ্রাম',
    category: 'Biscuits & Bakery',
    costPriceBDT: 48,
    retailPriceBDT: 60,
    stock: 3,
    reorderLevel: 25,
    monthlyVelocityUnits: 190,
    supplier: 'Olympic Industries Ltd',
    status: 'low_stock',
    descriptionEnglish: 'Crunchy golden-baked glucose biscuits packed with wheat vitality and milk proteins, perfect for school tiffin or pairing with hot Cha.',
    descriptionBengali: 'শক্তি ও সতেজতায় ভরা অলিম্পিক এনার্জি প্লাস গ্লুকোজ বিস্কুট। পরিবারের প্রতিদিনের নাস্তায় এবং চায়ের সাথে চমৎকার উপাদেয়।',
    updatedAt: '2026-11-06T11:45:00Z'
  },
  {
    id: 'prod-006',
    sku: 'TOW-TOI-006',
    title: 'Vim Dishwash Liquid Lemon 500ml Bottle',
    titleBn: 'ভিম ডিশওয়াশ লিকুইড লেবু ৫০০ মিলি',
    category: 'Toiletries & Cleaning',
    costPriceBDT: 138,
    retailPriceBDT: 165,
    stock: 44,
    reorderLevel: 20,
    monthlyVelocityUnits: 160,
    supplier: 'Unilever Bangladesh',
    status: 'in_stock',
    descriptionEnglish: 'Power of 100 lemons concentrated into a gentle grease-cutting gel. Cleans oily curry pots, steel, and delicate glassware without harsh skin residue.',
    descriptionBengali: '১০০টি লেবুর ক্ষমতাসম্পন্ন ভিম লিকুইড। তৈলাক্ত ও পোড়া দাগ দ্রুত দূর করে এবং থালাবাসনে রেখে যায় দীর্ঘস্থায়ী লেবুর সুগন্ধ।',
    updatedAt: '2026-11-03T18:00:00Z'
  },
  {
    id: 'prod-007',
    sku: 'TOW-TOI-007',
    title: 'Harpic Power Plus Disinfectant Toilet Cleaner 750ml',
    titleBn: 'হারপিক পাওয়ার প্লাস টয়লেট ক্লিনার ৭৫০ মিলি',
    category: 'Toiletries & Cleaning',
    costPriceBDT: 172,
    retailPriceBDT: 205,
    stock: 0,
    reorderLevel: 20,
    monthlyVelocityUnits: 175,
    supplier: 'Reckitt Benckiser Bangladesh',
    status: 'out_of_stock',
    descriptionEnglish: '10x better stain removal formula that penetrates lime scale and eliminates 99.9% of bacteria and germs. Curved nozzle for rim coverage.',
    descriptionBengali: 'টয়লেটের জেদি দাগ ও দুর্গন্ধ দূরীকরণে ১০০% কার্যকরী হারপিক পাওয়ার প্লাস। জীবাণু মুক্ত রেখে নিশ্চিত করে পারিবারিক স্বাস্থ্য সুরক্ষা।',
    updatedAt: '2026-11-06T08:00:00Z'
  },
  {
    id: 'prod-008',
    sku: 'TOW-PER-008',
    title: 'Parachute Pure Coconut Hair Oil 200ml Glass Bottle',
    titleBn: 'প্যারাস্যুট খাঁটি নারিকেল তেল ২০০ মিলি',
    category: 'Personal Care & Hygiene',
    costPriceBDT: 122,
    retailPriceBDT: 145,
    stock: 82,
    reorderLevel: 30,
    monthlyVelocityUnits: 230,
    supplier: 'Marico Bangladesh Ltd',
    status: 'in_stock',
    descriptionEnglish: '100% pure coconut oil made from hand-picked roasted copra. Deeply nourishes hair roots, retains natural luster, and conditions scalp naturally.',
    descriptionBengali: 'শতভাগ খাঁটি ও প্রাকৃতিক নারিকেল থেকে প্রস্তুত প্যারাস্যুট তেল। চুলের গোড়া শক্ত করে, খুশকি কমায় এবং চুলকে করে দীঘল কালো ও মসৃণ।',
    updatedAt: '2026-11-05T12:00:00Z'
  },
  {
    id: 'prod-009',
    sku: 'TOW-PER-009',
    title: 'Savlon Antiseptic Liquid 1000ml (1 Litre Refill)',
    titleBn: 'স্যাভলন অ্যান্টিসেপটিক লিকুইড ১০০০ মিলি',
    category: 'Personal Care & Hygiene',
    costPriceBDT: 345,
    retailPriceBDT: 410,
    stock: 12,
    reorderLevel: 20,
    monthlyVelocityUnits: 88,
    supplier: 'ACI Consumer Brands',
    status: 'low_stock',
    descriptionEnglish: 'Medical-grade antibacterial chlorhexidine gluconate & cetrimide solution. Ideal for first aid cuts, laundry sanitation, and floor hygiene.',
    descriptionBengali: 'ক্ষত পরিষ্কার, গোসল ও ঘরের মেঝে জীবাণুমুক্ত করতে বিশ্বস্ত স্যাভলন অ্যান্টিসেপটিক লিকুইড। পরিবারকে রাখে যেকোনো সংক্রমণ থেকে নিরাপদ।',
    updatedAt: '2026-11-06T07:30:00Z'
  },
  {
    id: 'prod-010',
    sku: 'TOW-SNK-010',
    title: 'Ispahani Mirzapore Best Leaf Tea 400g Pouch',
    titleBn: 'ইস্পাহানি মির্জাপুর বেস্ট লিফ চা ৪০০ গ্রাম',
    category: 'Snacks & Beverages',
    costPriceBDT: 195,
    retailPriceBDT: 230,
    stock: 7,
    reorderLevel: 25,
    monthlyVelocityUnits: 215,
    supplier: 'Ispahani Tea Ltd',
    status: 'low_stock',
    descriptionEnglish: 'Selected from the premier gardens of Sylhet, providing rich liquor, golden cup brightness, and authentic aroma cherished by tea connoisseurs.',
    descriptionBengali: 'সিলেটের সেরা বাগানের কচি দুটি পাতা ও একটি কুঁড়ি থেকে বাছাইকৃত ইস্পাহানি মির্জাপুর চা। দেয় কড়া লিকার এবং চনমনে তরতাজা স্বাদ।',
    updatedAt: '2026-11-06T11:00:00Z'
  },
  {
    id: 'prod-011',
    sku: 'TOW-GRO-011',
    title: 'Dano Daily Pushti Full Cream Milk Powder 500g',
    titleBn: 'ডানো ডেইলি পুষ্টি ফুল ক্রিম মিল্ক পাউডার ৫০০ গ্রাম',
    category: 'Groceries & Cooking',
    costPriceBDT: 360,
    retailPriceBDT: 415,
    stock: 5,
    reorderLevel: 20,
    monthlyVelocityUnits: 140,
    supplier: 'Arla Foods Bangladesh',
    status: 'low_stock',
    descriptionEnglish: 'Imported European dairy powder enriched with calcium, vitamins A, D, and zinc for children and daily culinary desserts (semonila, payesh).',
    descriptionBengali: 'দুধের খাঁটি প্রাকৃতিক পুষ্টি ও ক্রিমি ঘনত্বের নিশ্চয়তা দেয় ডানো ডেইলি পুষ্টি। মিষ্টি তৈরি, শিশুদের দুধ ও পরিবারের স্বাস্থ্যরক্ষায় অনন্য।',
    updatedAt: '2026-11-06T09:40:00Z'
  },
  {
    id: 'prod-012',
    sku: 'TOW-BSC-012',
    title: 'Pran Potata Spicy Flavoured Biscuit 100g Pack of 4',
    titleBn: 'প্রাণ পটাটা স্পাইসি বিস্কুট ১০০ গ্রাম (৪ প্যাক)',
    category: 'Biscuits & Bakery',
    costPriceBDT: 70,
    retailPriceBDT: 88,
    stock: 120,
    reorderLevel: 30,
    monthlyVelocityUnits: 295,
    supplier: 'PRAN-RFL Group',
    status: 'in_stock',
    descriptionEnglish: 'Thin, crispy potato biscuit crackers coated in tangy chili seasoning. Fast-moving snack staple with strong youth consumer demand in Bangladesh.',
    descriptionBengali: 'চটপটা আলু ও ঝাল মসলার ক্রিস্পি ক্র্যাকার প্রাণ পটাটা। মুচমুচে প্রতিটি কামড়ে এনে দেয় ভরপুর মুখরোচক আনন্দ।',
    updatedAt: '2026-11-05T10:00:00Z'
  },
  {
    id: 'prod-013',
    sku: 'TOW-TOI-013',
    title: 'Wheel 2-in-1 Clean & Fresh Detergent Powder 1kg',
    titleBn: 'হুইল ২-ইন-১ ক্লিন অ্যান্ড ফ্রেশ ডিটারজেন্ট পাউডার ১ কেজি',
    category: 'Toiletries & Cleaning',
    costPriceBDT: 110,
    retailPriceBDT: 130,
    stock: 18,
    reorderLevel: 35,
    monthlyVelocityUnits: 240,
    supplier: 'Unilever Bangladesh',
    status: 'low_stock',
    descriptionEnglish: 'Active enzyme washing powder engineered to dissolve collar dirt and oil stains while releasing fresh floral jasmine scent across washes.',
    descriptionBengali: 'কাপড়ের একগুঁয়ে ময়লা ও ঘামের গন্ধ দূর করে কাপড়ে আনে উজ্জ্বল শুভ্রতা ও জুঁই ফুলের সতেজ সুবাস।',
    updatedAt: '2026-11-06T08:15:00Z'
  },
  {
    id: 'prod-014',
    sku: 'TOW-PER-014',
    title: 'Lux Velvet Glow Jasmine & Almond Oil Soap 100g (Buy 3 Get 1)',
    titleBn: 'লাক্স ভেলভেট গ্লো সাবান ১০০ গ্রাম (৩ কিনলে ১ ফ্রি)',
    category: 'Personal Care & Hygiene',
    costPriceBDT: 195,
    retailPriceBDT: 240,
    stock: 64,
    reorderLevel: 25,
    monthlyVelocityUnits: 180,
    supplier: 'Unilever Bangladesh',
    status: 'in_stock',
    descriptionEnglish: 'Beauty bath soap enriched with French rose infusion and hydrating almond milk. Leaves skin silky soft with high fragrance projection.',
    descriptionBengali: 'বাদাম তেল ও সুগন্ধি জুঁই ফুলের নির্যাসযুক্ত লাক্স বিউটি সাবান। প্রতিটি গোসলে ত্বককে করে তোলে কোমল, মসৃণ ও উজ্জ্বল।',
    updatedAt: '2026-11-04T11:20:00Z'
  },
  {
    id: 'prod-015',
    sku: 'TOW-SNK-015',
    title: 'Pran Frooto Mango Fruit Drink 250ml Tetra Pack (Pack of 6)',
    titleBn: 'প্রাণ ফ্রুটো ম্যাঙ্গো জুস ২৫০ মিলি (৬ প্যাক)',
    category: 'Snacks & Beverages',
    costPriceBDT: 120,
    retailPriceBDT: 150,
    stock: 110,
    reorderLevel: 40,
    monthlyVelocityUnits: 260,
    supplier: 'PRAN-RFL Group',
    status: 'in_stock',
    descriptionEnglish: 'Refreshing mango fruit drink processed from Rajshahi Fazli & Langra mango pulp. High Vitamin C formulation served chilled.',
    descriptionBengali: 'রাজশাহীর সেরা আমের পাল্প দিয়ে তৈরি তৃপ্তিদায়ক প্রাণ ফ্রুটো ম্যাঙ্গো ড্রিংক। গরমে এনে দেয় এক চুমুকে সতেজ অনুভূতি।',
    updatedAt: '2026-11-04T15:30:00Z'
  },
  {
    id: 'prod-016',
    sku: 'TOW-GRO-016',
    title: 'Fresh Refined White Sugar 1kg Poly Pack',
    titleBn: 'ফ্রেশ পরিশোধিত সাদা চিনি ১ কেজি',
    category: 'Groceries & Cooking',
    costPriceBDT: 128,
    retailPriceBDT: 140,
    stock: 11,
    reorderLevel: 40,
    monthlyVelocityUnits: 310,
    supplier: 'Meghna Group of Industries (MGI)',
    status: 'low_stock',
    descriptionEnglish: 'Double-refined premium crystal cane sugar. Sulfur-free filtration ensuring clean sweetness without residual molasses odor.',
    descriptionBengali: 'মেঘনা গ্রুপের স্বাস্থ্যসম্মত ফ্রেশ পরিশোধিত সাদা চিনি। চা, মিষ্টি বা পারিবারিক রান্নায় দেয় সম্পূর্ণ খাঁটি মিষ্টতা।',
    updatedAt: '2026-11-06T10:10:00Z'
  },
  {
    id: 'prod-017',
    sku: 'TOW-PER-017',
    title: 'Sensodyne Deep Clean Gel Toothpaste 100g',
    titleBn: 'সেনসোডাইন ডিপ ক্লিন টুথপেস্ট ১০০ গ্রাম',
    category: 'Personal Care & Hygiene',
    costPriceBDT: 235,
    retailPriceBDT: 280,
    stock: 19,
    reorderLevel: 15,
    monthlyVelocityUnits: 95,
    supplier: 'GSK Consumer Healthcare / Haleon',
    status: 'in_stock',
    descriptionEnglish: 'Clinically proven potassium nitrate formulation providing 24/7 sensitivity protection, foam cleansing, and long-lasting breath freshness.',
    descriptionBengali: 'দাঁতের শিরশির অনুভূতি দূর করে মাড়ির সুরক্ষায় ডেন্টিস্টদের ১ নম্বর রেকমেন্ডেড সেনসোডাইন টুথপেস্ট।',
    updatedAt: '2026-11-05T09:00:00Z'
  },
  {
    id: 'prod-018',
    sku: 'TOW-BSC-018',
    title: 'Danish Butter Cookies Tin 400g Premium Edition',
    titleBn: 'ডেনিশ বাটার কুকিজ টিন ৪০০ গ্রাম',
    category: 'Biscuits & Bakery',
    costPriceBDT: 340,
    retailPriceBDT: 420,
    stock: 6,
    reorderLevel: 12,
    monthlyVelocityUnits: 28,
    supplier: 'Danish Foods Ltd',
    status: 'slow_moving',
    descriptionEnglish: 'Traditional royal butter biscuit selection baked with real Danish butter recipe. High ticket festive gift item with 19% gross margin.',
    descriptionBengali: 'খাঁটি মাখনের সুবাস ও রাজকীয় স্বাদে তৈরি ঐতিহ্যবাহী ডেনিশ বাটার কুকিজ। মেহমানদারি ও উপহারের জন্য আভিজাত্যের প্রতীক।',
    updatedAt: '2026-11-02T14:00:00Z'
  }
];

// Helper to generate realistic rest of catalog items reaching 186+ items
function generateCompleteCatalog(): Product[] {
  const catalog: Product[] = [...flagshipProducts];
  const categories: { cat: ProductCategory; prefix: string; suppliers: string[] }[] = [
    { cat: 'Groceries & Cooking', prefix: 'GRO', suppliers: ['City Group', 'Meghna Group', 'Square Consumer Products', 'ACI Consumer Brands', 'Bashundhara Group'] },
    { cat: 'Biscuits & Bakery', prefix: 'BSC', suppliers: ['Olympic Industries', 'PRAN-RFL Group', 'Danish Foods Ltd', 'Nabisco Biscuit Ltd', 'Haque Biscuits'] },
    { cat: 'Snacks & Beverages', prefix: 'SNK', suppliers: ['PRAN-RFL Group', 'Transcom Beverages', 'Akij Food & Beverage', 'Nestle Bangladesh', 'Ispahani Tea Ltd'] },
    { cat: 'Toiletries & Cleaning', prefix: 'TOI', suppliers: ['Unilever Bangladesh', 'Square Toiletries', 'Reckitt Benckiser BD', 'Kohinoor Chemical Company (Tibet)', 'Keya Cosmetics'] },
    { cat: 'Personal Care & Hygiene', prefix: 'PER', suppliers: ['Marico Bangladesh', 'Unilever Bangladesh', 'Square Toiletries', 'ACI Consumer Brands', 'Himalaya Wellness BD'] }
  ];

  const genericNames = [
    { en: 'Mustard Oil (সরিষার তেল) 500ml', bn: 'ঘানি ভাঙা খাঁটি সরিষার তেল ৫০০ মিলি', catIdx: 0, cost: 165, price: 195 },
    { en: 'Chinigura Aromatic Rice 1kg', bn: 'চিনিগুঁড়া সুগন্ধি পোলাও চাল ১ কেজি', catIdx: 0, cost: 135, price: 160 },
    { en: 'Red Lentils (মসুর ডাল দেশি) 1kg', bn: 'দেশি চিকন মসুর ডাল ১ কেজি', catIdx: 0, cost: 130, price: 155 },
    { en: 'Cumin Seeds (জিরা) 100g', bn: 'প্রিমিয়াম গোটা জিরা ১০০ গ্রাম', catIdx: 0, cost: 95, price: 120 },
    { en: 'Chili Powder (মরিচ গুঁড়া) 200g', bn: 'ঝাল মরিচ গুঁড়া ২০০ গ্রাম', catIdx: 0, cost: 105, price: 130 },
    { en: 'Coriander Powder (ধনিয়া গুঁড়া) 200g', bn: 'ধনিয়া গুঁড়া ২০০ গ্রাম', catIdx: 0, cost: 75, price: 95 },
    { en: 'Pure Ghee (খাঁটি গাওয়া ঘি) 200g', bn: 'খাঁটি দানাদার গাওয়া ঘি ২০০ গ্রাম', catIdx: 0, cost: 280, price: 340 },
    { en: 'Gram Flour (বেসন) 500g', bn: 'খাটি ছোলার বেসন ৫০০ গ্রাম', catIdx: 0, cost: 65, price: 82 },
    { en: 'Toasted Toast Biscuit 350g', bn: 'মুচমুচে টোস্ট বিস্কুট ৩৫০ গ্রাম', catIdx: 1, cost: 55, price: 70 },
    { en: 'Lexus Vegetable Crackers 200g', bn: 'লেক্সাস ভেজিটেবল ক্র্যাকার্স ২০০ গ্রাম', catIdx: 1, cost: 62, price: 80 },
    { en: 'Dry Cake Premium 300g', bn: 'স্পেশাল ড্রাই কেক ৩০০ গ্রাম', catIdx: 1, cost: 85, price: 110 },
    { en: 'Cream Crackers 250g', bn: 'ক্রিম ক্র্যাকার্স বিস্কুট ২৫০ গ্রাম', catIdx: 1, cost: 65, price: 85 },
    { en: 'Chocolate Cream Biscuits 120g', bn: 'চকলেট ক্রিম বিস্কুট ১২০ গ্রাম', catIdx: 1, cost: 35, price: 45 },
    { en: 'Kurkure Masala Munch 80g', bn: 'কুরকুরে মাসালা মাঞ্চ ৮০ গ্রাম', catIdx: 2, cost: 28, price: 35 },
    { en: 'Mojo Carbonated Cola 500ml', bn: 'মোজো কোল্ড বেভারেজ ৫০০ মিলি', catIdx: 2, cost: 26, price: 35 },
    { en: 'Pran Chanachur Special 300g', bn: 'প্রাণ ঝাল চানাচুর ৩০০ গ্রাম', catIdx: 2, cost: 70, price: 90 },
    { en: 'Bombay Sweets Potato Crackers', bn: 'বোম্বে সুইটস পটেটো ক্র্যাকার্স', catIdx: 2, cost: 20, price: 25 },
    { en: 'Floor Cleaner Pine Disinfectant 1L', bn: 'ফ্লোর ক্লিনার পাইন ১ লিটার', catIdx: 3, cost: 160, price: 210 },
    { en: 'Glass Cleaner Spray 350ml', bn: 'গ্লাস ক্লিনার স্প্রে ৩৫০ মিলি', catIdx: 3, cost: 115, price: 150 },
    { en: 'Mosquito Spray Aerosol 475ml', bn: 'মশা নিধনকারী অ্যারোসল ৪৭৫ মিলি', catIdx: 3, cost: 310, price: 380 },
    { en: 'Bleaching Powder Disinfectant 500g', bn: 'ব্লিচিং পাউডার ৫০০ গ্রাম', catIdx: 3, cost: 45, price: 65 },
    { en: 'Tibet Pomade Hair Vaseline 50g', bn: 'তিব্বত পমেড ভ্যাসলিন ৫০ গ্রাম', catIdx: 4, cost: 42, price: 55 },
    { en: 'Lifebuoy Total Handwash 200ml Refill', bn: 'লাইফবয় হ্যান্ডওয়াশ রিফিল ২০০ মিলি', catIdx: 4, cost: 75, price: 95 },
    { en: 'Meril Baby Lotion 200ml', bn: 'মেরিল বেবি লোশন ২০০ মিলি', catIdx: 4, cost: 185, price: 230 }
  ];

  let currentId = 19;
  // Pad until 186 items
  while (catalog.length < 186) {
    const itemTemplate = genericNames[(currentId - 19) % genericNames.length];
    const catConfig = categories[itemTemplate.catIdx];
    const variationSuffix = Math.floor((currentId - 19) / genericNames.length) + 1;
    const stockQty = (currentId * 7) % 65;
    const monthlyVelocity = (currentId * 11) % 150 + 20;
    const cost = itemTemplate.cost + ((currentId % 5) * 4);
    const retail = itemTemplate.price + ((currentId % 5) * 5);
    const reorder = 20;

    let status: Product['status'] = 'in_stock';
    if (stockQty === 0) status = 'out_of_stock';
    else if (stockQty <= reorder) status = 'low_stock';
    else if (monthlyVelocity < 30 && stockQty > 40) status = 'slow_moving';

    catalog.push({
      id: `prod-${String(currentId).padStart(3, '0')}`,
      sku: `TOW-${catConfig.prefix}-${String(currentId).padStart(3, '0')}`,
      title: `${itemTemplate.en}${variationSuffix > 1 ? ` (Batch ${variationSuffix})` : ''}`,
      titleBn: `${itemTemplate.bn}${variationSuffix > 1 ? ` (লট ${variationSuffix})` : ''}`,
      category: catConfig.cat,
      costPriceBDT: cost,
      retailPriceBDT: retail,
      stock: stockQty,
      reorderLevel: reorder,
      monthlyVelocityUnits: monthlyVelocity,
      supplier: catConfig.suppliers[currentId % catConfig.suppliers.length],
      status: status,
      descriptionEnglish: `Towa verified daily essential item for Bangladeshi households. Certified fresh and hygienically packed.`,
      descriptionBengali: `তোয়া স্টোর ভেরিফাইড নিত্যপ্রয়োজনীয় পণ্য। শতভাগ গুণগত মান ও সতেজতার নিশ্চয়তা।`,
      updatedAt: '2026-11-06T00:00:00Z'
    });

    currentId++;
  }

  return catalog;
}

export const initialProducts: Product[] = generateCompleteCatalog();

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'TOW-ORD-8821',
    customerName: 'Tanvir Hossain',
    phone: '+880 1712-449102',
    deliveryAddress: 'House 42, Road 11, Banani DOHS',
    district: 'Dhaka',
    division: 'Dhaka',
    itemsCount: 4,
    itemsSummary: 'Teer Soybean Oil 5L, ACI Pure Salt 1kg, Maggi 8pk, Radhuni Turmeric 200g',
    codAmountBDT: 1167,
    courierPartner: 'Pathao Courier',
    courierTrackingCode: 'PTH-DK-892110',
    status: 'delivered_settled',
    createdAt: '2026-11-04T10:30:00Z',
    settledAt: '2026-11-06T15:00:00Z',
    codAgingDays: 0
  },
  {
    id: 'ord-102',
    orderNumber: 'TOW-ORD-8822',
    customerName: 'Shamima Akter',
    phone: '+880 1823-991823',
    deliveryAddress: 'Flat 4B, Green Road, Dhanmondi',
    district: 'Dhaka',
    division: 'Dhaka',
    itemsCount: 3,
    itemsSummary: 'Dano Milk Powder 500g, Olympic Energy Plus, Parachute Coconut Oil 200ml',
    codAmountBDT: 620,
    courierPartner: 'Steadfast',
    courierTrackingCode: 'STF-8812901',
    status: 'cod_in_transit',
    createdAt: '2026-11-05T09:15:00Z',
    codAgingDays: 2
  },
  {
    id: 'ord-103',
    orderNumber: 'TOW-ORD-8823',
    customerName: 'Rafiqul Islam',
    phone: '+880 1911-300412',
    deliveryAddress: 'Agrabad Commercial Area, Near Sonali Bank',
    district: 'Chittagong',
    division: 'Chittagong',
    itemsCount: 6,
    itemsSummary: 'Teer Oil 5L, Savlon 1L, Harpic 750ml, Vim Liquid 500ml, Fresh Sugar 1kg',
    codAmountBDT: 1770,
    courierPartner: 'Steadfast',
    courierTrackingCode: 'STF-CTG-449012',
    status: 'out_for_delivery',
    createdAt: '2026-11-05T14:40:00Z',
    codAgingDays: 2
  },
  {
    id: 'ord-104',
    orderNumber: 'TOW-ORD-8824',
    customerName: 'Nusrat Jahan',
    phone: '+880 1670-882910',
    deliveryAddress: 'Zindabazar, West Lane, Sylhet Sadar',
    district: 'Sylhet',
    division: 'Sylhet',
    itemsCount: 2,
    itemsSummary: 'Ispahani Mirzapore Tea 400g, Danish Butter Cookies 400g',
    codAmountBDT: 650,
    courierPartner: 'RedX',
    courierTrackingCode: 'RDX-SYL-77189',
    status: 'cod_in_transit',
    createdAt: '2026-11-04T18:20:00Z',
    codAgingDays: 3
  },
  {
    id: 'ord-105',
    orderNumber: 'TOW-ORD-8825',
    customerName: 'Kazi Mahbub',
    phone: '+880 1552-198273',
    deliveryAddress: 'Sector 4, Uttara, Dhaka',
    district: 'Dhaka',
    division: 'Dhaka',
    itemsCount: 5,
    itemsSummary: 'Wheel Washing Powder 1kg, Lux Soap 4pk, Sensodyne 100g, Vim 500ml',
    codAmountBDT: 820,
    courierPartner: 'Pathao Courier',
    courierTrackingCode: 'PTH-DK-900214',
    status: 'delivered_settled',
    createdAt: '2026-11-05T11:00:00Z',
    settledAt: '2026-11-06T18:30:00Z',
    codAgingDays: 0
  },
  {
    id: 'ord-106',
    orderNumber: 'TOW-ORD-8826',
    customerName: 'Kamal Uddin',
    phone: '+880 1733-559021',
    deliveryAddress: 'Shaheb Bazar, Rajshahi',
    district: 'Rajshahi',
    division: 'Rajshahi',
    itemsCount: 3,
    itemsSummary: 'Teer Oil 5L, Radhuni Turmeric, Fresh Sugar',
    codAmountBDT: 1095,
    courierPartner: 'Paperfly',
    courierTrackingCode: 'PPF-RAJ-22819',
    status: 'pending_verification',
    createdAt: '2026-11-06T14:10:00Z',
    codAgingDays: 0
  },
  {
    id: 'ord-107',
    orderNumber: 'TOW-ORD-8827',
    customerName: 'Fatema Tuz Zohra',
    phone: '+880 1888-291044',
    deliveryAddress: 'Mirpur Section 10, Block C, Dhaka',
    district: 'Dhaka',
    division: 'Dhaka',
    itemsCount: 4,
    itemsSummary: 'Pran Frooto 6pk, Potata Biscuits 4pk, Maggi 8pk, Olympic Energy Plus',
    codAmountBDT: 468,
    courierPartner: 'Pathao Courier',
    courierTrackingCode: 'PTH-DK-901452',
    status: 'out_for_delivery',
    createdAt: '2026-11-06T09:00:00Z',
    codAgingDays: 1
  },
  {
    id: 'ord-108',
    orderNumber: 'TOW-ORD-8828',
    customerName: 'Anowar Hossain',
    phone: '+880 1711-889900',
    deliveryAddress: 'Chowhatta, Sylhet',
    district: 'Sylhet',
    division: 'Sylhet',
    itemsCount: 2,
    itemsSummary: 'Savlon Antiseptic 1L, Wheel Detergent 1kg',
    codAmountBDT: 540,
    courierPartner: 'Steadfast',
    courierTrackingCode: 'STF-SYL-90214',
    status: 'returned',
    createdAt: '2026-11-02T13:00:00Z',
    codAgingDays: 5
  }
];

export function computeStoreFinancials(products: Product[], orders: Order[]): StoreFinancials {
  const totalCostValuation = products.reduce((acc, p) => acc + (p.costPriceBDT * p.stock), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.retailPriceBDT * p.stock), 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const deliveredSettled = orders.filter(o => o.status === 'delivered_settled');
  const codSettled = deliveredSettled.reduce((acc, o) => acc + o.codAmountBDT, 0);

  const pendingCod = orders.filter(o => ['cod_in_transit', 'out_for_delivery', 'dispatched'].includes(o.status));
  const codPending = pendingCod.reduce((acc, o) => acc + o.codAmountBDT, 0);

  const totalOrdersAmount = orders.reduce((acc, o) => acc + o.codAmountBDT, 0);
  const returnedCount = orders.filter(o => o.status === 'returned').length;
  const rtoRate = orders.length > 0 ? (returnedCount / orders.length) * 100 : 0;

  // Average margin
  const margins = products.map(p => ((p.retailPriceBDT - p.costPriceBDT) / p.retailPriceBDT) * 100);
  const avgMargin = margins.reduce((a, b) => a + b, 0) / (margins.length || 1);

  return {
    totalCatalogCount: products.length,
    totalInventoryValuationCostBDT: Math.round(totalCostValuation),
    totalInventoryRetailValuationBDT: Math.round(totalRetailValuation),
    lowStockItemsCount: lowStock,
    outOfStockItemsCount: outOfStock,
    todayGMVBDT: 4890,
    monthlyGMVBDT: 142850,
    codPendingSettlementBDT: Math.round(codPending),
    codSettledThisMonthBDT: Math.round(codSettled + 128400), // include prior settled cycles
    averageProfitMarginPct: Math.round(avgMargin * 10) / 10,
    returnToOriginRatePct: Math.round(rtoRate * 10) / 10
  };
}
