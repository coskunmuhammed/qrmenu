'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '@/components/LanguageContext';
import { guestCallWaiter, guestRequestBill } from '@/app/admin/actions';
import styles from '@/styles/menu.module.css';
import {
  Clock, Wine, Award, MessageCircle,
  MapPin, Clock3, Phone, ChevronUp, Sparkles, Flame, Percent,
  Mail, Globe, Bell, CreditCard, HelpCircle, Home, BookOpen, User, ArrowUp
} from 'lucide-react';

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface ProductVariation {
  id: string;
  name_tr: string;
  name_en: string;
  name_ru: string | null;
  name_de: string | null;
  name_ar: string | null;
  price: number;
}

interface Product {
  id: string;
  name_tr: string;
  name_en: string;
  name_ru: string | null;
  name_de: string | null;
  name_ar: string | null;
  description_tr: string | null;
  description_en: string | null;
  description_ru: string | null;
  description_de: string | null;
  description_ar: string | null;
  price: number;
  discountPrice: number | null;
  currency: string;
  imageUrl: string | null;
  isPopular: boolean;
  isNew: boolean;
  isRecommended: boolean;
  isAvailable: boolean;
  isActive: boolean;
  alcoholRatio: number | null;
  ingredients: string | null;
  volume: string | null;
  variations: ProductVariation[];
}

interface Category {
  id: string;
  name_tr: string;
  name_en: string;
  name_ru: string | null;
  name_de: string | null;
  name_ar: string | null;
  isActive: boolean;
  products: Product[];
}

interface Campaign {
  id: string;
  title_tr: string;
  title_en: string;
  title_ru: string | null;
  title_de: string | null;
  title_ar: string | null;
  description_tr: string | null;
  description_en: string | null;
  description_ru: string | null;
  description_de: string | null;
  description_ar: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface Event {
  id: string;
  title_tr: string;
  title_en: string;
  title_ru: string | null;
  title_de: string | null;
  title_ar: string | null;
  djName: string | null;
  date: string;
  description_tr: string | null;
  description_en: string | null;
  description_ru: string | null;
  description_de: string | null;
  description_ar: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface Business {
  id: string;
  slug: string;
  name: string;
  description_tr: string | null;
  description_en: string | null;
  description_ru: string | null;
  description_de: string | null;
  description_ar: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  whatsappNumber: string | null;
  instagramUsername: string | null;
  googleMapsUrl: string | null;
  defaultCurrency: string;
  vipMinSpendInfo: string | null;
  openingHours: string | null;
  themeName: string;
  customColors: string | null;
  showHighlightPopup: boolean;
  highlightTitle: string | null;
  highlightProductId: string | null;
  highlightDiscountText: string | null;
  highlightValidUntil: string | null;
  categories: Category[];
  campaigns: Campaign[];
  events: Event[];
}

interface MenuViewProps {
  business: Business;
  tableNo: string | null;
}

// Preset Premium Theme Palette Definitions
const THEMES: Record<string, {
  bg: string;
  bgSecondary: string;
  card: string;
  primary: string;
  accent: string;
  text: string;
  textSecondary: string;
  borderGold: string;
}> = {
  'luxury-gold': {
    bg: '#030306',
    bgSecondary: '#080812',
    card: 'rgba(24, 24, 24, 0.85)',
    primary: '#d4af37',
    accent: '#bd00ff',
    text: '#f5f5f7',
    textSecondary: '#a1a1aa',
    borderGold: '1px solid rgba(212, 175, 55, 0.25)',
  },
  'neon-blue': {
    bg: '#020914',
    bgSecondary: '#04162e',
    card: 'rgba(24, 24, 24, 0.85)',
    primary: '#00e0ff',
    accent: '#bd00ff',
    text: '#e6f8ff',
    textSecondary: '#8cb1cf',
    borderGold: '1px solid rgba(0, 224, 255, 0.25)',
  },
  'dark-club': {
    bg: '#05000a',
    bgSecondary: '#110221',
    card: 'rgba(24, 24, 24, 0.85)',
    primary: '#bd00ff',
    accent: '#00e0ff',
    text: '#fbf5ff',
    textSecondary: '#b8a6cc',
    borderGold: '1px solid rgba(189, 0, 255, 0.25)',
  },
  'white-premium': {
    bg: '#FAF7F2',
    bgSecondary: '#FAF7F2',
    card: '#FFFFFF',
    primary: '#C8A977',
    accent: '#6D6D6D',
    text: '#1D1D1D',
    textSecondary: '#6D6D6D',
    borderGold: '1px solid #E8DED0',
  }
};

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonThumb} />
    <div className={styles.skeletonText}>
      <div className={styles.skeletonLine} style={{ width: '70%' }} />
      <div className={styles.skeletonLine} style={{ width: '45%' }} />
      <div className={styles.skeletonLine} style={{ width: '20%' }} />
    </div>
  </div>
);

