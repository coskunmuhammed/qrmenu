'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '@/components/LanguageContext';
import { guestCallWaiter, guestRequestBill } from '@/app/admin/actions';
import styles from '@/styles/menu.module.css';
import {
  Clock, Wine, Award, MessageCircle,
  MapPin, Clock3, Phone, ChevronUp, Sparkles, Flame, Percent
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

export default function MenuView({ business, tableNo }: MenuViewProps) {
  const { language, setLanguage, t, isRtl } = useLanguage();
  
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

  // Safe Multi-language String Resolution Helper
  const resolveStr = (item: any, prefix: string) => {
    const key = `${prefix}_${language}`;
    return item[key] || item[`${prefix}_tr`] || item[`${prefix}_en`] || '';
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
    const phone = business.whatsappNumber || '905300000000';
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

      {/* Brand Branding Header (non-sticky, scrolls away) */}
      <div className={styles.brandHeader}>
        {/* Palm Branch Shadow Overlay */}
        <svg className={styles.palmShadow} viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.045" filter="url(#blur-palm)">
            <path d="M500,0 C420,100 350,150 150,300 C120,320 80,360 0,500" stroke="#000" strokeWidth="8" strokeLinecap="round"/>
            <path d="M420,100 C390,50 350,10 320,0" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M380,120 C330,80 290,40 260,30" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M350,140 C290,100 240,60 210,50" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M310,165 C250,125 190,85 160,75" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M280,185 C210,145 150,105 120,95" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M240,210 C170,170 110,130 80,120" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M200,235 C130,195 70,155 40,145" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M160,260 C90,220 30,180 0,170" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M420,100 C450,150 490,190 500,200" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M380,120 C420,180 450,210 470,230" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M350,140 C380,200 410,235 430,250" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M310,165 C340,225 370,260 390,275" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M280,185 C310,245 335,280 350,295" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M240,210 C270,270 295,305 310,320" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M200,235 C230,295 255,330 270,345" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
            <path d="M160,260 C190,320 215,355 230,370" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
          </g>
          <defs>
            <filter id="blur-palm" x="-50" y="-50" width="600" height="600" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
        </svg>

        <div className={styles.headerTop} style={{ flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {/* Custom SVG Dior Beach Club Logo */}
          <div className={styles.logoContainer}>
            <svg viewBox="0 0 300 110" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
              <style>{`
                .brand-dior {
                  font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif;
                  font-size: 54px;
                  fill: #1D1D1D;
                  letter-spacing: 5px;
                }
                .brand-sub {
                  font-family: 'Inter', 'Manrope', sans-serif;
                  font-size: 11px;
                  fill: #6D6D6D;
                  letter-spacing: 5px;
                  font-weight: 500;
                }
                .wave-line {
                  stroke: #1D1D1D;
                  stroke-width: 1.8;
                  fill: none;
                  stroke-linecap: round;
                }
              `}</style>
              <g transform="translate(150, 50)" textAnchor="middle">
                <text x="-48" y="5" className="brand-dior" textAnchor="middle">DI</text>
                <g transform="translate(0, -12)">
                  <circle cx="0" cy="0" r="23" stroke="#1D1D1D" strokeWidth="4.5" fill="none" />
                  <path d="M-15,4 Q-7,0 0,4 T15,4" className="wave-line" />
                  <path d="M-13,-2 Q-6.5,-5 0,-2 T13,-2" className="wave-line" />
                </g>
                <text x="48" y="5" className="brand-dior" textAnchor="middle">R</text>
                <text x="0" y="38" className="brand-sub" textAnchor="middle">BEACH CLUB</text>
                <line x1="-105" y1="34" x2="-62" y2="34" stroke="#6D6D6D" strokeWidth="0.8" />
                <line x1="62" y1="34" x2="105" y2="34" stroke="#6D6D6D" strokeWidth="0.8" />
              </g>
            </svg>
          </div>

          <p className={styles.clubSubtitle} style={{ textAlign: 'center', maxWidth: '380px', margin: '0 auto', fontSize: '0.85rem' }}>
            {resolveStr(business, 'description')}
          </p>

          {/* Multi Language Select Dropdown */}
          <div className={styles.langSelectorContainer} style={{ marginTop: '8px' }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className={styles.langDropdown}
              aria-label="Dil Seçimi / Select Language"
            >
              <option value="tr">TR</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
              <option value="de">DE</option>
              <option value="ar">AR</option>
            </select>
          </div>
        </div>

        {/* Quick Contact rows (Hours, Maps, Instagram) */}
        <div className={styles.headerContactInfo} style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '12px 18px', marginTop: '16px' }}>
          <span className={styles.contactItem} style={{ fontStyle: 'normal' }}>
            📍 Didim / Altınkum
          </span>
          {business.instagramUsername && (
            <a href={`https://instagram.com/${business.instagramUsername}`} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              📷 Instagram
            </a>
          )}
          {business.googleMapsUrl && (
            <a href={business.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              🗺 {language === 'tr' ? 'Yol Tarifi' : 'Directions'}
            </a>
          )}
          {business.whatsappNumber && (
            <a href={`tel:${business.whatsappNumber}`} className={styles.contactItem}>
              📞 {language === 'tr' ? 'Telefon' : 'Phone'}
            </a>
          )}
          {business.openingHours && (
            <span className={styles.contactItem}>
              🕒 {business.openingHours}
            </span>
          )}
        </div>
      </div>

      {/* Sticky Navigation & Category Bar */}
      <header className={styles.stickyHeader}>
        {/* Table Operations Widget */}
        {tableNo && (
          <div className={`${styles.tableWidget} glass-gold`}>
            <span>📍 {t('table')}: <strong>{tableNo}</strong></span>
            <div className={styles.tableWidgetButtons}>
              <button className={styles.widgetBtn} onClick={handleCallWaiter}>
                🔔 {t('callWaiter')}
              </button>
              <button className={`${styles.widgetBtn} ${styles.widgetBtnGold}`} onClick={() => setShowBillModal(true)}>
                💵 {t('requestBill')}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className={styles.navTabs} style={{ overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
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

        {/* Search & Categories Bar */}
        {activeTab !== 'events' && (
          <div className={styles.subHeader}>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label={t('searchPlaceholder')}
              />
              {searchQuery && (
                <button className={styles.searchClear} onClick={() => setSearchQuery('')} aria-label="Temizle">×</button>
              )}
            </div>

            {searchQuery === '' && (
              <div className={styles.categoriesSlider} ref={categoryMenuRef}>
                <button 
                  id="tab-all"
                  className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.categoryTabActive : ''}`}
                  onClick={() => scrollToCategory('all')}
                >
                  {t('all')}
                </button>
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    id={`tab-${cat.id}`}
                    className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.categoryTabActive : ''}`}
                    onClick={() => scrollToCategory(cat.id)}
                  >
                    {resolveStr(cat, 'name')} ({cat.products.length})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className={styles.content}>
        
        {/* TAB 1: MENU */}
        {activeTab !== 'events' && (
          <div className={styles.menuTabContent}>
            {loading ? (
              // Shimmer skeletons placeholders during mount latency
              <div className={styles.productsGrid}>
                {Array(6).fill(0).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize: '3rem' }}>🔍</div>
                <p>{t('emptySearch')}</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <section 
                  key={category.id} 
                  ref={(el) => { categoryRefs.current[category.id] = el; }}
                  className={styles.categorySection}
                >
                  <h2 className={styles.categoryTitle}>
                    <span>
                      {resolveStr(category, 'name')} ({category.products.length})
                    </span>
                  </h2>

                  <div className={styles.productsGrid}>
                    {category.products.map((product) => (
                      <div 
                        key={product.id}
                        className={`${styles.productCard} ${!product.isAvailable ? styles.unavailable : ''}`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.imageUrl && (
                          <div className={styles.productImageWrapper}>
                            <img 
                              src={product.imageUrl} 
                              alt={resolveStr(product, 'name')}
                              className={styles.productImage}
                              loading="lazy"
                            />
                            {!product.isAvailable && (
                              <div className={styles.outOfStockBadge}>{t('outOfStock')}</div>
                            )}
                          </div>
                        )}
                        
                        <div className={styles.productInfo}>
                          <div className={styles.productNameRow}>
                            <h3 className={styles.productName}>
                              {resolveStr(product, 'name')}
                            </h3>
                          </div>
                          
                          {getProductTags(product).length > 0 && (
                            <div className={styles.badgeContainer} style={{ marginBottom: '6px' }}>
                              {getProductTags(product).map((tag, idx) => (
                                <span key={idx} className={tag.class}>
                                  {tag.icon} {tag.label}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <p className={styles.productDescription}>
                            {resolveStr(product, 'description')}
                          </p>

                          <div className={styles.productFooter}>
                            {/* Icons details row */}
                            <div className={styles.productAttributes}>
                              {product.volume && (
                                <span className={styles.contactItem}>
                                  <Wine size={10} /> {product.volume}
                                </span>
                              )}
                              {product.alcoholRatio && (
                                <span className={styles.contactItem}>
                                  <Wine size={10} /> %{product.alcoholRatio}
                                </span>
                              )}
                            </div>

                            <span className={styles.productPrice}>
                              {product.discountPrice ? (
                                <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <span className={styles.oldPricePreview}>
                                    {product.price.toLocaleString()}
                                  </span>
                                  <span>
                                    {product.discountPrice.toLocaleString()} {t('currency')}
                                  </span>
                                </span>
                              ) : (
                                <span>
                                  {product.price.toLocaleString()} {t('currency')}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}

            {/* VIP Info Card */}
            {business.vipMinSpendInfo && (
              <div className={`${styles.vipCard} animate-pulse-gold`}>
                <h3 className="text-gold">👑 VIP SERVICE</h3>
                <p>{business.vipMinSpendInfo}</p>
              </div>
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
      </main>

      {/* Footer Contact Info */}
      <footer className={styles.footer}>
        <div className={styles.footerDivider}></div>
        <p className={styles.footerTagline}>{business.name}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '24px', fontFamily: 'var(--font-body)', letterSpacing: '0.02em', lineHeight: '1.5' }}>
          {business.openingHours && (
            <p>🕒 {language === 'tr' ? 'Çalışma Saatleri' : 'Opening Hours'}: {business.openingHours}</p>
          )}
          {business.whatsappNumber && (
            <p>📞 {language === 'tr' ? 'Telefon' : 'Phone'}: <a href={`tel:${business.whatsappNumber}`} style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>+{business.whatsappNumber}</a></p>
          )}
          {business.googleMapsUrl && (
            <p>📍 {resolveStr(business, 'description') ? resolveStr(business, 'description').split('.')[0] : ''}</p>
          )}
        </div>
        
        <div className={styles.footerLinks}>
          {business.instagramUsername && (
            <a 
              href={`https://instagram.com/${business.instagramUsername}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.footerLink} glass`}
            >
              📷 Instagram
            </a>
          )}
          {business.googleMapsUrl && (
            <a 
              href={business.googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.footerLink} glass`}
            >
              📍 {t('location')}
            </a>
          )}
        </div>
        <p className={styles.copyright}>&copy; 2026 {business.name}. All Rights Reserved.</p>
      </footer>

      {/* Expandable FAB communication triggers */}
      <div className={styles.fabContainer}>
        <div className={`${styles.fabMenu} ${fabOpen ? styles.fabMenuOpen : ''}`}>
          {business.whatsappNumber && (
            <a 
              href={getWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fabItem}
              aria-label={t('whatsappReserve')}
            >
              <MessageCircle size={20} />
              <span className={styles.fabLabel}>{t('whatsappReserve')}</span>
            </a>
          )}
          {business.instagramUsername && (
            <a 
              href={`https://instagram.com/${business.instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fabItem}
              aria-label="Instagram"
            >
              <InstagramIcon size={20} />
              <span className={styles.fabLabel}>Instagram</span>
            </a>
          )}
          {business.whatsappNumber && (
            <a 
              href={`tel:${business.whatsappNumber}`}
              className={styles.fabItem}
              aria-label="Telefon"
            >
              <Phone size={20} />
              <span className={styles.fabLabel}>Telefon</span>
            </a>
          )}
        </div>
        <button 
          className={`${styles.fabToggle} ${fabOpen ? styles.fabToggleActive : ''}`}
          onClick={() => setFabOpen(!fabOpen)}
          aria-expanded={fabOpen}
          aria-label="Menü İletişim Butonları"
        >
          <ChevronUp size={24} style={{ transform: fabOpen ? 'rotate(180deg)' : 'none', transition: 'all 0.3s' }} />
        </button>
      </div>

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

      {/* POPUP DETAIL MODAL */}
      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)} role="dialog" aria-modal="true">
          <div 
            className={`${styles.modalContent}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.modalClose} 
              onClick={() => setSelectedProduct(null)}
              aria-label="Kapat"
            >
              ×
            </button>

            {selectedProduct.imageUrl && (
              <div className={styles.modalImageWrapper}>
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={resolveStr(selectedProduct, 'name')} 
                  className={styles.modalImage}
                />
              </div>
            )}

            <div className={styles.modalDetails}>
              <div className={styles.modalHeaderRow}>
                <h2>
                  {resolveStr(selectedProduct, 'name')}
                </h2>
                <div className={styles.badgeContainer}>
                  {getProductTags(selectedProduct).map((tag, idx) => (
                    <span key={idx} className={tag.class}>
                      {tag.icon} {tag.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.modalAvailability}>
                <span className={selectedProduct.isAvailable ? styles.statusAvailable : styles.statusUnavailable}>
                  {selectedProduct.isAvailable ? `● ${t('inStock')}` : `● ${t('outOfStock')}`}
                </span>
              </div>

              <p className={styles.modalDescription}>
                {resolveStr(selectedProduct, 'description')}
              </p>

              {/* Advanced info panel */}
              {(selectedProduct.ingredients || selectedProduct.volume || selectedProduct.alcoholRatio) && (
                <div className={styles.ingredientsPanel}>
                  {selectedProduct.volume && <p><Wine size={12} /> <strong>{t('volume')}:</strong> {selectedProduct.volume}</p>}
                  {selectedProduct.alcoholRatio && <p><Wine size={12} /> <strong>{t('alcohol')}:</strong> %{selectedProduct.alcoholRatio}</p>}
                  {selectedProduct.ingredients && <p><Award size={12} /> <strong>{t('ingredients')}:</strong> {selectedProduct.ingredients}</p>}
                </div>
              )}

              {/* Variations Selector */}
              {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                <div className={styles.variationGroup}>
                  <label className={styles.modalPriceLabel} style={{ display: 'block', marginBottom: '8px' }}>
                    {t('variations')}
                  </label>
                  <div className={styles.variationsGrid}>
                    <button 
                      className={`${styles.variationBtn} ${selectedVar === null ? styles.variationBtnActive : ''}`}
                      onClick={() => setSelectedVar(null)}
                    >
                      {language === 'tr' ? 'Standart' : 'Standard'}
                    </button>
                    {selectedProduct.variations.map((v) => (
                      <button
                        key={v.id}
                        className={`${styles.variationBtn} ${selectedVar?.id === v.id ? styles.variationBtnActive : ''}`}
                        onClick={() => setSelectedVar(v)}
                      >
                        {resolveStr(v, 'name')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <div className={styles.modalPriceLabel}>{t('price')}</div>
                <div className={styles.modalPrice}>
                  {selectedProduct.discountPrice && !selectedVar ? (
                    <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={styles.oldPriceCrossed}>
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
            </div>
          </div>
        </div>
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
    </div>
  );
}
