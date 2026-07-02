import { prisma } from './db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding V2 started...');

  // Clean start for menu data
  try {
    console.log('Cleaning up old menu data for re-seeding...');
    await prisma.productVariation.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.campaign.deleteMany({});
    await prisma.event.deleteMany({});
  } catch (e) {
    console.warn('Failed to clean up old database records:', e);
  }

  // 1. Create Default Business
  const businessSlug = 'crystal-club';
  let business = await prisma.business.findUnique({
    where: { slug: businessSlug },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        slug: businessSlug,
        name: 'Dior Beach Club',
        description_tr: 'Dior Beach Club\'ın eşsiz ortamında, lüks ve konforun buluştuğu dijital gastronomi deneyimine hoş geldiniz.',
        description_en: 'Welcome to the digital gastronomy experience where luxury and comfort meet in the unique atmosphere of Dior Beach Club.',
        description_ru: 'Самый престижный ночной клуб в Стамбуле. Уникальные коктейли, живые выступления ди-джеев и VIP-обслуживание.',
        description_de: 'Der renommierteste Nachtclub in Istanbul. Einzigartige Cocktails, Live-DJ-Auftritte und VIP-Service.',
        description_ar: 'نادي الرقص الأكثر شهرة في إسطنبول. الكوكتيلات الفريدة، عروض الدي جي الحية، وخدمة كبار الشخصيات.',
        whatsappNumber: '905322098964', // Number from the menu image
        instagramUsername: 'diorbeachclup_', // Instagram from the menu image
        googleMapsUrl: 'https://maps.google.com',
        defaultCurrency: 'TRY',
        vipMinSpendInfo: 'VIP masalar için minimum harcama limiti 15,000 TL / $450\'dır.',
        openingHours: '10:00 - 02:00',
        themeName: 'luxury-gold',
      },
    });
    console.log(`Created default Business: "${business.name}"`);
  } else {
    // Update contact details from the menu image
    business = await prisma.business.update({
      where: { id: business.id },
      data: {
        whatsappNumber: '905322098964',
        instagramUsername: 'diorbeachclup_',
      }
    });
    console.log(`Business "${businessSlug}" already exists, updated contact details`);
  }

  // 2. Create Default Admin User linked to Business
  const existingUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('0142753869Aa.', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
        role: 'admin',
        businessId: business.id,
      },
    });
    console.log('Created admin user (admin / 0142753869Aa.) linked to business');
  } else {
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
      name_tr: 'Başlangıçlar ve Kızartmalar',
      name_en: 'Starters & Fries',
      order: 1,
      products: [
        { name_tr: 'Patates Tabağı', name_en: 'French Fries', price: 400, description_tr: 'Altın sarısı çıtır patates kızartması.' },
        { name_tr: 'Soğan Halkası', name_en: 'Onion Rings', price: 500, description_tr: 'Çıtır kaplamalı soğan halkaları.' },
        { name_tr: 'Elma Dilimi', name_en: 'Potato Wedges', price: 500, description_tr: 'Baharatlı elma dilim patates kızartması.' },
        { name_tr: 'Cheddar Soslu Patates', name_en: 'Fries with Cheddar', price: 500, description_tr: 'Sıcak cheddar peyniri soslu patates kızartması.' },
        { name_tr: 'Dior Mix', name_en: 'Dior Mix Platter', price: 800, description_tr: 'Patates kızartması, soğan halkası, mozzarella stick, sosis ve tavuk nugget.' },
        { name_tr: 'Sosis Tava', name_en: 'Pan-fried Sausage', price: 500, description_tr: 'Özel baharatlarla tavada sosis.' }
      ]
    },
    {
      name_tr: 'Tost Çeşitleri',
      name_en: 'Toasts',
      order: 2,
      products: [
        { name_tr: 'Kaşarlı Tost', name_en: 'Cheese Toast', price: 350, description_tr: 'Eriyen kaşar peynirli sıcak tost.' },
        { name_tr: 'Karışık Tost', name_en: 'Mixed Toast', price: 400, description_tr: 'Kaşar peyniri ve sucuklu sıcak tost.' },
        { name_tr: 'Sucuklu Tost', name_en: 'Sausage Toast', price: 400, description_tr: 'Baharatlı sucuklu sıcak tost.' }
      ]
    },
    {
      name_tr: 'Gözleme',
      name_en: 'Gozleme (Flatbread)',
      order: 3,
      products: [
        { name_tr: 'Beyaz Peynirli Gözleme', name_en: 'Feta Cheese Gozleme', price: 400, description_tr: 'Geleneksel sac üzerinde beyaz peynirli gözleme.' },
        { name_tr: 'Kaşarlı Gözleme', name_en: 'Kashar Cheese Gozleme', price: 400, description_tr: 'Sac üzerinde eriyen kaşarlı gözleme.' },
        { name_tr: 'Ispanaklı Gözleme', name_en: 'Spinach Gozleme', price: 400, description_tr: 'Taze ıspanaklı gözleme.' },
        { name_tr: 'Patatesli Gözleme', name_en: 'Potato Gozleme', price: 400, description_tr: 'Baharatlı patates dolgulu gözleme.' }
      ]
    },
    {
      name_tr: 'Wraplar',
      name_en: 'Wraps',
      order: 4,
      products: [
        { name_tr: 'Izgara Tavuk Sezar Wrap', name_en: 'Grilled Chicken Caesar Wrap', price: 700, description_tr: 'Izgara tavuk, göbek marul, Sezar sos ve yanında patates kızartması ile.' },
        { name_tr: 'Dana Lokum Wrap', name_en: 'Beef Tenderloin Wrap', price: 800, description_tr: 'Izgara dana bonfile, çarliston biber, mantar, mozzarella peyniri ve yanında patates kızartması ile.' },
        { name_tr: 'Tavuk Wrap', name_en: 'Chicken Wrap', price: 700, description_tr: 'Izgara tavuk, çarliston biber, kapya biber, mantar, mozzarella ve yanında patates kızartması ile.' },
        { name_tr: 'Köfte Wrap', name_en: 'Meatball Wrap', price: 700, description_tr: 'Izgara köfte, cheddar peyniri, patates, domates, karamelize soğan ve şefin özel sosu ile.' }
      ]
    },
    {
      name_tr: 'Salatalar',
      name_en: 'Salads',
      order: 5,
      products: [
        { name_tr: 'Izgara Tavuk Salata', name_en: 'Grilled Chicken Salad', price: 600, description_tr: 'Marul, roka, cherry domates, salatalık, turşu, ızgara tavuk dilimleri ve limon sos.' },
        { name_tr: 'Sezar Salata', name_en: 'Caesar Salad', price: 600, description_tr: 'Izgara tavuk, Sezar sos, çıtır kruton ekmekler, parmesan peyniri, domates, salatalık ve turşu.' },
        { name_tr: 'Roka Salata', name_en: 'Arugula Salad', price: 500, description_tr: 'Taze roka, cherry domates, zeytinyağı, limon ve parmesan rendesi.' },
        { name_tr: 'Thai Bonfile Salata', name_en: 'Thai Beef Salad', price: 700, description_tr: 'Thai sos, ince dilim ızgara dana bonfile, Akdeniz yeşillikleri, salatalık, domates ve tatlı chili sos.' }
      ]
    },
    {
      name_tr: 'Meyveler & Atıştırmalıklar',
      name_en: 'Fruits & Snacks',
      order: 6,
      products: [
        { name_tr: 'Meyve Tabağı', name_en: 'Fruit Platter', price: 600, description_tr: 'Mevsimine göre karpuz, kavun, incir, çilek, üzüm and ananas.' },
        { name_tr: 'Dior Meyve Tabağı', name_en: 'Dior Special Fruit Platter', price: 800, description_tr: 'Özel sunumlu lüks karışık meyve tabağı.' },
        { name_tr: 'Çerez', name_en: 'Mixed Nuts', price: 400, description_tr: 'Karışık taze kuruyemiş tabağı.' }
      ]
    },
    {
      name_tr: 'Burgerler',
      name_en: 'Burgers',
      order: 7,
      products: [
        { name_tr: 'Chicken Burger', name_en: 'Chicken Burger', price: 800, description_tr: 'Tavuk pane, göbek marul, turşu, domates, karamelize soğan, şefin özel sosu ve patates kızartması ile.' },
        { name_tr: 'Chesse Burger', name_en: 'Cheeseburger', price: 800, description_tr: 'Özel köfte, erimiş cheddar peyniri, salatalık turşusu, domates, karamelize soğan, şefin özel sosu ve patates kızartması ile.' },
        { name_tr: 'Füme Kaburga Burger', name_en: 'Smoked Ribs Burger', price: 1000, description_tr: 'Özel köfte, cheddar peyniri, karamelize soğan, şefin özel sosu, füme dana kaburga dilimleri ve patates kızartması ile.' },
        { name_tr: 'Mushroom Burger', name_en: 'Mushroom Burger', price: 800, description_tr: 'Özel köfte, cheddar peyniri, turşu, domates, karamelize soğan, şefin özel sosu, sote mantar ve patates kızartması ile.' },
        { name_tr: 'Klasik Burger', name_en: 'Classic Burger', price: 800, description_tr: 'Özel köfte, salatalık turşusu, domates, karamelize soğan, şefin özel sosu ve patates kızartması ile.' }
      ]
    },
    {
      name_tr: 'Pide - Lahmacun',
      name_en: 'Pide & Lahmacun',
      order: 8,
      products: [
        { name_tr: 'Çıtır Lahmacun', name_en: 'Crispy Lahmacun', price: 600, description_tr: 'İnce çıtır hamur üzerinde özel kıymalı harç.' },
        { name_tr: 'Acılı/Acısız Lahmacun', name_en: 'Spicy/Regular Lahmacun', price: 600, description_tr: 'İsteğe göre acılı veya acısız servis edilen geleneksel lahmacun.' },
        { name_tr: 'Kaşarlı Pide', name_en: 'Cheese Pide', price: 600, description_tr: 'Bol erimiş kaşar peynirli pide.' },
        { name_tr: 'Sucuklu Kaşarlı Pide', name_en: 'Sausage & Cheese Pide', price: 650, description_tr: 'Sucuk ve kaşar peynirli lezzetli pide.' },
        { name_tr: 'Karışık Pide', name_en: 'Mixed Pide', price: 650, description_tr: 'Kıyma, sucuk ve kaşar peynirli karışık Karadeniz pidesi.' }
      ]
    },
    {
      name_tr: 'Pizzalar',
      name_en: 'Pizzas',
      order: 9,
      products: [
        { name_tr: 'Margherita Pizza', name_en: 'Margherita Pizza', price: 600, description_tr: 'Mozzarella peyniri, domates sos ve taze roka yaprakları.' },
        { name_tr: 'Karışık Pizza', name_en: 'Mixed Pizza', price: 700, description_tr: 'Sucuk, salam, mısır, zeytin, kapya biber, çarliston biber, mantar, mozzarella peyniri ve şefin domates sosu.' },
        { name_tr: 'Tavuklu Mantarlı Pizza', name_en: 'Chicken & Mushroom Pizza', price: 600, description_tr: 'Tavuk göğsü dilimleri, mantar, mozzarella peyniri ve şefin domates sosu.' },
        { name_tr: 'Füme Kaburgalı Pizza', name_en: 'Smoked Ribs Pizza', price: 800, description_tr: 'Özel domates sos, mozzarella peyniri, füme kaburga dilimleri ve parmesan peyniri.' }
      ]
    },
    {
      name_tr: 'Makarnalar',
      name_en: 'Pastas',
      order: 10,
      products: [
        { name_tr: 'Fettuccine Alfredo', name_en: 'Fettuccine Alfredo', price: 600, description_tr: 'Krema, sarımsak, bonfile dilimleri, tavuk, mantar ve parmesan peyniri.' },
        { name_tr: 'Barbie Fettuccine', name_en: 'Barbie Fettuccine', price: 600, description_tr: 'Pesto sos, krema, sarımsak, tavuk, mantar ve parmesan peyniri.' },
        { name_tr: 'Etli Penne Arabiata', name_en: 'Beef Penne Arrabbiata', price: 700, description_tr: 'Acılı domates sosu, dilimlenmiş bonfile, mantar, zeytin, kapya biber ve parmesan peyniri.' },
        { name_tr: '5 Peynir Soslu Ravioli', name_en: '5 Cheese Ravioli', price: 600, description_tr: 'Gravyer, parmesan, rokfor, mozzarella ve cheddar peynirli sos ile krema ve fesleğen.' }
      ]
    },
    {
      name_tr: 'Şişeler',
      name_en: 'Bottles',
      order: 11,
      products: [
        { name_tr: 'Havana Rom 35cl', name_en: 'Havana Rum 35cl', price: 3500 },
        { name_tr: 'Beefeater 35cl', name_en: 'Beefeater Gin 35cl', price: 3500 },
        { name_tr: 'Jameson 35cl', name_en: 'Jameson Whiskey 35cl', price: 3500 },
        { name_tr: 'Absolute 35cl', name_en: 'Absolut Vodka 35cl', price: 4000 },
        { name_tr: 'Chivas 35 cl', name_en: 'Chivas Regal 35cl', price: 4000 },
        { name_tr: 'Havana Rom 70cl', name_en: 'Havana Rum 70cl', price: 7000 },
        { name_tr: 'Beefeater 70cl', name_en: 'Beefeater Gin 70cl', price: 7000 },
        { name_tr: 'Jameson 70cl', name_en: 'Jameson Whiskey 70cl', price: 7000 },
        { name_tr: 'Absolute 70cl', name_en: 'Absolut Vodka 70cl', price: 7000 },
        { name_tr: 'Chivas 70cl', name_en: 'Chivas Regal 70cl', price: 7500 }
      ]
    },
    {
      name_tr: 'Soft İçecekler',
      name_en: 'Soft Drinks',
      order: 12,
      products: [
        { name_tr: 'Su Şişe', name_en: 'Water Bottle', price: 100 },
        { name_tr: 'Soda', name_en: 'Mineral Water', price: 100 },
        { name_tr: 'Ayran', name_en: 'Ayran', price: 150 },
        { name_tr: 'Ayran Fesleğen', name_en: 'Basil Ayran', price: 180 },
        { name_tr: 'Ayran Nane', name_en: 'Mint Ayran', price: 250 },
        { name_tr: 'Cola', name_en: 'Cola', price: 300 },
        { name_tr: 'Cola-Zero', name_en: 'Cola Zero', price: 300 },
        { name_tr: 'Sprite', name_en: 'Sprite', price: 300 },
        { name_tr: 'Fanta', name_en: 'Fanta', price: 300 },
        { name_tr: 'Ice Tea Şeftali', name_en: 'Peach Ice Tea', price: 300 },
        { name_tr: 'Ice Tea Limon', name_en: 'Lemon Ice Tea', price: 300 },
        { name_tr: 'Ice Tea Karpuz', name_en: 'Watermelon Ice Tea', price: 300 },
        { name_tr: 'Redbull', name_en: 'Red Bull Energy', price: 350 },
        { name_tr: 'Redbull Sugarfree', name_en: 'Red Bull Sugarfree', price: 350 },
        { name_tr: 'Redbull Sugarfree Pink', name_en: 'Red Bull Summer Edition', price: 350 },
        { name_tr: 'Limonata', name_en: 'Fresh Lemonade', price: 250 },
        { name_tr: 'Press Portakal', name_en: 'Fresh Orange Juice', price: 300 }
      ]
    },
    {
      name_tr: 'Premium Şişeler',
      name_en: 'Premium Bottles',
      order: 13,
      products: [
        { name_tr: 'Aberlour 12 70cl', name_en: 'Aberlour 12 Year Old 70cl', price: 10000 },
        { name_tr: 'Aberlour 14 70cl', name_en: 'Aberlour 14 Year Old 70cl', price: 12000 },
        { name_tr: 'Chivas 18 70cl', name_en: 'Chivas Regal 18 Year Old 70cl', price: 12500 },
        { name_tr: 'Chivas Royal 70cl', name_en: 'Chivas Royal Salute 21 70cl', price: 20000 },
        { name_tr: 'Chivas 25 70cl', name_en: 'Chivas Regal 25 Year Old 70cl', price: 30000 },
        { name_tr: 'Glenlivet 12 70cl', name_en: 'The Glenlivet 12 Year Old 70cl', price: 10000 },
        { name_tr: 'Glenlivet Rezerv 70cl', name_en: 'The Glenlivet Founders Reserve 70cl', price: 12000 },
        { name_tr: 'Hendrick\'s 70cl', name_en: 'Hendrick\'s Gin 70cl', price: 12000 },
        { name_tr: 'Belvedere 70cl', name_en: 'Belvedere Vodka 70cl', price: 13000 },
        { name_tr: 'Malfy 70cl', name_en: 'Malfy Gin 70cl', price: 8000 }
      ]
    },
    {
      name_tr: 'Shotlar',
      name_en: 'Shots',
      order: 14,
      products: [
        { name_tr: 'Tekila', name_en: 'Tequila Shot', price: 300 },
        { name_tr: 'Votka', name_en: 'Vodka Shot', price: 300 },
        { name_tr: 'B52', name_en: 'B52 Shot', price: 300 },
        { name_tr: 'Viski', name_en: 'Whiskey Shot', price: 300 },
        { name_tr: 'Jager', name_en: 'Jägermeister Shot', price: 300 }
      ]
    },
    {
      name_tr: 'Kokteyller',
      name_en: 'Cocktails',
      order: 15,
      products: [
        { name_tr: 'Negroni', name_en: 'Negroni', price: 800 },
        { name_tr: 'Mojito', name_en: 'Mojito', price: 900 },
        { name_tr: 'Strawberry Mojito', name_en: 'Strawberry Mojito', price: 900 },
        { name_tr: 'Long Island', name_en: 'Long Island Iced Tea', price: 1000 },
        { name_tr: 'Apreol Spritz', name_en: 'Aperol Spritz', price: 800 },
        { name_tr: 'Cuba Libre', name_en: 'Cuba Libre', price: 800 },
        { name_tr: 'Whiskey Sour', name_en: 'Whiskey Sour', price: 900 },
        { name_tr: 'Margarita', name_en: 'Margarita', price: 800 },
        { name_tr: 'Pinacolada', name_en: 'Pina Colada', price: 900 },
        { name_tr: 'Espresso Martini Shaker', name_en: 'Espresso Martini Shaker', price: 1100 },
        { name_tr: 'Espresso Martini', name_en: 'Espresso Martini', price: 800 },
        { name_tr: 'Gin Fizz', name_en: 'Gin Fizz', price: 800 },
        { name_tr: 'Cosmopolitan', name_en: 'Cosmopolitan', price: 800 },
        { name_tr: 'Lyncburg Lemonade', name_en: 'Lynchburg Lemonade', price: 800 },
        { name_tr: 'Jagermaister Boom', name_en: 'Jägerbomb', price: 700 }
      ]
    },
    {
      name_tr: 'Sıcak Bar',
      name_en: 'Hot Beverages',
      order: 16,
      products: [
        { name_tr: 'Çay', name_en: 'Turkish Tea', price: 50 },
        { name_tr: 'Türk Kahvesi', name_en: 'Turkish Coffee', price: 150 },
        { name_tr: 'Shot Espresso', name_en: 'Single Espresso', price: 200 },
        { name_tr: 'Double Espresso', name_en: 'Double Espresso', price: 250 },
        { name_tr: 'Mocha', name_en: 'Caffe Mocha', price: 300 },
        { name_tr: 'Macchiato', name_en: 'Espresso Macchiato', price: 300 },
        { name_tr: 'Latte', name_en: 'Caffe Latte', price: 300 },
        { name_tr: 'Cortado', name_en: 'Cortado', price: 300 },
        { name_tr: 'Affogato', name_en: 'Affogato', price: 300 }
      ]
    },
    {
      name_tr: 'Frozen',
      name_en: 'Frozens',
      order: 17,
      products: [
        { name_tr: 'Frozen Kavun', name_en: 'Melon Frozen', price: 400 },
        { name_tr: 'Frozen Karpuz', name_en: 'Watermelon Frozen', price: 400 },
        { name_tr: 'Frozen Çilek', name_en: 'Strawberry Frozen', price: 400 },
        { name_tr: 'Frozen Mango', name_en: 'Mango Frozen', price: 400 },
        { name_tr: 'Frozen Yeşil Elma', name_en: 'Green Apple Frozen', price: 400 },
        { name_tr: 'Frozen Passion Fruit', name_en: 'Passion Fruit Frozen', price: 400 }
      ]
    },
    {
      name_tr: 'Biralar',
      name_en: 'Beers',
      order: 18,
      products: [
        { name_tr: 'Tuborg 33 cl', name_en: 'Tuborg 33cl', price: 300 },
        { name_tr: 'Carlsberg 33 cl', name_en: 'Carlsberg 33cl', price: 400 },
        { name_tr: 'Desperados 33 cl', name_en: 'Desperados 33cl', price: 400 },
        { name_tr: 'Sol 33 cl', name_en: 'Sol 33cl', price: 400 },
        { name_tr: 'Weihenstephaner 33 cl', name_en: 'Weihenstephaner 33cl', price: 400 },
        { name_tr: 'Blanc 33 cl', name_en: 'Kronenbourg 1664 Blanc 33cl', price: 400 }
      ]
    },
    {
      name_tr: 'Milkshake',
      name_en: 'Milkshakes',
      order: 19,
      products: [
        { name_tr: 'Çikolatalı Milkshake', name_en: 'Chocolate Milkshake', price: 400 },
        { name_tr: 'Çilekli Milkshake', name_en: 'Strawberry Milkshake', price: 400 },
        { name_tr: 'Vanilyalı Milkshake', name_en: 'Vanilla Milkshake', price: 400 },
        { name_tr: 'Muzlu Milkshake', name_en: 'Banana Milkshake', price: 400 }
      ]
    },
    {
      name_tr: 'Şarap Şişe',
      name_en: 'Wine Bottles',
      order: 20,
      products: [
        { name_tr: 'White/Rose/Red Wine', name_en: 'House Wine (White/Rose/Red) 75cl', price: 3000 },
        { name_tr: 'Red Wine Bottle', name_en: 'Red Wine Bottle 75cl', price: 3000 },
        { name_tr: 'White Wine Bottle', name_en: 'White Wine Bottle 75cl', price: 3000 },
        { name_tr: 'Rose Wine Bottle', name_en: 'Rose Wine Bottle 75cl', price: 3000 }
      ]
    },
    {
      name_tr: 'Kadehler',
      name_en: 'Glasses & Spirits',
      order: 21,
      products: [
        { name_tr: 'Rom Kadeh', name_en: 'Rum Glass', price: 700 },
        { name_tr: 'Rom Cola', name_en: 'Rum & Cola', price: 700 },
        { name_tr: 'Rom Cola-Zero', name_en: 'Rum & Cola Zero', price: 700 },
        { name_tr: 'Votka Sek', name_en: 'Neat Vodka', price: 700 },
        { name_tr: 'Absolute Double', name_en: 'Absolut Double Shot', price: 900 },
        { name_tr: 'Absolute Enerji', name_en: 'Absolut & Energy Drink', price: 700 },
        { name_tr: 'Absolute Vişne', name_en: 'Absolut & Cherry', price: 700 },
        { name_tr: 'Absolute Cola', name_en: 'Absolut & Cola', price: 700 },
        { name_tr: 'Absolute Ananas', name_en: 'Absolut & Pineapple', price: 700 },
        { name_tr: 'Absolute Tonic', name_en: 'Absolut & Tonic', price: 700 },
        { name_tr: 'Absolute Elma', name_en: 'Absolut & Apple', price: 700 },
        { name_tr: 'Cin Tek (Soda Tonic)', name_en: 'Single Gin (Soda & Tonic)', price: 700 },
        { name_tr: 'Cin Double (Soda Tonic)', name_en: 'Double Gin (Soda & Tonic)', price: 900 },
        { name_tr: 'Chivas Tek', name_en: 'Chivas Regal Single', price: 700 },
        { name_tr: 'Chivas Double', name_en: 'Chivas Regal Double', price: 900 },
        { name_tr: 'Chivas Cola', name_en: 'Chivas & Cola', price: 700 },
        { name_tr: 'Chivas Enerji', name_en: 'Chivas & Energy Drink', price: 700 },
        { name_tr: 'Chivas Soda', name_en: 'Chivas & Soda', price: 700 },
        { name_tr: 'Jagermaister Kadeh', name_en: 'Jägermeister Glass', price: 700 },
        { name_tr: 'Jagermaister Double', name_en: 'Jägermeister Double Shot', price: 900 },
        { name_tr: 'Jagermaister Cola', name_en: 'Jägermeister & Cola', price: 700 },
        { name_tr: 'Jagermaister Enerji', name_en: 'Jägermeister & Energy', price: 700 },
        { name_tr: 'Şarap Rose Kadeh', name_en: 'Rose Wine Glass', price: 500 },
        { name_tr: 'Şarap White Kadeh', name_en: 'White Wine Glass', price: 500 },
        { name_tr: 'Şarap Red Kadeh', name_en: 'Red Wine Glass', price: 500 },
        { name_tr: 'Blush Kadeh', name_en: 'Blush Glass', price: 500 }
      ]
    },
    {
      name_tr: 'Dior Special',
      name_en: 'Dior Specials',
      order: 22,
      products: [
        { name_tr: 'Dior Special Cocktail', name_en: 'Dior Special Cocktail', price: 1000, description_tr: 'Lüks ve taze aromalarla Dior Beach Club imzalı kokteyl.' },
        { name_tr: 'Chili Martini', name_en: 'Chili Martini', price: 1000, description_tr: 'Hafif acı severler için chili biberi aromalı martini.' },
        { name_tr: 'Pornstar Martini', name_en: 'Pornstar Martini', price: 1000, description_tr: 'Çarkıfelek meyvesi, vanilyalı votka ve yanında bir kadeh Prosecco köpüklü şarap ile.' },
        { name_tr: 'Kuzu Kulağı', name_en: 'Sorrel Cocktail', price: 1000, description_tr: 'Taze kuzukulağı bitkisi ile hazırlanan ekşi ve ferahlatıcı kokteyl.' },
        { name_tr: 'Ah Belinda', name_en: 'Ah Belinda Cocktail', price: 1000, description_tr: 'Dior Beach Club\'a özel ferahlatıcı meyveli özel kokteyl.' },
        { name_tr: 'Berry Sour', name_en: 'Berry Sour', price: 1000, description_tr: 'Orman meyveleri ve ekşi notaların tatlı uyumu.' },
        { name_tr: 'Kiss Me', name_en: 'Kiss Me Cocktail', price: 1000, description_tr: 'Hafif tatlı, romantik sunumlu ve kırmızı meyve ağırlıklı kokteyl.' }
      ]
    },
    {
      name_tr: 'Ice İçecekler',
      name_en: 'Iced Coffees',
      order: 23,
      products: [
        { name_tr: 'Ice Americano', name_en: 'Iced Americano', price: 300 },
        { name_tr: 'Ice Latte', name_en: 'Iced Latte', price: 300 },
        { name_tr: 'Ice Caramel Latte', name_en: 'Iced Caramel Latte', price: 300 },
        { name_tr: 'Ice Mocha', name_en: 'Iced Mocha', price: 300 },
        { name_tr: 'Ice White Mocha', name_en: 'Iced White Chocolate Mocha', price: 300 }
      ]
    }
  ];

  for (const catData of categoriesData) {
    let category = await prisma.category.create({
      data: {
        businessId: business.id,
        name_tr: catData.name_tr,
        name_en: catData.name_en,
        order: catData.order,
      },
    });
    console.log(`Created Category: ${catData.name_tr}`);

    for (const prodData of catData.products) {
      await prisma.product.create({
        data: {
          categoryId: category.id,
          name_tr: prodData.name_tr,
          name_en: prodData.name_en,
          description_tr: (prodData as any).description_tr || null,
          description_en: (prodData as any).description_tr ? (prodData as any).name_en : null,
          price: prodData.price,
          isPopular: false,
          isNew: false,
          isRecommended: false,
          isAvailable: true,
          imageUrl: null,
        },
      });
      console.log(`Created Product: ${prodData.name_tr}`);
    }
  }

  // 5. Create Campaigns & Events
  await prisma.campaign.create({
    data: {
      businessId: business.id,
      title_tr: 'Happy Hour Gecesi',
      title_en: 'Happy Hour Night',
      description_tr: 'Çarşamba geceleri tüm kokteyllerde %20 indirim fırsatını kaçırmayın.',
      description_en: 'Don\'t miss 20% off on all cocktails every Wednesday night.',
      isActive: true,
      order: 1,
      imageUrl: null,
    },
  });
  console.log('Created campaign');

  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 3);
  eventDate.setHours(22, 0, 0, 0);

  await prisma.event.create({
    data: {
      businessId: business.id,
      title_tr: 'Friday Night Fever - DJ Alex',
      title_en: 'Friday Night Fever - DJ Alex',
      djName: 'DJ Alex Groove',
      date: eventDate,
      description_tr: 'Eşsiz elektronik müzik setleri ve dans gösterileriyle dolu çılgın bir gece.',
      description_en: 'A wild night full of unique electronic music sets and dance shows.',
      isActive: true,
      imageUrl: null,
    },
  });
  console.log('Created event');

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