const TRANSLATIONS_LOOKUP: Record<string, Record<string, string>> = {
  // Category names
  "Signature Kokteyller": {
    tr: "Signature Kokteyller",
    en: "Signature Cocktails",
    ru: "Фирменные Коктейли",
    de: "Signature Cocktails",
    ar: "كوكتيلات مميزة"
  },
  "Signature Cocktails": {
    tr: "Signature Kokteyller",
    en: "Signature Cocktails",
    ru: "Фирменные Коктейли",
    de: "Signature Cocktails",
    ar: "كوكتيلات مميزة"
  },
  "Klasik Kokteyller": {
    tr: "Klasik Kokteyller",
    en: "Classic Cocktails",
    ru: "Классические Коктейли",
    de: "Klassische Cocktails",
    ar: "كوكتيلات كلاسيكية"
  },
  "Classic Cocktails": {
    tr: "Klasik Kokteyller",
    en: "Classic Cocktails",
    ru: "Классические Коктейли",
    de: "Klassische Cocktails",
    ar: "كوكتيلات كلاسيكية"
  },
  "Premium Viski": {
    tr: "Premium Viski",
    en: "Premium Whiskey",
    ru: "Премиум Виски",
    de: "Premium Whisky",
    ar: "ويسكي فاخر"
  },
  "Premium Whiskey": {
    tr: "Premium Viski",
    en: "Premium Whiskey",
    ru: "Премиум Виски",
    de: "Premium Whisky",
    ar: "ويسكي فاخر"
  },
  "Şampanya & Şişe Servis": {
    tr: "Şampanya & Şişe Servis",
    en: "Champagne & Bottle Service",
    ru: "Шампанское и бутылочный сервис",
    de: "Champagner & Flaschenservice",
    ar: "خدمة الشمبانيا والزجاجات"
  },
  "Champagne & Bottle Service": {
    tr: "Şampanya & Şişe Servis",
    en: "Champagne & Bottle Service",
    ru: "Шампанское и бутылочный сервис",
    de: "Champagner & Flaschenservice",
    ar: "خدمة الشمبانيا والزجاجات"
  },
  "VIP Paketler": {
    tr: "VIP Paketler",
    en: "VIP Packages",
    ru: "VIP Пакеты",
    de: "VIP-Pakete",
    ar: "باقات VIP"
  },
  "VIP Packages": {
    tr: "VIP Paketler",
    en: "VIP Packages",
    ru: "VIP Пакеты",
    de: "VIP-Pakete",
    ar: "باقات VIP"
  },
  // Business descriptions
  "İstanbul'un en prestijli gece kulübü. Eşsiz kokteyller, canlı DJ performansları ve VIP hizmeti.": {
    tr: "Dior Beach Club'ın eşsiz ortamında, lüks ve konforun buluştuğu dijital gastronomi deneyimine hoş geldiniz.",
    en: "Welcome to the digital gastronomy experience where luxury and comfort meet in the unique atmosphere of Dior Beach Club.",
    ru: "Добро пожаловать в мир цифровой гастрономии, где роскошь и комфорт встречаются в уникальной атмосфере Dior Beach Club.",
    de: "Willkommen beim digitalen Gastronomie-Erlebnis, bei dem Luxus und Komfort in der einzigartigen Atmosphäre des Dior Beach Clubs aufeinandertreffen.",
    ar: "مرحبًا بكم في تجربة الطهي الرقمية حيث يلتقي الفخامة والراحة في الأجواء الفريدة لنادي ديور الشاطئي."
  },
  "The most prestigious night club in Istanbul. Unique cocktails, live DJ performances, and VIP service.": {
    tr: "Dior Beach Club'ın eşsiz ortamında, lüks ve konforun buluştuğu dijital gastronomi deneyimine hoş geldiniz.",
    en: "Welcome to the digital gastronomy experience where luxury and comfort meet in the unique atmosphere of Dior Beach Club.",
    ru: "Добро пожаловать в мир цифровой гастрономии, где роскошь и комфорт встречаются в уникальной атмосфере Dior Beach Club.",
    de: "Willkommen beim digitalen Gastronomie-Erlebnis, bei dem Luxus und Komfort in der einzigartigen Atmosphäre des Dior Beach Clubs aufeinandertreffen.",
    ar: "مرحبًا بكم في تجربة الطهي الرقمية حيث يلتقي الفخامة والراحة في الأجواء الفريدة لنادي ديور الشاطئي."
  },
  // VIP Harcama Bilgisi
  "VIP masalar için minimum harcama limiti 15,000 TL / $450'dır.": {
    tr: "VIP masalar için minimum harcama limiti 15,000 TL / $450'dır.",
    en: "Minimum spend for VIP tables is 15,000 TL / $450.",
    ru: "Минимальный лимит расходов на VIP-столы составляет 15 000 TL / 450 $.",
    de: "Das Mindestguthaben für VIP-Tische beträgt 15.000 TL / 450 $.",
    ar: "الحد الأدنى للإنفاق على طاولات VIP هو 15,000 ليرة تركية / 450 دولارًا."
  },
  // Products
  "Purple Rain": {
    tr: "Purple Rain",
    en: "Purple Rain",
    ru: "Пурпурный Дождь",
    de: "Purple Rain",
    ar: "مطر بنفسجي"
  },
  "Cin, hibiskus şurubu, taze limon suyu ve tonik.": {
    tr: "Cin, hibiskus şurubu, taze limon suyu ve tonik.",
    en: "Gin, hibiscus syrup, fresh lemon juice and tonic.",
    ru: "Джин, сироп гибискуса, свежий лимонный сок и тоник.",
    de: "Gin, Hibiskussirup, frischer Zitronensaft und Tonic.",
    ar: "جين، شراب الكركديه، عصير الليمون الطازج والتونيك."
  },
  "Gin, hibiscus syrup, fresh lemon juice and tonic.": {
    tr: "Cin, hibiskus şurubu, taze limon suyu ve tonik.",
    en: "Gin, hibiscus syrup, fresh lemon juice and tonic.",
    ru: "Джин, сироп гибискуса, свежий лимонный сок и тоник.",
    de: "Gin, Hibiskussirup, frischer Zitronensaft und Tonic.",
    ar: "جين، شراب الكركديه، عصير الليمون الطازج والتونيك."
  },
  "Gold Rush": {
    tr: "Gold Rush",
    en: "Gold Rush",
    ru: "Золотая Лихорадка",
    de: "Gold Rush",
    ar: "حمى الذهب"
  },
  "Premium viski, bal şurubu, taze limon suyu.": {
    tr: "Premium viski, bal şurubu, taze limon suyu.",
    en: "Premium whiskey, honey syrup, fresh lemon juice.",
    ru: "Премиум виски, медовый сироп, свежий лимонный сок.",
    de: "Premium-Whisky, Honigsirup, frischer Zitronensaft.",
    ar: "ويسكي فاخر، شراب العسل، عصير الليمون الطازج."
  },
  "Premium whiskey, honey syrup, fresh lemon juice.": {
    tr: "Premium viski, bal şurubu, taze limon suyu.",
    en: "Premium whiskey, honey syrup, fresh lemon juice.",
    ru: "Премиум viski, медовый сироп, свежий лимонный сок.",
    de: "Premium-Whisky, Honigsirup, frischer Zitronensaft.",
    ar: "ويسكي فاخر، شراب العسل، عصير الليمون الطازج."
  },
  "Nebula Glow": {
    tr: "Nebula Glow",
    en: "Nebula Glow",
    ru: "Свечение Небулы",
    de: "Nebula Glow",
    ar: "توهج السديم"
  },
  "Votka, mavi kelebek çayı şurubu, taze lime suyu, soda.": {
    tr: "Votka, mavi kelebek çayı şurubu, taze lime suyu, soda.",
    en: "Vodka, blue butterfly pea tea syrup, fresh lime juice, soda.",
    ru: "Водка, сироп чая анчан, свежий сок лайма, содовая.",
    de: "Wodka, blauer Schmetterlingserbsentee-Sirup, frischer Limettensaft, Soda.",
    ar: "فودكا، شراب شاي bazلاء الفراشة الزرقاء، عصير لايم طازج، صودا."
  },
  "Vodka, blue butterfly pea tea syrup, fresh lime juice, soda.": {
    tr: "Votka, mavi kelebek çayı şurubu, taze lime suyu, soda.",
    en: "Vodka, blue butterfly pea tea syrup, fresh lime juice, soda.",
    ru: "Водка, сироп чая анчан, свежий сок лайма, содовая.",
    de: "Wodka, blauer Schmetterlingserbsentee-Sirup, frischer Limettensaft, Soda.",
    ar: "فودكا، شراب شاي bazلاء الفراشة الزرقاء، عصير لايم طازج، صودا."
  },
  "Classic Margarita": {
    tr: "Classic Margarita",
    en: "Classic Margarita",
    ru: "Классическая Маргарита",
    de: "Classic Margarita",
    ar: "مارغريتا كلاسيكية"
  },
  "Tekila, portakal likörü, taze kireç suyu.": {
    tr: "Tekila, portakal likörü, taze kireç suyu.",
    en: "Tequila, orange liqueur, fresh lime juice.",
    ru: "Текила, апельсиновый ликер, свежий сок лайма.",
    de: "Tequila, Orangenlikör, frischer Limettensaft.",
    ar: "تيكيلا، ليكور البرتقال، عصير الليمون الطازج."
  },
  "Tequila, orange liqueur, fresh lime juice.": {
    tr: "Tekila, portakal likörü, taze kireç suyu.",
    en: "Tequila, orange liqueur, fresh lime juice.",
    ru: "Текила, апельсиновый ликер, свежий сок лайма.",
    de: "Tequila, Orangenlikör, frischer Limettensaft.",
    ar: "تيكيلا، ليكور البرتقال، عصير الليمون الطازج."
  },
  "Premium Mojito": {
    tr: "Premium Mojito",
    en: "Premium Mojito",
    ru: "Премиум Мохито",
    de: "Premium Mojito",
    ar: "موهيتو فاخر"
  },
  "Premium rom, taze nane yaprakları, lime dilimleri, esmer şeker, soda.": {
    tr: "Premium rom, taze nane yaprakları, lime dilimleri, esmer şeker, soda.",
    en: "Premium rum, fresh mint leaves, lime slices, brown sugar, soda.",
    ru: "Премиум ром, свежие листья мяты, дольки лайма, тростниковый сахар, содовая.",
    de: "Premium-Rum, frische Minzblätter, Limettenscheiben, brauner Zucker, Soda.",
    ar: "روم فاخر، أوراق نعناع طازجة، شرائح لايم، سكر بني، صودا."
  },
  "Premium rum, fresh mint leaves, lime slices, brown sugar, soda.": {
    tr: "Premium rom, taze nane yaprakları, lime dilimleri, esmer şeker, soda.",
    en: "Premium rum, fresh mint leaves, lime slices, brown sugar, soda.",
    ru: "Премиум ром, свежие листья мяты, дольки лайма, тростниковый сахар, содовая.",
    de: "Premium-Rum, frische Minzblätter, Limettenscheiben, brauner Zucker, Soda.",
    ar: "روم فاخر، أوراق نعناع طازجة، شرائح لايم، سكر بني، صودا."
  },
  "Macallan 12 Y.O. (Glass)": {
    tr: "Macallan 12 Y.O. (Kadeh)",
    en: "Macallan 12 Y.O. (Glass)",
    ru: "Макаллан 12 лет (Бокал)",
    de: "Macallan 12 J. (Glas)",
    ar: "ماكالان 12 سنة (كأس)"
  },
  "Sherry meşe fıçılarda dinlendirilmiş single malt viski.": {
    tr: "Sherry meşe fıçılarda dinlendirilmiş single malt viski.",
    en: "Single malt whiskey aged in sherry oak casks.",
    ru: "Односолодовый виски, выдержанный в бочках из-под хереса.",
    de: "Single Malt Whisky, gereift in Sherry-Eichenfässern.",
    ar: "ويسكي سنغل مالت معتق في براميل بلوط الشيري."
  },
  "Single malt whiskey aged in sherry oak casks.": {
    tr: "Sherry meşe fıçılarda dinlendirilmiş single malt viski.",
    en: "Single malt whiskey aged in sherry oak casks.",
    ru: "Односолодовый виски, выдержанный в бочках из-под хереса.",
    de: "Single Malt Whisky, gereift in Sherry-Eichenfässern.",
    ar: "ويسكي سنغل مالت معتق في براميل بلوط الشيري."
  },
  "Chivas Regal 18 Y.O.": {
    tr: "Chivas Regal 18 Y.O.",
    en: "Chivas Regal 18 Y.O.",
    ru: "Чивас Ригал 18 лет",
    de: "Chivas Regal 18 J.",
    ar: "شيفاز ريجال 18 سنة"
  },
  "85 farklı aroma notası içeren premium harman viski.": {
    tr: "85 farklı aroma notası içeren premium harman viski.",
    en: "Premium blended whiskey containing 85 different flavor notes.",
    ru: "Премиум купажированный виски, содержащий 85 различных ароматических нот.",
    de: "Premium Blended Whisky mit 85 verschiedenen Geschmacksnoten.",
    ar: "ويسكي مخلوط فاخر يحتوي على 85 نكهة مختلفة."
  },
  "Premium blended whiskey containing 85 different flavor notes.": {
    tr: "85 farklı aroma notası içeren premium harman viski.",
    en: "Premium blended whiskey containing 85 different flavor notes.",
    ru: "Премиум купажированный виски, содержащий 85 различных ароматических нот.",
    de: "Premium Blended Whisky mit 85 verschiedenen Geschmacksnoten.",
    ar: "ويسكي مخلوط فاخر يحتوي على 85 نكهة مختلفة."
  },
  "Dom Pérignon Vintage": {
    tr: "Dom Pérignon Vintage",
    en: "Dom Pérignon Vintage",
    ru: "Дом Периньон Винтаж",
    de: "Dom Pérignon Vintage",
    ar: "دوم بيرينيون عتيق"
  },
  "Zengin aromalı, prestijli vintage şampanya.": {
    tr: "Zengin aromalı, prestijli vintage şampanya.",
    en: "Prestigious vintage champagne with a rich aroma.",
    ru: "Престижное винтажное шампанское с богатым ароматом.",
    de: "Prestigeträchtiger Vintage-Champagner mit reichem Aroma.",
    ar: "شمبانيا عتيقة مرموقة ذات رائحة غنية."
  },
  "Prestigious vintage champagne with a rich aroma.": {
    tr: "Zengin aromalı, prestijli vintage şampanya.",
    en: "Prestigious vintage champagne with a rich aroma.",
    ru: "Престижное винтажное шампанское с богатым ароматом.",
    de: "Prestigeträchtiger Vintage-Champagner mit reichem Aroma.",
    ar: "شمبانيا عتيقة مرموقة ذات رائحة غنية."
  },
  "Belvedere Vodka 70cl (Bottle)": {
    tr: "Belvedere Votka 70cl (Şişe)",
    en: "Belvedere Vodka 70cl (Bottle)",
    ru: "Водка Бельведер 70cl (Бутылка)",
    de: "Belvedere Wodka 70cl (Flasche)",
    ar: "فودكا بيلفيدير 70 مل (زجاجة)"
  },
  "Dört kez damıtılmış premium Polonya votkası.": {
    tr: "Dört kez damıtılmış premium Polonya votkası.",
    en: "Four-times distilled premium Polish vodka.",
    ru: "Премиальная польская водка четырехкратной дистилляции.",
    de: "Vierfach destillierter Premium-Wodka aus Polen.",
    ar: "فودكا بولندية فاخرة مقطرة أربع مرات."
  },
  "Four-times distilled premium Polish vodka.": {
    tr: "Dört kez damıtılmış premium Polonya votkası.",
    en: "Four-times distilled premium Polish vodka.",
    ru: "Премиальная польская водка четырехкратной дистилляции.",
    de: "Vierfach destillierter Premium-Wodka aus Polen.",
    ar: "فودكا بولندية فاخرة مقطرة أربع مرات."
  },
  "Royal Sapphire VIP Package": {
    tr: "Royal Sapphire VIP Paketi",
    en: "Royal Sapphire VIP Package",
    ru: "VIP Пакет Роял Сапфир",
    de: "Royal Sapphire VIP-Paket",
    ar: "باقة رويال سفاير VIP"
  },
  "1 Şişe Premium Viski veya Votka, 4 adet Red Bull, taze meyve sepeti, lüks kuruyemiş tabağı.": {
    tr: "1 Şişe Premium Viski veya Votka, 4 adet Red Bull, taze meyve sepeti, lüks kuruyemiş tabağı.",
    en: "1 Bottle of Premium Whiskey or Vodka, 4 Red Bulls, fresh fruit basket, luxury nut platter.",
    ru: "1 бутылка виски или водки премиум-класса, 4 редбулла, корзина свежих фруктов, элитное ассорти орехов.",
    de: "1 Flasche Premium-Whisky oder Wodka, 4 Red Bull, frischer Obstkorb, luxuriöser Nußteller.",
    ar: "زجاجة واحدة من الويسكي أو الفودكا الفاخرة، 4 رد بول، سلة فواكه طازجة، طبق مكسرات فاخر."
  },
  "1 Bottle of Premium Whiskey or Vodka, 4 Red Bulls, fresh fruit basket, luxury nut platter.": {
    tr: "1 Şişe Premium Viski veya Votka, 4 adet Red Bull, taze meyve sepeti, lüks kuruyemiş tabağı.",
    en: "1 Bottle of Premium Whiskey or Vodka, 4 Red Bulls, fresh fruit basket, luxury nut platter.",
    ru: "1 бутылка виски или водки премиум-класса, 4 редбулла, корзина свежих фруктов, элитное ассорти орехов.",
    de: "1 Flasche Premium-Whisky oder Wodka, 4 Red Bull, frischer Obstkorb, luxuriöser Nußteller.",
    ar: "زجاجة واحدة من الويسكي أو الفودكا الفاخرة، 4 رد بول، سلة فواكه طازجة، طبق مكسرات فاخر."
  },
  "Crystal Imperial VIP Package": {
    tr: "Crystal Imperial VIP Paketi",
    en: "Crystal Imperial VIP Package",
    ru: "VIP Пакет Кристал Империал",
    de: "Crystal Imperial VIP-Paket",
    ar: "باقة كريستال إمبيريال VIP"
  },
  "1 Şişe Dom Pérignon Vintage, 1 Şişe Belvedere Votka 70cl, premium meyve ve peynir sunumu, özel VIP garson hizmeti.": {
    tr: "1 Şişe Dom Pérignon Vintage, 1 Şişe Belvedere Votka 70cl, premium meyve ve peynir sunumu, özel VIP garson hizmeti.",
    en: "1 Bottle of Dom Pérignon Vintage, 1 Bottle of Belvedere Vodka 70cl, premium fruit and cheese presentation, private VIP waiter service.",
    ru: "1 бутылка Dom Pérignon Vintage, 1 бутылка Belvedere Vodka 70cl, фруктовое и сырное ассорти премиум-класса, услуги персонального VIP-официанта.",
    de: "1 Flasche Dom Pérignon Vintage, 1 Flasche Belvedere Wodka 70cl, Premium-Obst- und Käsepräsentation, privater VIP-Kellnerservice.",
    ar: "زجاجة واحدة من شمبانيا دوم بيرينيون العتيقة، زجاجة واحدة من فودكا بيلفيدير 70 مل، طبق فاكهة وجبن فاخر، خدمة نادل VIP خاصة."
  },
  "1 Bottle of Dom Pérignon Vintage, 1 Bottle of Belvedere Vodka 70cl, premium fruit and cheese presentation, private VIP waiter service.": {
    tr: "1 Şişe Dom Pérignon Vintage, 1 Şişe Belvedere Votka 70cl, premium meyve ve peynir sunumu, özel VIP garson hizmeti.",
    en: "1 Bottle of Dom Pérignon Vintage, 1 Bottle of Belvedere Vodka 70cl, premium fruit and cheese presentation, private VIP waiter service.",
    ru: "1 бутылка Dom Pérignon Vintage, 1 бутылка Belvedere Vodka 70cl, фруктовое и сырное ассорти премиум-класса, услуги персонального VIP-официанта.",
    de: "1 Flasche Dom Pérignon Vintage, 1 Flasche Belvedere Wodka 70cl, Premium-Obst- und Käsepräsentation, privater VIP-Kellnerservice.",
    ar: "زجاجة واحدة من شمبانيا دوم بيرينيون العتيقة، زجاجة واحدة من فودكا بيلفيدير 70 مل، طبق فاكهة وجبن فاخر، خدمة نادل VIP خاصة."
  }
};

