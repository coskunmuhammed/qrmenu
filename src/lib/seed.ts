import { prisma } from './db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding V2 started...');

  // 1. Create Default Business
  const businessSlug = 'crystal-club';
  let business = await prisma.business.findUnique({
    where: { slug: businessSlug },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        slug: businessSlug,
        name: 'Crystal VIP Lounge',
        description_tr: 'İstanbul\'un en prestijli gece kulübü. Eşsiz kokteyller, canlı DJ performansları ve VIP hizmeti.',
        description_en: 'The most prestigious night club in Istanbul. Unique cocktails, live DJ performances, and VIP service.',
        description_ru: 'Самый престижный ночной клуб в Стамбуле. Уникальные коктейли, живые выступления ди-джеев и VIP-обслуживание.',
        description_de: 'Der renommierteste Nachtclub in Istanbul. Einzigartige Cocktails, Live-DJ-Auftritte und VIP-Service.',
        description_ar: 'نادي الرقص الأكثر شهرة في إسطنبول. الكوكتيلات الفريدة، عروض الدي جي الحية، وخدمة كبار الشخصيات.',
        whatsappNumber: '905300000000',
        instagramUsername: 'crystallounge',
        googleMapsUrl: 'https://maps.google.com',
        defaultCurrency: 'TRY',
        vipMinSpendInfo: 'VIP masalar için minimum harcama limiti 15,000 TL / $450\'dır.',
        openingHours: '20:00 - 05:00',
        themeName: 'luxury-gold',
      },
    });
    console.log(`Created default Business: "${business.name}"`);
  } else {
    console.log(`Business "${businessSlug}" already exists`);
  }

  // 2. Create Default Admin User linked to Business
  const existingUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
        role: 'admin',
        businessId: business.id,
      },
    });
    console.log('Created admin user (admin / admin123) linked to business');
  } else {
    // Ensure existing user is linked to business
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { businessId: business.id },
    });
    console.log('Admin user already exists, verified business link');
  }

  // 3. Create Tables
  const defaultTables = ['10', '12', '15', 'VIP-1', 'VIP-2'];
  for (const tableNo of defaultTables) {
    const existingTable = await prisma.table.findFirst({
      where: { businessId: business.id, tableNo },
    });
    if (!existingTable) {
      await prisma.table.create({
        data: {
          businessId: business.id,
          tableNo,
        },
      });
      console.log(`Created Table: ${tableNo}`);
    }
  }

  // 4. Create Categories & Products with Variations
  const categoriesData = [
    {
      name_tr: 'Signature Kokteyller',
      name_en: 'Signature Cocktails',
      name_ru: 'Фирменные Коктейли',
      name_de: 'Signature Cocktails',
      name_ar: 'الكوكتيلات الخاصة',
      order: 1,
      products: [
        {
          name_tr: 'Purple Rain',
          name_en: 'Purple Rain',
          name_ru: 'Фиолетовый Дождь',
          name_de: 'Lila Regen',
          name_ar: 'المطر الأرجواني',
          description_tr: 'Cin, kelebek bezelye çiçeği çayı, tonik, taze limon suyu ve gümüş sim parıltısı.',
          description_en: 'Gin, butterfly pea flower tea, tonic, fresh lemon juice and silver glitter shimmer.',
          description_ru: 'Джин, чай из цветков анчана, тоник, свежий лимонный сок и серебряный глиттер.',
          description_de: 'Gin, Schmetterlingserbsenblütentee, Tonic, frischer Zitronensaft und Silberschimmer.',
          description_ar: 'جين، شاي زهرة البازلاء الفراشة، تونك، عصير ليمون طازج ولمعان الفضة.',
          price: 520,
          discountPrice: 480, // Discounted promotional price
          isPopular: true,
          isNew: true,
          isRecommended: false,
          isAvailable: true,
          alcoholRatio: 15.0,
          volume: '300ml',
          ingredients: 'Gin, Tonic, Lime, Butterfly Pea Pea Tea',
          variations: [],
        },
        {
          name_tr: 'Gold Rush',
          name_en: 'Gold Rush',
          name_ru: 'Золотая лихорадка',
          name_de: 'Goldrausch',
          name_ar: 'حمى الذهب',
          description_tr: 'Burbon viski, taze limon suyu, bal şurubu ve yenilebilir 24 ayar altın tozu.',
          description_en: 'Bourbon whiskey, fresh lemon juice, honey syrup and edible 24k gold dust.',
          description_ru: 'Бурбон, свежий лимонный сок, медовый сироп и пищевая золотая пыль 24 карата.',
          description_de: 'Bourbon-Whisky, frischer Zitronensaft, Honigsirup und essbarer 24-Karat-Goldstaub.',
          description_ar: 'ويسكي بوربون، عصير ليمون طازج، شراب العسل وغبار ذهب عيار 24 قابل للأكل.',
          price: 580,
          discountPrice: null,
          isPopular: true,
          isNew: false,
          isRecommended: true,
          isAvailable: true,
          alcoholRatio: 18.5,
          volume: '250ml',
          ingredients: 'Bourbon, Lemon Juice, Honey, 24k Gold',
          variations: [],
        },
      ],
    },
    {
      name_tr: 'Premium Viski',
      name_en: 'Premium Whiskey',
      name_ru: 'Премиум Виски',
      name_de: 'Premium-Whisky',
      name_ar: 'الويسكي المميز',
      order: 2,
      products: [
        {
          name_tr: 'Jack Daniel\'s No.7',
          name_en: 'Jack Daniel\'s No.7',
          name_ru: 'Джек Дэниелс №7',
          name_de: 'Jack Daniel\'s Nr. 7',
          name_ar: 'جاك دانيالز رقم 7',
          description_tr: 'Kömür filtrasyonundan geçmiş klasik Tennessee viskisi.',
          description_en: 'Classic charcoal-mellowed Tennessee whiskey.',
          description_ru: 'Классический теннессийский виски, отфильтрованный через уголь.',
          description_de: 'Klassischer, durch Holzkohle gereifter Tennessee-Whisky.',
          description_ar: 'ويسكي تينيسي الكلاسيكي المصفى بالفحم.',
          price: 450, // Standard glass price
          discountPrice: null,
          isPopular: false,
          isNew: false,
          isRecommended: false,
          isAvailable: true,
          alcoholRatio: 40.0,
          volume: 'Kadeh (Glass)',
          ingredients: 'Charcoal Mellowed Tennessee Whiskey',
          variations: [
            { name_tr: '35 cl Şişe', name_en: '35 cl Bottle', price: 2800 },
            { name_tr: '70 cl Şişe', name_en: '70 cl Bottle', price: 4800 },
            { name_tr: '100 cl Şişe', name_en: '100 cl Bottle', price: 6200 },
          ],
        },
      ],
    },
    {
      name_tr: 'VIP Şişe & Paket Servis',
      name_en: 'VIP Bottle & Packages',
      name_ru: 'VIP Бутылки и Пакеты',
      name_de: 'VIP-Flaschen und -Pakete',
      name_ar: 'زجاجات وباقات VIP',
      order: 3,
      products: [
        {
          name_tr: 'Royal Sapphire VIP Paket',
          name_en: 'Royal Sapphire VIP Package',
          name_ru: 'VIP-пакет Королевский Сапфир',
          name_de: 'Königliches Saphir VIP-Paket',
          name_ar: 'باقة رويال سافير VIP',
          description_tr: '1 Şişe Belvedere Votka, 1 Şişe Moët Şampanya, Meyve ve Çerez Tabağı, Lüks Sunum Seremonisi, Volkan Gösterisi ve Özel VIP Loca Hizmeti.',
          description_en: '1 Bottle Belvedere Vodka, 1 Bottle Moët Champagne, Fruit and Nut Platter, Luxury Service Ceremony, Sparkler Show, and Private VIP Lodge waiter.',
          description_ru: '1 бутылка водки Belvedere, 1 бутылка шампанского Moët, тарелка с фруктами и орехами, роскошная церемония подачи, световое шоу и VIP-официант.',
          description_de: '1 Flasche Belvedere Wodka, 1 Flasche Moët Champagner, Obst- und Nussplatte, Luxus-Servierzeremonie, Vulkan-Show und VIP-Service.',
          description_ar: 'زجاجة فودكا بيلفيدير، زجاجة شامبانيا مويت، طبق فواكه ومكسرات، مراسم تقديم فاخرة، عرض ألعاب نارية، ونادل VIP خاص.',
          price: 18000,
          discountPrice: null,
          isPopular: true,
          isNew: false,
          isRecommended: true,
          isAvailable: true,
          alcoholRatio: null,
          volume: 'Paket',
          ingredients: 'Vodka, Champagne, Fruits, Nuts, Energy Drinks',
          variations: [],
        },
      ],
    },
  ];

  for (const catData of categoriesData) {
    let category = await prisma.category.findFirst({
      where: {
        businessId: business.id,
        name_tr: catData.name_tr,
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          businessId: business.id,
          name_tr: catData.name_tr,
          name_en: catData.name_en,
          name_ru: catData.name_ru,
          name_de: catData.name_de,
          name_ar: catData.name_ar,
          order: catData.order,
        },
      });
      console.log(`Created Category: ${catData.name_tr}`);
    }

    for (const prodData of catData.products) {
      let product = await prisma.product.findFirst({
        where: {
          categoryId: category.id,
          name_tr: prodData.name_tr,
        },
      });

      if (!product) {
        product = await prisma.product.create({
          data: {
            categoryId: category.id,
            name_tr: prodData.name_tr,
            name_en: prodData.name_en,
            name_ru: prodData.name_ru,
            name_de: prodData.name_de,
            name_ar: prodData.name_ar,
            description_tr: prodData.description_tr,
            description_en: prodData.description_en,
            description_ru: prodData.description_ru,
            description_de: prodData.description_de,
            description_ar: prodData.description_ar,
            price: prodData.price,
            discountPrice: prodData.discountPrice,
            isPopular: prodData.isPopular,
            isNew: prodData.isNew,
            isRecommended: prodData.isRecommended,
            isAvailable: prodData.isAvailable,
            alcoholRatio: prodData.alcoholRatio,
            ingredients: prodData.ingredients,
            volume: prodData.volume,
          },
        });
        console.log(`Created Product: ${prodData.name_tr}`);
      }

      // Add variations if any
      for (const varData of prodData.variations) {
        const existingVar = await prisma.productVariation.findFirst({
          where: {
            productId: product.id,
            name_tr: varData.name_tr,
          },
        });

        if (!existingVar) {
          await prisma.productVariation.create({
            data: {
              productId: product.id,
              name_tr: varData.name_tr,
              name_en: varData.name_en,
              price: varData.price,
            },
          });
          console.log(`Created Variation for ${product.name_tr}: ${varData.name_tr}`);
        }
      }
    }
  }

  // 5. Create Campaigns & Events
  const existingCampaign = await prisma.campaign.findFirst({
    where: { businessId: business.id },
  });
  if (!existingCampaign) {
    await prisma.campaign.create({
      data: {
        businessId: business.id,
        title_tr: 'Happy Hour Gecesi',
        title_en: 'Happy Hour Night',
        title_ru: 'Вечер Хэппи Час',
        title_de: 'Happy-Hour-Nacht',
        title_ar: 'ليلة الساعة السعيدة',
        description_tr: 'Çarşamba geceleri tüm kokteyllerde %20 indirim fırsatını kaçırmayın.',
        description_en: 'Don\'t miss 20% off on all cocktails every Wednesday night.',
        isActive: true,
        order: 1,
      },
    });
    console.log('Created campaign');
  }

  const existingEvent = await prisma.event.findFirst({
    where: { businessId: business.id },
  });
  if (!existingEvent) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 3);
    eventDate.setHours(22, 0, 0, 0);

    await prisma.event.create({
      data: {
        businessId: business.id,
        title_tr: 'Friday Night Fever - DJ Alex',
        title_en: 'Friday Night Fever - DJ Alex',
        title_ru: 'Пятничная лихорадка - DJ Alex',
        title_de: 'Friday Night Fever - DJ Alex',
        title_ar: 'حمى ليلة الجمعة - دي جي أليكس',
        djName: 'DJ Alex Groove',
        date: eventDate,
        description_tr: 'Eşsiz elektronik müzik setleri ve dans gösterileriyle dolu çılgın bir gece.',
        description_en: 'A wild night full of unique electronic music sets and dance shows.',
        isActive: true,
      },
    });
    console.log('Created event');
  }

  console.log('Seeding V2 completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