export default function MenuView({ business, tableNo }: MenuViewProps) {
  const { language, setLanguage, t, isRtl } = useLanguage();

  // Select featured products dynamically from business categories
  const featuredProducts = business.categories
    .flatMap((cat) => cat.products)
    .filter((prod) => 
      prod.name_en === 'Purple Rain' || 
      prod.name_en === 'Dom Pérignon Vintage' || 
      prod.name_en === 'Macallan 12 Y.O. (Glass)' ||
      prod.name_en === 'Royal Sapphire VIP Package'
    );

  const campaigns = [
    {
      id: 'camp-1',
      title_tr: 'Happy Hour Geceleri',
      title_en: 'Happy Hour Evenings',
      desc_tr: 'Her gün 17:00 - 19:00 saatleri arasında signature kokteyllerde %20 indirim.',
      desc_en: '20% off on signature cocktails every day between 17:00 - 19:00.',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'camp-2',
      title_tr: 'Dior VIP Deneyimi',
      title_en: 'Dior VIP Experience',
      desc_tr: 'Lüks localarımızda özel hizmet ve şampanya ikramları.',
      desc_en: 'Private waiter service and complimentary champagne in our luxury daybeds.',
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&auto=format&fit=crop&q=80'
    }
  ];
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'cocktails' | 'food' | 'wine' | 'champagne' | 'events'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVar, setSelectedVar] = useState<ProductVariation | null>(null);

  // Expandable FAB Menu State
  const [fabOpen, setFabOpen] = useState(false);

  // Today's Highlight Popup State
  const [showHighlight, setShowHighlight] = useState(false);

  // Table Request States
  const [showBillModal, setShowBillModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  // Apply custom theme parameters dynamically (enforcing white-premium theme for UI Redesign)
  const activeTheme = THEMES['white-premium'];

  // Safe Multi-language String Resolution Helper with Dictionary Overrides
  const resolveStr = (item: any, prefix: string) => {
    const key = `${prefix}_${language}`;
    const rawVal = item[key] || item[`${prefix}_tr`] || item[`${prefix}_en`] || '';
    
    if (rawVal && TRANSLATIONS_LOOKUP[rawVal]) {
      return TRANSLATIONS_LOOKUP[rawVal][language] || TRANSLATIONS_LOOKUP[rawVal]['en'] || rawVal;
    }
    return rawVal;
  };

  // Simulate skeleton loaders on mount
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(timer);
  }, []);

  // Today's Highlight trigger
  useEffect(() => {
    if (business.showHighlightPopup && business.highlightProductId) {
      const timer = setTimeout(() => setShowHighlight(true), 800);
      return () => clearTimeout(timer);
    }
  }, [business]);

  // Find highlight product details
  const recommendedProduct = business.categories
    .flatMap((c) => c.products)
    .find((p) => p.id === business.highlightProductId);

  // Filter products by search query and activeTab
  const getFilteredCategories = () => {
    return business.categories.map((category) => {
      const filteredProducts = category.products.filter((prod) => {
        const title = resolveStr(prod, 'name').toLowerCase();
        const desc = (resolveStr(prod, 'description') || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || desc.includes(query);
      });

      return {
        ...category,
        products: filteredProducts,
      };
    }).filter((category) => {
      if (category.products.length === 0) return false;
      
      const catNameEn = (category.name_en || '').toLowerCase();
      const catNameTr = (category.name_tr || '').toLowerCase();
      
      if (activeTab === 'cocktails') {
        return catNameEn.includes('cocktail') || catNameTr.includes('kokteyl') || catNameEn.includes('drink') || catNameTr.includes('içecek');
      }
      if (activeTab === 'food') {
        return catNameEn.includes('food') || catNameTr.includes('yemek') || catNameEn.includes('snack') || catNameTr.includes('atıştırmalık') || catNameTr.includes('mutfak');
      }
      if (activeTab === 'wine') {
        return catNameEn.includes('wine') || catNameTr.includes('şarap');
      }
      if (activeTab === 'champagne') {
        return catNameEn.includes('champagne') || catNameTr.includes('şampanya');
      }
      
      return true;
    });
  };

  const filteredCategories = getFilteredCategories();

  // Scroll to category smoothly on tap
  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = categoryRefs.current[categoryId];
    if (element) {
      const offset = tableNo ? 210 : 160; // Height of header with table widget
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Observe category scrolling to auto-highlight category tab
  useEffect(() => {
    if (activeTab === 'events' || searchQuery !== '') return;

    const handleScroll = () => {
      const offset = tableNo ? 230 : 180;
      let currentActive = 'all';

      if (window.scrollY < 100) {
        setActiveCategory('all');
        return;
      }

      for (const cat of business.categories) {
        const el = categoryRefs.current[cat.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom >= offset) {
            currentActive = cat.id;
            break;
          }
        }
      }

      setActiveCategory(currentActive);

      if (currentActive !== 'all' && categoryMenuRef.current) {
        const activeTabEl = document.getElementById(`tab-${currentActive}`);
        if (activeTabEl) {
          const container = categoryMenuRef.current;
          const containerScrollLeft = container.scrollLeft;
          const containerWidth = container.clientWidth;
          const tabLeft = activeTabEl.offsetLeft;
          const tabWidth = activeTabEl.clientWidth;

          if (tabLeft < containerScrollLeft) {
            container.scrollTo({ left: tabLeft - 16, behavior: 'smooth' });
          } else if (tabLeft + tabWidth > containerScrollLeft + containerWidth) {
            container.scrollTo({ left: tabLeft - containerWidth + tabWidth + 16, behavior: 'smooth' });
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, searchQuery, business.categories, tableNo]);

  // Clean variation selection when modal changes
  useEffect(() => {
    setSelectedVar(null);
  }, [selectedProduct]);

  const triggerToast = (text: string, error = false) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* =========================================================================
     GUEST ACTION HANDLERS
     ========================================================================= */
  const handleCallWaiter = async () => {
    if (!tableNo) return;
    try {
      await guestCallWaiter(business.slug, tableNo);
      triggerToast(t('waiterCallSuccess'));
    } catch (e) {
      triggerToast('İşlem başarısız oldu.', true);
    }
  };

  const handleRequestBillSubmit = async () => {
    if (!tableNo) return;
    try {
      await guestRequestBill(business.slug, tableNo, paymentMethod, tipPercentage);
      setShowBillModal(false);
      triggerToast(t('billRequestSuccess'));
    } catch (e) {
      triggerToast('İşlem başarısız oldu.', true);
    }
  };

  const getWhatsappUrl = () => {
    const phone = '905322098964';
    const message = encodeURIComponent(t('whatsappReserveText'));
    return `https://wa.me/${phone}?text=${message}`;
  };

  const activeProductPrice = () => {
    if (!selectedProduct) return 0;
    if (selectedVar) return selectedVar.price;
    return selectedProduct.discountPrice || selectedProduct.price;
  };

  const getProductTags = (product: Product) => {
    const tags = [];
    if (product.isPopular) {
      tags.push({ label: t('popular'), class: styles.popularBadge, icon: <Flame size={10} /> });
    }
    if (product.isNew) {
      tags.push({ label: t('newItem'), class: styles.newBadge, icon: <Sparkles size={10} /> });
    }
    if (product.isRecommended) {
      tags.push({ label: t('recommended'), class: styles.recommendedBadge, icon: <Award size={10} /> });
    }
    if (product.discountPrice) {
      tags.push({ label: t('discount'), class: styles.limitedBadge, icon: <Percent size={10} /> });
    }
    return tags;
  };

  const getPairingText = (product: Product) => {
    const name = (product.name_en || '').toLowerCase();
    if (name.includes('champagne') || name.includes('dom')) {
      return language === 'tr' ? 'VIP Peynir ve Meyve Sunumu ile mükemmel uyum sağlar.' : 'Pairs beautifully with our VIP Cheese & Fruit Presentation.';
    }
    if (name.includes('whiskey') || name.includes('macallan') || name.includes('chivas')) {
      return language === 'tr' ? 'Lüks kuruyemiş tabağı ve çikolata ile servis edilmesi önerilir.' : 'Best paired with our luxury nut platter and chocolates.';
    }
    return language === 'tr' ? 'Didim sahil esintisinde taze meyve tabağı ile önerilir.' : 'Recommended with a fresh fruit platter in the beach breeze.';
  };

  const handleShare = async () => {
    if (!selectedProduct) return;
    const shareUrl = `${window.location.origin}/menu/${business.slug}?product=${selectedProduct.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: resolveStr(selectedProduct, 'name'),
          text: resolveStr(selectedProduct, 'description'),
          url: shareUrl,
        });
      } catch (e) {
        console.log('Share canceled or failed', e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        triggerToast(language === 'tr' ? 'Ürün linki kopyalandı!' : 'Product link copied!');
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <div className="menu-container">
      {/* Inject selected theme variables */}
      <style jsx global>{`
        :root {
          --bg-primary: ${activeTheme.bg};
          --bg-secondary: ${activeTheme.bgSecondary};
          --bg-card: ${activeTheme.card};
          --gold-primary: ${activeTheme.primary};
          --neon-purple: ${activeTheme.accent};
          --text-primary: ${activeTheme.text};
          --text-secondary: ${activeTheme.textSecondary};
          --border-gold: ${activeTheme.borderGold};
          
          /* Shadows adjustments for light theme */
          --shadow-neon-p: 0 4px 20px rgba(0, 0, 0, 0.02);
          --shadow-gold: 0 4px 20px rgba(176, 141, 87, 0.05);
        }
      `}</style>

      {/* Toast Alert */}
      {toast && (
        <div className={`${styles.toast} ${toast.error ? styles.toastError : styles.toastSuccess} glass`} role="alert">
          {toast.text}
        </div>
      )}

      {/* Brand Branding Header Target Mobile Design */}
      <div className={styles.heroBannerTarget}>
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80" 
          alt="Dior Beach Club Backdrop" 
          className={styles.heroImageV3}
        />
        <div className={styles.heroGradientV3} />
        
        {/* Top Search bar overlay (User Center) */}
        <div className={styles.heroSearchContainer}>
          <span className={styles.heroSearchIcon}>🔍</span>
          <input 
            type="text" 
            className={styles.heroSearchInput}
            placeholder="User center..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.heroSearchRightIcon} onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}>
            🌐 {language.toUpperCase()}
          </span>
        </div>

        {/* Hero Title & Info Group */}
        <div className={styles.heroTitleGroup}>
          <span className={styles.heroBadge}>PREMIUM</span>
          <h1 className={styles.heroTitle}>Dior Beach</h1>
          <p className={styles.heroDesc}>
            {resolveStr(business, 'description') || 'Gourmet selections and beach lounge cocktails.'}
          </p>
        </div>

        {/* Floating circular option button */}
        <button className={styles.heroFloatingBtn} onClick={() => setFabOpen(!fabOpen)}>
          •••
        </button>

        {/* Hero pagination dots indicator */}
        <div className={styles.heroDotsIndicator}>
          <div className={`${styles.heroDot} ${styles.heroDotActive}`} />
          <div className={styles.heroDot} />
          <div className={styles.heroDot} />
          <div className={styles.heroDot} />
          <div className={styles.heroDot} />
        </div>
      </div>

      {/* Main Panel Target (Overlapping Container) */}
      <div className={styles.mainPanelTarget}>
        {/* Search input and heart favorite row */}
        <div className={styles.panelSearchRow}>
          <div className={styles.panelSearchContainer}>
            <input 
              type="text" 
              className={styles.panelSearchInput}
              placeholder={t('searchPlaceholder') || "Sxitoped mmceoltive"} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className={styles.panelSearchIcon}>🔍</span>
          </div>
          <button 
            className={`${styles.heartButton} ${activeCategory === 'favorites' ? styles.heartButtonActive : ''}`}
            onClick={() => setActiveCategory(activeCategory === 'favorites' ? 'all' : 'favorites')}
          >
            ♥
          </button>
        </div>

        {/* Menu title & Horizontal Category tabs */}
        <div className={styles.panelHeaderRow}>
          <h2 className={styles.panelTitle}>Menu</h2>
          <div className={styles.categorySliderTarget} ref={categoryMenuRef}>
            <span 
              className={`${styles.categoryLink} ${activeCategory === 'all' ? styles.categoryLinkActive : ''}`}
              onClick={() => scrollToCategory('all')}
            >
              {t('all') || 'All'}
            </span>
            {filteredCategories.map((cat) => (
              <span
                key={cat.id}
                className={`${styles.categoryLink} ${activeCategory === cat.id ? styles.categoryLinkActive : ''}`}
                onClick={() => scrollToCategory(cat.id)}
              >
                {resolveStr(cat, 'name')}
              </span>
            ))}
          </div>
        </div>

        {/* Horizontal Navigation tabs under categories list */}
        <div className={styles.navTabs} style={{ overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', marginBottom: '24px' }}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'menu' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('menu'); setActiveCategory('all'); }}
            style={{ paddingLeft: '16px', paddingRight: '16px', flex: 'none' }}
          >
            {language === 'tr' ? 'MENÜ' : 'MENU'}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'cocktails' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('cocktails'); setActiveCategory('all'); }}
            style={{ paddingLeft: '16px', paddingRight: '16px', flex: 'none' }}
          >
            {language === 'tr' ? 'KOKTEYLLER' : 'COCKTAILS'}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'food' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('food'); setActiveCategory('all'); }}
            style={{ paddingLeft: '16px', paddingRight: '16px', flex: 'none' }}
          >
            {language === 'tr' ? 'YEMEK' : 'FOOD'}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'wine' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('wine'); setActiveCategory('all'); }}
            style={{ paddingLeft: '16px', paddingRight: '16px', flex: 'none' }}
          >
            {language === 'tr' ? 'ŞARAP' : 'WINE'}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'champagne' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('champagne'); setActiveCategory('all'); }}
            style={{ paddingLeft: '16px', paddingRight: '16px', flex: 'none' }}
          >
            {language === 'tr' ? 'ŞAMPANYA' : 'CHAMPAGNE'}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'events' ? styles.tabBtnActive : ''}`}
            onClick={() => { setActiveTab('events'); setActiveCategory('all'); }}
            style={{ paddingLeft: '16px', paddingRight: '16px', flex: 'none' }}
          >
            {language === 'tr' ? 'ETKİNLİKLER' : 'EVENTS'}
          </button>
        </div>

        {/* Dynamic products list scrolling */}
        {activeTab !== 'events' && (
          <div className={styles.menuTabContent}>
            {loading ? (
              <div className={styles.horizontalCardsScroll}>
                {Array(3).fill(0).map((_, idx) => (
                  <div key={idx} className={styles.darkProductCard} style={{ width: '172px', height: '240px', background: '#222' }} />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('emptySearch')}</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <section 
                  key={category.id} 
                  ref={(el) => { categoryRefs.current[category.id] = el; }}
                  style={{ marginBottom: '20px' }}
                >
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {resolveStr(category, 'name')}
                  </h3>

                  <div className={styles.horizontalCardsScroll}>
                    {category.products.map((product) => (
                      <div 
                        key={product.id}
                        className={`${styles.darkProductCard} ${!product.isAvailable ? styles.unavailable : ''}`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <button className={styles.darkCardOptionBtn} onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}>
                          ⋮
                        </button>
                        {product.imageUrl && (
                          <div className={styles.darkProductCardImageWrapper}>
                            <img 
                              src={product.imageUrl} 
                              alt={resolveStr(product, 'name')}
                              className={styles.darkProductCardImage}
                              loading="lazy"
                            />
                            {!product.isAvailable && (
                              <div className={styles.outOfStockBadge}>{t('outOfStock')}</div>
                            )}
                          </div>
                        )}
                        <div className={styles.darkProductCardInfo}>
                          <h4 className={styles.darkProductCardTitle}>
                            {resolveStr(product, 'name')}
                          </h4>
                          <p className={styles.darkProductCardDesc}>
                            {resolveStr(product, 'description') || 'Fresh luxury item'}
                          </p>
                          <div className={styles.darkProductCardPrice}>
                            {product.price.toLocaleString()} {t('currency')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}


          </div>
        )}



        {/* TAB 3: EVENTS */}
        {activeTab === 'events' && (
          <div className={styles.eventsTabContent}>
            <h2 className={styles.sectionHeading}>{t('eventsHeading')}</h2>
            {business.events.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{language === 'tr' ? 'Yaklaşan etkinlik bulunmamaktadır.' : 'No upcoming events.'}</p>
              </div>
            ) : (
              business.events.map((event) => (
                <div key={event.id} className={`${styles.eventCard}`}>
                  {event.imageUrl && (
                    <div className={styles.eventImageWrapper}>
                      <img 
                        src={event.imageUrl} 
                        alt={resolveStr(event, 'title')}
                        className={styles.eventImage}
                      />
                    </div>
                  )}
                  <div className={styles.eventInfo}>
                    <div className={styles.eventDate}>
                      {new Date(event.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    <h3 className={styles.eventTitle}>{resolveStr(event, 'title')}</h3>
                    {event.djName && (
                      <div className={styles.eventDj}>🎧 {event.djName}</div>
                    )}
                    <p className={styles.eventDescription}>
                      {resolveStr(event, 'description')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Contact Info Targets Premium Hospitality */}
      <footer className={styles.footerContainerTarget}>

        {/* Premium VIP Card */}
        {business.vipMinSpendInfo && (
          <div className={styles.vipPromotionCard}>
            <span className={styles.vipBadge}>VIP Experience</span>
            <h3 className={styles.vipTitle}>Exclusive Beach Lounges</h3>
            <p className={styles.vipDesc}>
              Private daybeds, dedicated host services, premium bottle collections, and priority beachside dining.
            </p>
            <div className={styles.vipSpendRow}>
              <span className={styles.vipSpendText}>Minimum spend:</span>
              <span className={styles.vipSpendVal}>15.000 TL</span>
            </div>
            <button 
              className={styles.vipReserveBtn}
              onClick={getWhatsappUrl ? () => window.open(getWhatsappUrl(), '_blank') : undefined}
            >
              Reserve Now <Sparkles size={12} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        )}

        {/* Business Information Card */}
        <div className={styles.businessInfoCard}>
          <div className={styles.bizLogo} style={{ width: '130px', fill: '#1d1d1d' }}>
            <svg viewBox="0 0 300 110" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
              <style>{`
                .brand-dior-dark {
                  font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif;
                  font-size: 54px;
                  fill: #111111;
                  letter-spacing: 5px;
                }
                .brand-sub-dark {
                  font-family: 'Inter', 'Manrope', sans-serif;
                  font-size: 11px;
                  fill: #666666;
                  letter-spacing: 5px;
                  font-weight: 500;
                }
                .wave-line-dark {
                  stroke: #111111;
                  stroke-width: 1.8;
                  fill: none;
                  stroke-linecap: round;
                }
              `}</style>
              <g transform="translate(150, 50)" textAnchor="middle">
                <text x="-48" y="5" className="brand-dior-dark" textAnchor="middle">DI</text>
                <g transform="translate(0, -12)">
                  <circle cx="0" cy="0" r="23" stroke="#111111" strokeWidth="4.5" fill="none" />
                  <path d="M-15,4 Q-7,0 0,4 T15,4" className="wave-line-dark" />
                  <path d="M-13,-2 Q-6.5,-5 0,-2 T13,-2" className="wave-line-dark" />
                </g>
                <text x="48" y="5" className="brand-dior-dark" textAnchor="middle">R</text>
                <text x="0" y="38" className="brand-sub-dark" textAnchor="middle">BEACH CLUB</text>
                <line x1="-105" y1="34" x2="-62" y2="34" stroke="#666666" strokeWidth="0.8" />
                <line x1="62" y1="34" x2="105" y2="34" stroke="#666666" strokeWidth="0.8" />
              </g>
            </svg>
          </div>
          <p className={styles.bizDesc}>
            Dior Beach Club'ın eşsiz ortamında, lüks ve konforun buluştuğu dijital gastronomi deneyimi.
          </p>
          
          <div className={styles.bizDetailRows}>
            <div className={styles.bizDetailRow}>
              <Clock className={styles.bizDetailIcon} size={14} />
              <span>09:00 - 02:00</span>
            </div>
            <div className={styles.bizDetailRow}>
              <Phone className={styles.bizDetailIcon} size={14} />
              <span>0532 209 89 64</span>
            </div>
            <div className={styles.bizDetailRow}>
              <MapPin className={styles.bizDetailIcon} size={14} />
              <span>Didim / Altınkum</span>
            </div>
          </div>

          <div className={styles.bizActionButtons}>
            <button className={styles.bizBtn} onClick={() => window.open('https://maps.app.goo.gl/1Vji6CvwNdqSH3Jn9?g_st=i', '_blank')}>
              <MapPin size={12} />
              <span>Get Directions</span>
            </button>
            <button className={styles.bizBtn} onClick={() => window.open('tel:+905322098964')}>
              <Phone size={12} />
              <span>Call</span>
            </button>
            <button className={styles.bizBtn} onClick={() => window.open('https://www.instagram.com/diorbeachclub_?igsh=ZzRieTY5Z25xeHM1', '_blank')}>
              <InstagramIcon size={12} />
              <span>Instagram</span>
            </button>
            <button className={styles.bizBtn} onClick={() => window.open(getWhatsappUrl(), '_blank')}>
              <MessageCircle size={12} />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Muted Copyright */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: '0.6', margin: '12px 0 0 0' }}>
          &copy; 2026 Dior Beach Club. All Rights Reserved.
        </p>

        {/* Scroll to Top button */}
        <button className={styles.scrollToTopBtn} onClick={scrollToTop} aria-label="Yukarı Git">
          <ArrowUp size={16} />
        </button>
      </footer>

      {/* TODAY'S RECOMMENDATION POPUP */}
      {showHighlight && recommendedProduct && (
        <div className={styles.modalOverlay} onClick={() => setShowHighlight(false)} role="dialog" aria-modal="true">
          <div className={styles.welcomePopupContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowHighlight(false)} aria-label="Kapat">×</button>
            <h3 className={styles.welcomeTitle}>{business.highlightTitle || t('chefChoice')}</h3>
            
            {recommendedProduct.imageUrl && (
              <div className={styles.modalImageWrapper} style={{ height: '170px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                <img 
                  src={recommendedProduct.imageUrl} 
                  alt={resolveStr(recommendedProduct, 'name')} 
                  className={styles.modalImage}
                />
              </div>
            )}

            <div className={styles.welcomeBanner}>{resolveStr(recommendedProduct, 'name')}</div>
            {business.highlightDiscountText && (
              <div className={styles.welcomeDiscount}>🔥 {business.highlightDiscountText}</div>
            )}
            {business.highlightValidUntil && (
              <div className={styles.welcomeValid}>🕒 {business.highlightValidUntil}</div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1, minHeight: '44px' }} 
                onClick={() => {
                  setSelectedProduct(recommendedProduct);
                  setShowHighlight(false);
                }}
              >
                {t('highlightPopupBtn')}
              </button>
              <button 
                className="btn-neon" 
                style={{ flex: 1, minHeight: '44px' }} 
                onClick={() => setShowHighlight(false)}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SHEET PRODUCT DETAIL (V3 Redesign) */}
      {selectedProduct && (
        <>
          <div className={styles.sheetBackdrop} onClick={() => { setSelectedProduct(null); setSelectedVar(null); }} />
          <div className={styles.bottomSheet}>
            <div className={styles.sheetHandle} />
            <button 
              className={styles.modalClose} 
              onClick={() => { setSelectedProduct(null); setSelectedVar(null); }}
              aria-label="Kapat"
              style={{ top: '20px', right: '20px' }}
            >
              ×
            </button>

            {selectedProduct.imageUrl && (
              <div className={styles.modalImageWrapper} style={{ width: '100%', aspectRatio: '16/10', margin: '0 0 20px 0', borderRadius: '16px', overflow: 'hidden' }}>
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={resolveStr(selectedProduct, 'name')} 
                  className={styles.modalImage}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <div className={styles.modalDetails} style={{ padding: '0' }}>
              <div className={styles.modalHeaderRow} style={{ marginBottom: '10px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '500', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {resolveStr(selectedProduct, 'name')}
                </h2>
                <div className={styles.badgeContainer} style={{ marginTop: '6px' }}>
                  {getProductTags(selectedProduct).map((tag, idx) => (
                    <span key={idx} className={tag.class}>
                      {tag.icon} {tag.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.modalAvailability} style={{ marginBottom: '14px' }}>
                <span className={selectedProduct.isAvailable ? styles.statusAvailable : styles.statusUnavailable} style={{ fontSize: '0.78rem' }}>
                  {selectedProduct.isAvailable ? `● ${t('inStock')}` : `● ${t('outOfStock')}`}
                </span>
              </div>

              <p className={styles.modalDescription} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                {resolveStr(selectedProduct, 'description')}
              </p>

              {/* Advanced info panel */}
              {(selectedProduct.ingredients || selectedProduct.volume || selectedProduct.alcoholRatio) && (
                <div className={styles.ingredientsPanel} style={{ background: '#F8F7F4', border: 'var(--border-gold)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {selectedProduct.volume && <p style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><Wine size={12} /> <strong>{t('volume')}:</strong> {selectedProduct.volume}</p>}
                  {selectedProduct.alcoholRatio && <p style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><Wine size={12} /> <strong>{t('alcohol')}:</strong> %{selectedProduct.alcoholRatio}</p>}
                  {selectedProduct.ingredients && <p style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><Award size={12} /> <strong>{t('ingredients')}:</strong> {selectedProduct.ingredients}</p>}
                </div>
              )}

              {/* Recommended pairing Section */}
              <div style={{ background: 'rgba(184, 148, 99, 0.05)', border: '1px solid rgba(184, 148, 99, 0.15)', borderRadius: '16px', padding: '14px 16px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  🍷 {language === 'tr' ? 'ÖNERİLEN EŞLEŞME' : 'RECOMMENDED PAIRING'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {getPairingText(selectedProduct)}
                </p>
              </div>

              {/* Variations Selector */}
              {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                <div className={styles.variationGroup} style={{ marginBottom: '24px' }}>
                  <label className={styles.modalPriceLabel} style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    {t('variations')}
                  </label>
                  <div className={styles.variationsGrid} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      className={`${styles.variationBtn} ${selectedVar === null ? styles.variationBtnActive : ''}`}
                      onClick={() => setSelectedVar(null)}
                      style={{ fontSize: '0.78rem', padding: '8px 16px', borderRadius: '30px' }}
                    >
                      {language === 'tr' ? 'Standart' : 'Standard'}
                    </button>
                    {selectedProduct.variations.map((v) => (
                      <button
                        key={v.id}
                        className={`${styles.variationBtn} ${selectedVar?.id === v.id ? styles.variationBtnActive : ''}`}
                        onClick={() => setSelectedVar(v)}
                        style={{ fontSize: '0.78rem', padding: '8px 16px', borderRadius: '30px' }}
                      >
                        {resolveStr(v, 'name')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.modalFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 'var(--border-gold)', paddingTop: '20px', marginTop: '20px' }}>
                <div>
                  <div className={styles.modalPriceLabel} style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '2px' }}>{t('price')}</div>
                  <div className={styles.modalPrice} style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {selectedProduct.discountPrice && !selectedVar ? (
                      <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={styles.oldPriceCrossed} style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                          {selectedProduct.price.toLocaleString()}
                        </span>
                        <span>
                          {selectedProduct.discountPrice.toLocaleString()} {t('currency')}
                        </span>
                      </span>
                    ) : (
                      <span>
                        {activeProductPrice().toLocaleString()} {t('currency')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {selectedProduct.isAvailable && (
                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        handleCallWaiter();
                        setSelectedProduct(null);
                      }}
                      style={{ fontSize: '0.8rem', padding: '10px 20px' }}
                    >
                      🔔 {t('callWaiter')}
                    </button>
                  )}
                  <button 
                    className="btn-neon" 
                    onClick={handleShare}
                    aria-label="Paylaş"
                    style={{ width: '42px', height: '42px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* BILL REQUEST MODAL */}
      {showBillModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBillModal(false)} role="dialog" aria-modal="true">
          <div className={`${styles.modalContent}`} onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <h2 className="text-gold" style={{ marginBottom: '20px', fontFamily: 'Cinzel, serif' }}>{t('confirmAction')}</h2>
            
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>{t('paymentMethod')}</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button 
                  className={`${styles.variationBtn} ${paymentMethod === 'cash' ? styles.variationBtnActive : ''}`} 
                  onClick={() => setPaymentMethod('cash')}
                  style={{ flex: 1 }}
                >
                  💵 {t('cash')}
                </button>
                <button 
                  className={`${styles.variationBtn} ${paymentMethod === 'card' ? styles.variationBtnActive : ''}`} 
                  onClick={() => setPaymentMethod('card')}
                  style={{ flex: 1 }}
                >
                  💳 {t('creditCard')}
                </button>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
              <label className={styles.formLabel}>{t('tipAmount')} (%)</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {[0, 10, 15, 20].map((pct) => (
                  <button 
                    key={pct}
                    className={`${styles.variationBtn} ${tipPercentage === pct ? styles.variationBtnActive : ''}`} 
                    onClick={() => setTipPercentage(pct)}
                    style={{ flex: 1 }}
                  >
                    %{pct}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formActions} style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-neon" onClick={() => setShowBillModal(false)} style={{ flex: 1, minHeight: '44px' }}>
                {t('cancel')}
              </button>
              <button className="btn-primary" onClick={handleRequestBillSubmit} style={{ flex: 1, minHeight: '44px' }}>
                {t('submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar (iOS Floating Concierge Navigation) */}
      <div className={styles.iosBottomNavBar}>
        <div 
          className={`${styles.tabItemTarget} ${activeTab === 'menu' ? styles.tabItemTargetActive : ''}`} 
          onClick={() => { setActiveTab('menu'); setActiveCategory('all'); }}
        >
          <Home size={18} />
          <span>{language === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
        </div>
        <div 
          className={`${styles.tabItemTarget} ${activeTab === 'cocktails' ? styles.tabItemTargetActive : ''}`} 
          onClick={() => { setActiveTab('cocktails'); setActiveCategory('all'); }}
        >
          <BookOpen size={18} />
          <span>{language === 'tr' ? 'Menü' : 'Menu'}</span>
        </div>
        
        {/* Center Golden Concierge Action Button */}
        <button 
          className={styles.centerConciergeBtn} 
          onClick={handleCallWaiter}
          aria-label={t('callWaiter') || "Call Waiter"}
        >
          <Bell size={20} />
        </button>
        
        <div 
          className={`${styles.tabItemTarget} ${activeTab === 'champagne' ? styles.tabItemTargetActive : ''}`} 
          onClick={() => { setActiveTab('champagne'); setActiveCategory('all'); }}
        >
          <Sparkles size={18} />
          <span>{language === 'tr' ? 'Rezervasyon' : 'Booking'}</span>
        </div>
        <div 
          className={`${styles.tabItemTarget} ${activeTab === 'events' ? styles.tabItemTargetActive : ''}`} 
          onClick={() => { setActiveTab('events'); setActiveCategory('all'); }}
        >
          <User size={18} />
          <span>{language === 'tr' ? 'Profil' : 'Profile'}</span>
        </div>
      </div>
    </div>
  );
}
