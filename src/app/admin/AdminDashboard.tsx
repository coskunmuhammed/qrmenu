'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, Edit3, Save, CheckCircle, Clock,
  FileText, Settings, BarChart2, Folder, Image, Shield
} from 'lucide-react';
import styles from '@/styles/admin.module.css';
import {
  createCategory, updateCategory, deleteCategory,
  createProduct, updateProduct, deleteProduct,
  createVariation, deleteVariation,
  createCampaign, updateCampaign, deleteCampaign,
  createEvent, updateEvent, deleteEvent,
  updateBusinessSettings, getTablesWithRequests, resolveTableRequest,
  addTable, deleteTable, getAnalyticsSummary, getLoginActivityLogs
} from './actions';

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
  categoryId: string;
  category?: { name_tr: string };
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
  order: number;
  variations: ProductVariation[];
}

interface Category {
  id: string;
  name_tr: string;
  name_en: string;
  name_ru: string | null;
  name_de: string | null;
  name_ar: string | null;
  order: number;
  isActive: boolean;
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
  startDate: string | null;
  endDate: string | null;
  order: number;
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

interface TableRequest {
  id: string;
  type: string;
  status: string;
  details: string | null;
  createdAt: string;
}

interface Table {
  id: string;
  tableNo: string;
  status: string;
  requests: TableRequest[];
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
  categories?: Category[];
  campaigns?: Campaign[];
  events?: Event[];
}

interface UserSession {
  userId: string;
  username: string;
  role: string;
  businessId: string | null;
}

interface AdminDashboardProps {
  initialBusiness: Business;
  initialProducts: Product[];
  userSession: UserSession;
}

const IMAGE_PRESETS = [
  { name: 'Cocktail', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mojito', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Whiskey', url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&auto=format&fit=crop&q=80' },
  { name: 'Champagne', url: 'https://images.unsplash.com/photo-1594487430660-39cabd332eff?w=600&auto=format&fit=crop&q=80' },
  { name: 'Lounge', url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600&auto=format&fit=crop&q=80' },
];

export default function AdminDashboard({
  initialBusiness,
  initialProducts,
  userSession,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<'products' | 'categories' | 'tables' | 'campaigns' | 'events' | 'analytics' | 'logs' | 'settings'>('products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Scoped states
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [categories, setCategories] = useState<Category[]>(initialBusiness.categories as any || []);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialBusiness.campaigns as any || []);
  const [events, setEvents] = useState<Event[]>(initialBusiness.events as any || []);
  
  // Table monitoring states
  const [tables, setTables] = useState<Table[]>([]);
  const [newTableNo, setNewTableNo] = useState('');

  // Analytics states
  const [analytics, setAnalytics] = useState<any>(null);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);

  // Status & Progress states
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form Sub-languages selector
  const [formLang, setFormLang] = useState<'tr' | 'en' | 'ru' | 'de' | 'ar'>('tr');

  // Edit / Add Form States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // New variation form helper
  const [newVar, setNewVar] = useState({ productId: '', name_tr: '', name_en: '', price: 0 });

  const [newCategory, setNewCategory] = useState({
    name_tr: '', name_en: '', name_ru: '', name_de: '', name_ar: '', order: 0, isActive: true
  });

  const [newProduct, setNewProduct] = useState({
    categoryId: '', name_tr: '', name_en: '', name_ru: '', name_de: '', name_ar: '',
    description_tr: '', description_en: '', description_ru: '', description_de: '', description_ar: '',
    price: 0, discountPrice: null as number | null, currency: 'TRY', imageUrl: '', isPopular: false, isNew: false,
    isRecommended: false, isAvailable: true, isActive: true, alcoholRatio: null as number | null, ingredients: '',
    volume: '', order: 0
  });

  const [newCampaign, setNewCampaign] = useState({
    title_tr: '', title_en: '', title_ru: '', title_de: '', title_ar: '',
    description_tr: '', description_en: '', description_ru: '', description_de: '', description_ar: '',
    imageUrl: '', isActive: true, startDate: '', endDate: '', order: 0
  });

  const [newEvent, setNewEvent] = useState({
    title_tr: '', title_en: '', title_ru: '', title_de: '', title_ar: '',
    djName: '', date: '', description_tr: '', description_en: '', description_ru: '',
    description_de: '', description_ar: '', imageUrl: '', isActive: true
  });

  const [settingsForm, setSettingsForm] = useState({
    name: business.name || '',
    description_tr: business.description_tr || '',
    description_en: business.description_en || '',
    description_ru: business.description_ru || '',
    description_de: business.description_de || '',
    description_ar: business.description_ar || '',
    whatsappNumber: business.whatsappNumber || '',
    instagramUsername: business.instagramUsername || '',
    googleMapsUrl: business.googleMapsUrl || '',
    vipMinSpendInfo: business.vipMinSpendInfo || '',
    openingHours: business.openingHours || '',
    themeName: business.themeName || 'luxury-gold',
    showHighlightPopup: business.showHighlightPopup || false,
    highlightTitle: business.highlightTitle || '',
    highlightProductId: business.highlightProductId || '',
    highlightDiscountText: business.highlightDiscountText || '',
    highlightValidUntil: business.highlightValidUntil || '',
    coverUrl: business.coverUrl || '',
  });

  // Pull dynamic tables and requests on load or menu swap
  useEffect(() => {
    if (activeMenu === 'tables') {
      loadTables();
    } else if (activeMenu === 'analytics') {
      loadAnalytics();
    } else if (activeMenu === 'logs') {
      loadLoginLogs();
    }
  }, [activeMenu]);

  const loadTables = async () => {
    try {
      const data = await getTablesWithRequests();
      setTables(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLoginLogs = async () => {
    try {
      const data = await getLoginActivityLogs();
      setLoginLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const showStatus = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  /* =========================================================================
     DRAG & DROP / FILE UPLOAD HANDLER
     ========================================================================= */
  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      let uploadBlob: Blob = file;
      if (file.type.startsWith('image/')) {
        try {
          uploadBlob = await compressImage(file);
        } catch (compressErr) {
          console.warn('Client-side compression failed, using original:', compressErr);
        }
      }

      const formData = new FormData();
      formData.append('file', uploadBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Dosya yüklenemedi.');

      // Update correct image field in form
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, imageUrl: data.url });
      } else if (activeMenu === 'products') {
        setNewProduct({ ...newProduct, imageUrl: data.url });
      }

      if (editingCampaign) {
        setEditingCampaign({ ...editingCampaign, imageUrl: data.url });
      } else if (activeMenu === 'campaigns') {
        setNewCampaign({ ...newCampaign, imageUrl: data.url });
      }

      if (editingEvent) {
        setEditingEvent({ ...editingEvent, imageUrl: data.url });
      } else if (activeMenu === 'events') {
        setNewEvent({ ...newEvent, imageUrl: data.url });
      }

      showStatus('Dosya başarıyla yüklendi.', 'success');
      alert('Görsel başarıyla yüklendi! Görsel metin kutusuna eklendi.');
    } catch (err: any) {
      showStatus(err.message, 'error');
      alert('Hata: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================================
     CATEGORY HANDLERS
     ========================================================================= */
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, editingCategory);
        setCategories(categories.map((c) => (c.id === updated.id ? updated : c)));
        setEditingCategory(null);
        showStatus('Kategori güncellendi.', 'success');
      } else {
        const created = await createCategory(newCategory);
        setCategories([...categories, created].sort((a, b) => a.order - b.order));
        setNewCategory({ name_tr: '', name_en: '', name_ru: '', name_de: '', name_ar: '', order: 0, isActive: true });
        showStatus('Kategori eklendi.', 'success');
      }
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      setProducts(products.filter((p) => p.categoryId !== id));
      showStatus('Kategori silindi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     PRODUCT CRUD HANDLERS
     ========================================================================= */
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const catId = editingProduct ? editingProduct.categoryId : (newProduct.categoryId || categories[0]?.id);
    if (!catId) {
      showStatus('Lütfen önce bir kategori oluşturun.', 'error');
      setLoading(false);
      return;
    }

    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, {
          ...editingProduct,
          categoryId: catId,
          discountPrice: editingProduct.discountPrice ? Number(editingProduct.discountPrice) : null,
          alcoholRatio: editingProduct.alcoholRatio ? Number(editingProduct.alcoholRatio) : null,
          description_tr: editingProduct.description_tr || '',
          description_en: editingProduct.description_en || '',
          description_ru: editingProduct.description_ru || '',
          description_de: editingProduct.description_de || '',
          description_ar: editingProduct.description_ar || '',
          imageUrl: editingProduct.imageUrl || '/images/placeholders/product-placeholder.jpg',
        });

        const categoryObj = categories.find((c) => c.id === catId);
        const updatedWithCategory = {
          ...updated,
          category: categoryObj ? { name_tr: categoryObj.name_tr } : undefined,
          variations: editingProduct.variations || [],
        };

        setProducts(products.map((p) => (p.id === updated.id ? updatedWithCategory : p)));
        setEditingProduct(null);
        showStatus('Ürün güncellendi.', 'success');
        alert('Ürün başarıyla güncellendi!');
      } else {
        const created = await createProduct({
          ...newProduct,
          categoryId: catId,
          imageUrl: newProduct.imageUrl || '/images/placeholders/product-placeholder.jpg',
        });

        const categoryObj = categories.find((c) => c.id === catId);
        const createdWithCategory = {
          ...created,
          category: categoryObj ? { name_tr: categoryObj.name_tr } : undefined,
          variations: [],
        };

        setProducts([...products, createdWithCategory].sort((a, b) => a.order - b.order));
        setNewProduct({
          categoryId: categories[0]?.id || '', name_tr: '', name_en: '', name_ru: '', name_de: '', name_ar: '',
          description_tr: '', description_en: '', description_ru: '', description_de: '', description_ar: '',
          price: 0, discountPrice: null, currency: 'TRY', imageUrl: '', isPopular: false, isNew: false,
          isRecommended: false, isAvailable: true, isActive: true, alcoholRatio: null, ingredients: '',
          volume: '', order: 0
        });
        showStatus('Ürün eklendi.', 'success');
        alert('Ürün başarıyla eklendi!');
      }
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showStatus('Ürün silindi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     VARIATION ACTION HANDLERS
     ========================================================================= */
  const handleAddVariationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVar.productId || !newVar.name_tr || !newVar.price) return;
    setLoading(true);

    try {
      const created = await createVariation({
        productId: newVar.productId,
        name_tr: newVar.name_tr,
        name_en: newVar.name_en || newVar.name_tr,
        name_ru: newVar.name_tr,
        name_de: newVar.name_tr,
        name_ar: newVar.name_tr,
        price: newVar.price,
      });

      // Update product list local state
      setProducts(products.map((p) => {
        if (p.id === newVar.productId) {
          return {
            ...p,
            variations: [...(p.variations || []), created],
          };
        }
        return p;
      }));

      // Update editing view variations list if active
      if (editingProduct && editingProduct.id === newVar.productId) {
        setEditingProduct({
          ...editingProduct,
          variations: [...(editingProduct.variations || []), created],
        });
      }

      setNewVar({ productId: '', name_tr: '', name_en: '', price: 0 });
      showStatus('Seçenek/Varyasyon başarıyla eklendi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVar = async (varId: string, prodId: string) => {
    if (!window.confirm('Bu varyasyonu silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteVariation(varId);
      
      setProducts(products.map((p) => {
        if (p.id === prodId) {
          return {
            ...p,
            variations: p.variations.filter((v) => v.id !== varId),
          };
        }
        return p;
      }));

      if (editingProduct && editingProduct.id === prodId) {
        setEditingProduct({
          ...editingProduct,
          variations: editingProduct.variations.filter((v) => v.id !== varId),
        });
      }

      showStatus('Varyasyon silindi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     TABLE ACTION HANDLERS
     ========================================================================= */
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNo) return;
    setLoading(true);
    try {
      const created = await addTable(newTableNo);
      setTables([...tables, { ...created, requests: [] }]);
      setNewTableNo('');
      showStatus('Masa eklendi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm('Bu masayı silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteTable(id);
      setTables(tables.filter((t) => t.id !== id));
      showStatus('Masa silindi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRequest = async (requestId: string) => {
    try {
      await resolveTableRequest(requestId);
      // Reload tables to get updated request status list
      loadTables();
      showStatus('Talep çözüldü olarak işaretlendi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  /* =========================================================================
     CAMPAIGN ACTIONS
     ========================================================================= */
  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCampaign) {
        const updated = await updateCampaign(editingCampaign.id, {
          ...editingCampaign,
          description_tr: editingCampaign.description_tr || '',
          description_en: editingCampaign.description_en || '',
          imageUrl: editingCampaign.imageUrl || '',
        });
        setCampaigns(campaigns.map((c) => (c.id === updated.id ? updated : c)));
        setEditingCampaign(null);
        showStatus('Kampanya güncellendi.', 'success');
      } else {
        const created = await createCampaign(newCampaign);
        setCampaigns([...campaigns, created].sort((a, b) => a.order - b.order));
        setNewCampaign({
          title_tr: '', title_en: '', title_ru: '', title_de: '', title_ar: '',
          description_tr: '', description_en: '', description_ru: '', description_de: '', description_ar: '',
          imageUrl: '', isActive: true, startDate: '', endDate: '', order: 0
        });
        showStatus('Kampanya eklendi.', 'success');
      }
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignDelete = async (id: string) => {
    if (!window.confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteCampaign(id);
      setCampaigns(campaigns.filter((c) => c.id !== id));
      showStatus('Kampanya silindi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     EVENT ACTIONS
     ========================================================================= */
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventData = editingEvent ? editingEvent : newEvent;
      if (!eventData.date) {
        showStatus('Lütfen bir tarih seçin.', 'error');
        setLoading(false);
        return;
      }

      if (editingEvent) {
        const updated = await updateEvent(editingEvent.id, {
          ...editingEvent,
          djName: editingEvent.djName || '',
          description_tr: editingEvent.description_tr || '',
          description_en: editingEvent.description_en || '',
          imageUrl: editingEvent.imageUrl || '',
        });
        setEvents(events.map((ev) => (ev.id === updated.id ? updated : ev)));
        setEditingEvent(null);
        showStatus('Etkinlik güncellendi.', 'success');
      } else {
        const created = await createEvent(newEvent);
        setEvents([...events, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setNewEvent({
          title_tr: '', title_en: '', title_ru: '', title_de: '', title_ar: '',
          djName: '', date: '', description_tr: '', description_en: '', description_ru: '',
          description_de: '', description_ar: '', imageUrl: '', isActive: true
        });
        showStatus('Etkinlik eklendi.', 'success');
      }
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEventDelete = async (id: string) => {
    if (!window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteEvent(id);
      setEvents(events.filter((ev) => ev.id !== id));
      showStatus('Etkinlik silindi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCoversList = (): string[] => {
    if (!settingsForm.coverUrl) return [];
    if (settingsForm.coverUrl.startsWith('[')) {
      try {
        return JSON.parse(settingsForm.coverUrl);
      } catch (e) {
        return [];
      }
    }
    return [settingsForm.coverUrl];
  };

  const handleAddCoverUrl = (url: string) => {
    const list = getCoversList();
    if (!list.includes(url)) {
      const newList = [...list, url];
      setSettingsForm({ ...settingsForm, coverUrl: JSON.stringify(newList) });
    }
  };

  const handleRemoveCoverUrl = (idx: number) => {
    const list = getCoversList();
    const newList = list.filter((_, i) => i !== idx);
    setSettingsForm({ ...settingsForm, coverUrl: JSON.stringify(newList) });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        handleAddCoverUrl(data.url);
        showStatus('Görsel başarıyla yüklendi.', 'success');
      } else {
        showStatus('Yükleme başarısız oldu.', 'error');
      }
    } catch (err) {
      showStatus('Yükleme hatası oluştu.', 'error');
    }
  };

  /* =========================================================================
     BUSINESS SETTINGS ACTION
     ========================================================================= */
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateBusinessSettings(settingsForm);
      setBusiness({
        ...business,
        ...updated,
      });
      showStatus('İşletme ayarları güncellendi.', 'success');
    } catch (err: any) {
      showStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMenuUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/menu/${business.slug}`;
  };

  const getQrCodeUrl = () => {
    const liveMenuUrl = getMenuUrl();
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(liveMenuUrl)}`;
  };

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className={styles.mobileAdminNav}>
        <button className={styles.hamburgerBtn} onClick={() => setMobileMenuOpen(true)}>
          ☰
        </button>
        <h3 className="text-gold" style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', margin: 0 }}>
          {business.name}
        </h3>
        <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
          🚪
        </button>
      </div>

      {/* Sidebar overlay backdrop for closing the drawer on outside tap */}
      {mobileMenuOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className={styles.dashboardContainer}>
        {/* SIDEBAR */}
        <aside className={`${styles.dashboardSidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h2 className="text-gold">CRYSTAL VIP SaaS</h2>
            <p>Yönetici Paneli | {userSession.username}</p>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.sidebarLink} ${activeMenu === 'products' ? styles.sidebarLinkActive : ''}`}
              onClick={() => { setActiveMenu('products'); setMobileMenuOpen(false); }}
            >
              🍹 Ürünler ({products.length})
            </button>
            
            <button
              className={`${styles.sidebarLink} ${activeMenu === 'categories' ? styles.sidebarLinkActive : ''}`}
              onClick={() => { setActiveMenu('categories'); setMobileMenuOpen(false); }}
            >
              📁 Kategoriler ({categories.length})
            </button>

            <button
              className={`${styles.sidebarLink} ${activeMenu === 'tables' ? styles.sidebarLinkActive : ''}`}
              onClick={() => { setActiveMenu('tables'); setMobileMenuOpen(false); }}
            >
              📍 Masalar & Talepler
            </button>

            <button
              className={`${styles.sidebarLink} ${activeMenu === 'campaigns' ? styles.sidebarLinkActive : ''}`}
              onClick={() => { setActiveMenu('campaigns'); setMobileMenuOpen(false); }}
            >
              🔥 Kampanyalar ({campaigns.length})
            </button>

            <button
              className={`${styles.sidebarLink} ${activeMenu === 'events' ? styles.sidebarLinkActive : ''}`}
              onClick={() => { setActiveMenu('events'); setMobileMenuOpen(false); }}
            >
              📅 Etkinlikler ({events.length})
            </button>

            <button
              className={`${styles.sidebarLink} ${activeMenu === 'analytics' ? styles.sidebarLinkActive : ''}`}
              onClick={() => { setActiveMenu('analytics'); setMobileMenuOpen(false); }}
            >
              📈 İstatistikler
            </button>

            <button
              className={`${styles.sidebarLink} ${activeMenu === 'logs' ? styles.sidebarLinkActive : ''}`}
              onClick={() => { setActiveMenu('logs'); setMobileMenuOpen(false); }}
            >
              🛡️ Güvenlik Logları
            </button>

            <button
              className={`${styles.sidebarLink} ${activeMenu === 'settings' ? styles.sidebarLinkActive : ''}`}
              onClick={() => { setActiveMenu('settings'); setMobileMenuOpen(false); }}
            >
              ⚙️ Ayarlar & QR
            </button>
          </nav>

          <button onClick={handleLogout} className={styles.logoutButton}>
            🚪 Çıkış Yap
          </button>
        </aside>

        {/* WORKSPACE */}
        <main className={styles.dashboardContent}>
        
        {/* Toast Notification Alert */}
        {message && (
          <div 
            className={message.type === 'success' ? 'badgeActive' : 'badgePassive'}
            style={{ padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'inline-block', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            {message.text}
          </div>
        )}

        {/* 1. PRODUCTS VIEW */}
        {activeMenu === 'products' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className="text-gold">Menü Ürün Yönetimi</h2>
            </div>

            {/* FORM */}
            <form onSubmit={handleProductSubmit} className={styles.dataForm}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className="text-gold">
                  {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                
                {/* Form Language Subtabs */}
                <div className="lang-switch">
                  {(['tr', 'en', 'ru', 'de', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`lang-btn ${formLang === lang ? 'active' : ''}`}
                      onClick={() => setFormLang(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input fields dynamically filtered based on active formLang subtab */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kategori</label>
                  <select
                    className={styles.formSelect}
                    value={editingProduct ? editingProduct.categoryId : newProduct.categoryId}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, categoryId: e.target.value });
                      else setNewProduct({ ...newProduct, categoryId: e.target.value });
                    }}
                  >
                    <option value="">Seçiniz...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_tr}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ürün Adı ({formLang.toUpperCase()})</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={
                      editingProduct
                        ? (editingProduct as any)[`name_${formLang}`] || ''
                        : (newProduct as any)[`name_${formLang}`] || ''
                    }
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, [`name_${formLang}`]: e.target.value });
                      else setNewProduct({ ...newProduct, [`name_${formLang}`]: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fiyat (Taban)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.formInput}
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 });
                      else setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 });
                    }}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>İndirimli Fiyat (Promosyon)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.formInput}
                    placeholder="Yok"
                    value={
                      editingProduct
                        ? editingProduct.discountPrice || ''
                        : newProduct.discountPrice || ''
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || null;
                      if (editingProduct) setEditingProduct({ ...editingProduct, discountPrice: val });
                      else setNewProduct({ ...newProduct, discountPrice: val });
                    }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Para Birimi</label>
                  <select
                    className={styles.formSelect}
                    value={editingProduct ? editingProduct.currency : newProduct.currency}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, currency: e.target.value });
                      else setNewProduct({ ...newProduct, currency: e.target.value });
                    }}
                  >
                    <option value="TRY">TL</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Attributes */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hacim (e.g. 70cl, 330ml)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. 70cl"
                    value={editingProduct ? (editingProduct.volume || '') : newProduct.volume}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, volume: e.target.value });
                      else setNewProduct({ ...newProduct, volume: e.target.value });
                    }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Alkol Oranı (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className={styles.formInput}
                    placeholder="e.g. 40"
                    value={
                      editingProduct
                        ? editingProduct.alcoholRatio || ''
                        : newProduct.alcoholRatio || ''
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || null;
                      if (editingProduct) setEditingProduct({ ...editingProduct, alcoholRatio: val });
                      else setNewProduct({ ...newProduct, alcoholRatio: val });
                    }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>İçindekiler / Materyaller ({formLang.toUpperCase()})</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Tonik, Cin, Limon dilimi"
                    value={
                      editingProduct
                        ? editingProduct.ingredients || ''
                        : newProduct.ingredients || ''
                    }
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, ingredients: e.target.value });
                      else setNewProduct({ ...newProduct, ingredients: e.target.value });
                    }}
                  />
                </div>
              </div>

              {/* Image Cloud Upload Component */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Ürün Görseli (Dosya Yükle veya Link Girin)
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className={styles.formInput}
                      style={{ flex: 1 }}
                      placeholder="https://images.unsplash.com/..."
                      value={editingProduct ? (editingProduct.imageUrl || '') : newProduct.imageUrl}
                      onChange={(e) => {
                        if (editingProduct) setEditingProduct({ ...editingProduct, imageUrl: e.target.value });
                        else setNewProduct({ ...newProduct, imageUrl: e.target.value });
                      }}
                    />
                    
                    {/* Drag & Drop File Picker fallback */}
                    <label className="btn-neon" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 14px', fontSize: '0.8rem' }}>
                      {uploading ? 'Yükleniyor...' : '📁 Dosya Seç'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Presets Grid */}
              <div style={{ marginBottom: '20px' }}>
                <span className={styles.formLabel} style={{ display: 'inline-block', marginRight: '10px' }}>Hazır Şablon Görseller:</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className={styles.btnAction}
                      style={{ border: '1px solid var(--border-glass)' }}
                      onClick={() => {
                        if (editingProduct) setEditingProduct({ ...editingProduct, imageUrl: preset.url });
                        else setNewProduct({ ...newProduct, imageUrl: preset.url });
                      }}
                    >
                      🖼️ {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Preview Block */}
              <div style={{ marginBottom: '20px', padding: '12px', border: '1px solid var(--border-glass)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                <span className={styles.formLabel} style={{ display: 'block', marginBottom: '8px' }}>Görsel Önizleme:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.3)', flexShrink: 0 }}>
                    <img
                      src={
                        (() => {
                          const currentUrl = editingProduct ? editingProduct.imageUrl : newProduct.imageUrl;
                          if (!currentUrl) return '/images/placeholders/product-placeholder.jpg';
                          if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://') || currentUrl.startsWith('/') || currentUrl.startsWith('data:')) {
                            return currentUrl;
                          }
                          return `/images/products/${currentUrl}`;
                        })()
                      }
                      alt="Önizleme"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholders/product-placeholder.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block' }}>
                      {(() => {
                        const currentUrl = editingProduct ? editingProduct.imageUrl : newProduct.imageUrl;
                        if (!currentUrl) return '⚠️ Görsel tanımlanmamış. Varsayılan premium placeholder gösterilecek.';
                        if (currentUrl.length > 50) return `Yol: ${currentUrl.substring(0, 47)}...`;
                        return `Yol: ${currentUrl}`;
                      })()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#bd00ff', display: 'block', marginTop: '4px' }}>
                      * Kırık veya yüklenmeyen görseller otomatik olarak şampanya renkli Dior temalı önizlemeye düşecektir.
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Açıklama ({formLang.toUpperCase()})</label>
                  <textarea
                    className={styles.formTextarea}
                    value={
                      editingProduct
                        ? (editingProduct as any)[`description_${formLang}`] || ''
                        : (newProduct as any)[`description_${formLang}`] || ''
                    }
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, [`description_${formLang}`]: e.target.value });
                      else setNewProduct({ ...newProduct, [`description_${formLang}`]: e.target.value });
                    }}
                  />
                </div>
              </div>

              {/* Status and Sort settings */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <label className={styles.formCheckboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.formCheckbox}
                    checked={editingProduct ? editingProduct.isPopular : newProduct.isPopular}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, isPopular: e.target.checked });
                      else setNewProduct({ ...newProduct, isPopular: e.target.checked });
                    }}
                  />
                  <span>Popüler</span>
                </label>

                <label className={styles.formCheckboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.formCheckbox}
                    checked={editingProduct ? editingProduct.isNew : newProduct.isNew}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, isNew: e.target.checked });
                      else setNewProduct({ ...newProduct, isNew: e.target.checked });
                    }}
                  />
                  <span>Yeni Ürün</span>
                </label>

                <label className={styles.formCheckboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.formCheckbox}
                    checked={editingProduct ? editingProduct.isRecommended : newProduct.isRecommended}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, isRecommended: e.target.checked });
                      else setNewProduct({ ...newProduct, isRecommended: e.target.checked });
                    }}
                  />
                  <span>Önerilen</span>
                </label>

                <label className={styles.formCheckboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.formCheckbox}
                    checked={editingProduct ? editingProduct.isAvailable : newProduct.isAvailable}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, isAvailable: e.target.checked });
                      else setNewProduct({ ...newProduct, isAvailable: e.target.checked });
                    }}
                  />
                  <span>Stokta Var</span>
                </label>

                <label className={styles.formCheckboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.formCheckbox}
                    checked={editingProduct ? editingProduct.isActive : newProduct.isActive}
                    onChange={(e) => {
                      if (editingProduct) setEditingProduct({ ...editingProduct, isActive: e.target.checked });
                      else setNewProduct({ ...newProduct, isActive: e.target.checked });
                    }}
                  />
                  <span>Aktif</span>
                </label>

                <div className={styles.formCheckboxGroup}>
                  <span className={styles.formLabel}>Sıralama (Order):</span>
                  <input
                    type="number"
                    style={{ width: '60px', padding: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={editingProduct ? editingProduct.order : newProduct.order}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (editingProduct) setEditingProduct({ ...editingProduct, order: val });
                      else setNewProduct({ ...newProduct, order: val });
                    }}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                {editingProduct && (
                  <button type="button" className="btn-neon" onClick={() => setEditingProduct(null)} disabled={loading}>
                    İptal
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {editingProduct ? 'GÜNCELLE' : 'EKLE'}
                </button>
              </div>
            </form>

            {/* VARIATIONS MANAGEMENT WIDGET (ONLY SHOWS WHEN EDITING PRODUCT) */}
            {editingProduct && (
              <div className={styles.dataForm} style={{ border: '1px solid var(--neon-purple)', boxShadow: 'var(--shadow-neon-p)' }}>
                <h3 className="text-gold" style={{ marginBottom: '15px' }}>Seçenek / Varyasyon Yönetimi ({editingProduct.name_tr})</h3>
                
                {/* Active Variations List */}
                <div style={{ marginBottom: '20px' }}>
                  {editingProduct.variations && editingProduct.variations.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {editingProduct.variations.map((v) => (
                        <div key={v.id} className="badgeActive" style={{ padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>{v.name_tr} - {v.price} {editingProduct.currency}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteVar(v.id, editingProduct.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ff3b30', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bu ürün için henüz boyut/litre varyasyonu eklenmemiş.</p>
                  )}
                </div>

                {/* Add new variation inline form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddVariationSubmit(e);
                  }}
                  style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}
                >
                  <input type="hidden" value={editingProduct.id} />
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Boyut Adı (e.g. 70 cl, Double)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={newVar.name_tr}
                      onChange={(e) => setNewVar({ ...newVar, productId: editingProduct.id, name_tr: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Fiyat</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={newVar.price || ''}
                      onChange={(e) => setNewVar({ ...newVar, productId: editingProduct.id, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                    + Ekle
                  </button>
                </form>
              </div>
            )}

            {/* PRODUCTS LIST */}
            <div className={styles.cardGrid}>
              {products.map((prod) => (
                <div key={prod.id} className={`${styles.itemCard} glass`}>
                  <div className={styles.itemCardHeader}>
                    <div>
                      <span className={styles.itemCardDetails} style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>
                        {prod.category?.name_tr || 'Kategorisiz'}
                      </span>
                      <h4 className={styles.itemCardTitle} style={{ marginTop: '4px' }}>{prod.name_tr}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.name_en}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={`${styles.itemCardBadge} ${prod.isActive ? styles.badgeActive : styles.badgePassive}`}>
                        {prod.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className={`${styles.itemCardBadge} ${prod.isAvailable ? styles.badgeActive : styles.badgePassive}`} style={{ fontSize: '0.6rem' }}>
                        {prod.isAvailable ? 'Stokta' : 'Tükendi'}
                      </span>
                      {prod.isPopular && (
                        <span className={`${styles.itemCardBadge}`} style={{ background: 'rgba(189,0,255,0.1)', border: '1px solid var(--neon-purple)', color: 'var(--neon-purple)', fontSize: '0.6rem' }}>
                          Popüler
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.itemCardDetails}>
                    <p style={{ fontStyle: 'italic', marginBottom: '8px' }}>
                      {prod.description_tr || 'Açıklama yok.'}
                    </p>
                    {prod.volume && <p style={{ fontSize: '0.75rem', color: 'var(--neon-blue)', marginBottom: '4px' }}>Hacim: {prod.volume}</p>}
                    {prod.variations && prod.variations.length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginBottom: '4px' }}>
                        Varyasyonlar: {prod.variations.length} Adet
                      </p>
                    )}
                    <p style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>
                      {prod.discountPrice ? (
                        <span>
                          <span style={{ textDecoration: 'line-through', marginRight: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{prod.price}</span>
                          <span>{prod.discountPrice} {prod.currency}</span>
                        </span>
                      ) : (
                        <span>{prod.price} {prod.currency}</span>
                      )}
                    </p>
                  </div>

                  <div className={styles.itemCardActions}>
                    <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => { setEditingProduct(prod); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      Düzenle
                    </button>
                    <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => handleProductDelete(prod.id)}>
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CATEGORIES VIEW */}
        {activeMenu === 'categories' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className="text-gold">Kategori Yönetimi</h2>
            </div>

            {/* FORM */}
            <form onSubmit={handleCategorySubmit} className={styles.dataForm}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className="text-gold">
                  {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                </h3>
                <div className="lang-switch">
                  {(['tr', 'en', 'ru', 'de', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`lang-btn ${formLang === lang ? 'active' : ''}`}
                      onClick={() => setFormLang(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kategori Adı ({formLang.toUpperCase()})</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={
                      editingCategory
                        ? (editingCategory as any)[`name_${formLang}`] || ''
                        : (newCategory as any)[`name_${formLang}`] || ''
                    }
                    onChange={(e) => {
                      if (editingCategory) setEditingCategory({ ...editingCategory, [`name_${formLang}`]: e.target.value });
                      else setNewCategory({ ...newCategory, [`name_${formLang}`]: e.target.value });
                    }}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sıralama (Order)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={editingCategory ? editingCategory.order : newCategory.order}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (editingCategory) setEditingCategory({ ...editingCategory, order: val });
                      else setNewCategory({ ...newCategory, order: val });
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label className={styles.formCheckboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.formCheckbox}
                    checked={editingCategory ? editingCategory.isActive : newCategory.isActive}
                    onChange={(e) => {
                      if (editingCategory) setEditingCategory({ ...editingCategory, isActive: e.target.checked });
                      else setNewCategory({ ...newCategory, isActive: e.target.checked });
                    }}
                  />
                  <span>Aktif</span>
                </label>
              </div>

              <div className={styles.formActions}>
                {editingCategory && (
                  <button type="button" className="btn-neon" onClick={() => setEditingCategory(null)} disabled={loading}>
                    İptal
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {editingCategory ? 'GÜNCELLE' : 'EKLE'}
                </button>
              </div>
            </form>

            {/* LIST */}
            <div className={styles.cardGrid}>
              {categories.map((cat) => (
                <div key={cat.id} className={`${styles.itemCard} glass`}>
                  <div className={styles.itemCardHeader}>
                    <div>
                      <h4 className={styles.itemCardTitle}>{cat.name_tr}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.name_en}</p>
                    </div>
                    <span className={`${styles.itemCardBadge} ${cat.isActive ? styles.badgeActive : styles.badgePassive}`}>
                      {cat.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  <div className={styles.itemCardDetails}>
                    <p>Sıralama: <strong>{cat.order}</strong></p>
                  </div>

                  <div className={styles.itemCardActions}>
                    <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => { setEditingCategory(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      Düzenle
                    </button>
                    <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => handleCategoryDelete(cat.id)}>
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TABLES & ACTIVE REQUESTS VIEW */}
        {activeMenu === 'tables' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className="text-gold">Masa Rezervasyon & Canlı Talepler</h2>
            </div>

            {/* Add Table form */}
            <form onSubmit={handleAddTable} className={styles.dataForm} style={{ marginBottom: '30px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.formLabel}>Yeni Masa Numarası (e.g. 15, VIP-2)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newTableNo}
                  onChange={(e) => setNewTableNo(e.target.value)}
                  placeholder="Masa numarasını girin"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
                Masa Ekle
              </button>
            </form>

            {/* Tables Grid with Active Alerts */}
            <div className={styles.cardGrid}>
              {tables.map((t) => (
                <div key={t.id} className={`${styles.itemCard} glass`} style={{ border: t.requests.length > 0 ? '1px solid #ff3b30' : 'var(--border-glass)' }}>
                  <div className={styles.itemCardHeader}>
                    <div>
                      <h4 className={styles.itemCardTitle}>Masa: {t.tableNo}</h4>
                      <span className={`${styles.itemCardBadge} ${
                        t.status === 'available' ? styles.badgeActive : styles.badgePassive
                      }`} style={{ marginTop: '4px', display: 'inline-block' }}>
                        {t.status === 'available' ? 'Boş / Müsait' : t.status === 'needs_service' ? 'Garson Bekliyor' : 'Hesap İstedi'}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteTable(t.id)} style={{ background: 'transparent', border: 'none', color: '#ff3b30', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Active Requests List */}
                  <div className={styles.itemCardDetails} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {t.requests.length > 0 ? (
                      t.requests.map((req) => (
                        <div key={req.id} style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.2)', padding: '10px', borderRadius: '6px' }}>
                          <p style={{ fontWeight: 'bold', color: '#ff3b30', fontSize: '0.8rem' }}>
                            {req.type === 'waiter_call' ? '🔔 GARSON ÇAĞRISI' : '💵 HESAP TALEBİ'}
                          </p>
                          {req.details && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              Yöntem: {JSON.parse(req.details).paymentMethod === 'cash' ? 'Nakit' : 'Kredi Kartı'} | 
                              Bahşiş: %{JSON.parse(req.details).tipPercentage}
                            </p>
                          )}
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Saat: {new Date(req.createdAt).toLocaleTimeString('tr-TR')}
                          </p>
                          <button
                            onClick={() => handleResolveRequest(req.id)}
                            className="btn-primary"
                            style={{ width: '100%', padding: '4px', fontSize: '0.7rem', marginTop: '8px' }}
                          >
                            Çözüldü Olarak İşaretle
                          </button>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Masa için aktif bir garson çağrısı bulunmamaktadır.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CAMPAIGNS VIEW */}
        {activeMenu === 'campaigns' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className="text-gold">Kampanya Yönetimi</h2>
            </div>

            {/* FORM */}
            <form onSubmit={handleCampaignSubmit} className={styles.dataForm}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className="text-gold">
                  {editingCampaign ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Ekle'}
                </h3>
                <div className="lang-switch">
                  {(['tr', 'en', 'ru', 'de', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`lang-btn ${formLang === lang ? 'active' : ''}`}
                      onClick={() => setFormLang(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kampanya Başlığı ({formLang.toUpperCase()})</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={
                      editingCampaign
                        ? (editingCampaign as any)[`title_${formLang}`] || ''
                        : (newCampaign as any)[`title_${formLang}`] || ''
                    }
                    onChange={(e) => {
                      if (editingCampaign) setEditingCampaign({ ...editingCampaign, [`title_${formLang}`]: e.target.value });
                      else setNewCampaign({ ...newCampaign, [`title_${formLang}`]: e.target.value });
                    }}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Görsel Linki</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className={styles.formInput}
                      style={{ flex: 1 }}
                      value={editingCampaign ? (editingCampaign.imageUrl || '') : newCampaign.imageUrl}
                      onChange={(e) => {
                        if (editingCampaign) setEditingCampaign({ ...editingCampaign, imageUrl: e.target.value });
                        else setNewCampaign({ ...newCampaign, imageUrl: e.target.value });
                      }}
                    />
                    <label className="btn-neon" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 14px', fontSize: '0.8rem' }}>
                      {uploading ? 'Yükleniyor...' : '📁 Görsel Seç'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Automation dates */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Başlangıç Tarihi (Opsiyonel)</label>
                  <input
                    type="datetime-local"
                    className={styles.formInput}
                    value={editingCampaign ? (editingCampaign.startDate || '') : newCampaign.startDate}
                    onChange={(e) => {
                      if (editingCampaign) setEditingCampaign({ ...editingCampaign, startDate: e.target.value });
                      else setNewCampaign({ ...newCampaign, startDate: e.target.value });
                    }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bitiş Tarihi (Opsiyonel)</label>
                  <input
                    type="datetime-local"
                    className={styles.formInput}
                    value={editingCampaign ? (editingCampaign.endDate || '') : newCampaign.endDate}
                    onChange={(e) => {
                      if (editingCampaign) setEditingCampaign({ ...editingCampaign, endDate: e.target.value });
                      else setNewCampaign({ ...newCampaign, endDate: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Açıklama ({formLang.toUpperCase()})</label>
                  <textarea
                    className={styles.formTextarea}
                    value={
                      editingCampaign
                        ? (editingCampaign as any)[`description_${formLang}`] || ''
                        : (newCampaign as any)[`description_${formLang}`] || ''
                    }
                    onChange={(e) => {
                      if (editingCampaign) setEditingCampaign({ ...editingCampaign, [`description_${formLang}`]: e.target.value });
                      else setNewCampaign({ ...newCampaign, [`description_${formLang}`]: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label className={styles.formCheckboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.formCheckbox}
                    checked={editingCampaign ? editingCampaign.isActive : newCampaign.isActive}
                    onChange={(e) => {
                      if (editingCampaign) setEditingCampaign({ ...editingCampaign, isActive: e.target.checked });
                      else setNewCampaign({ ...newCampaign, isActive: e.target.checked });
                    }}
                  />
                  <span>Aktif</span>
                </label>

                <div className={styles.formCheckboxGroup}>
                  <span className={styles.formLabel}>Sıralama (Order):</span>
                  <input
                    type="number"
                    style={{ width: '60px', padding: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    value={editingCampaign ? editingCampaign.order : newCampaign.order}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (editingCampaign) setEditingCampaign({ ...editingCampaign, order: val });
                      else setNewCampaign({ ...newCampaign, order: val });
                    }}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                {editingCampaign && (
                  <button type="button" className="btn-neon" onClick={() => setEditingCampaign(null)} disabled={loading}>
                    İptal
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {editingCampaign ? 'GÜNCELLE' : 'EKLE'}
                </button>
              </div>
            </form>

            {/* LIST */}
            <div className={styles.cardGrid}>
              {campaigns.map((camp) => (
                <div key={camp.id} className={`${styles.itemCard} glass`}>
                  <div className={styles.itemCardHeader}>
                    <h4 className={styles.itemCardTitle}>{camp.title_tr}</h4>
                    <span className={`${styles.itemCardBadge} ${camp.isActive ? styles.badgeActive : styles.badgePassive}`}>
                      {camp.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  <div className={styles.itemCardDetails}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{camp.title_en}</p>
                    <p style={{ marginTop: '6px' }}>{camp.description_tr || 'Açıklama yok.'}</p>
                  </div>

                  <div className={styles.itemCardActions}>
                    <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => { setEditingCampaign(camp); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      Düzenle
                    </button>
                    <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => handleCampaignDelete(camp.id)}>
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. EVENTS VIEW */}
        {activeMenu === 'events' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className="text-gold">Etkinlik Programı</h2>
            </div>

            {/* FORM */}
            <form onSubmit={handleEventSubmit} className={styles.dataForm}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className="text-gold">
                  {editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
                </h3>
                <div className="lang-switch">
                  {(['tr', 'en', 'ru', 'de', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`lang-btn ${formLang === lang ? 'active' : ''}`}
                      onClick={() => setFormLang(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Etkinlik Adı ({formLang.toUpperCase()})</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={
                      editingEvent
                        ? (editingEvent as any)[`title_${formLang}`] || ''
                        : (newEvent as any)[`title_${formLang}`] || ''
                    }
                    onChange={(e) => {
                      if (editingEvent) setEditingEvent({ ...editingEvent, [`title_${formLang}`]: e.target.value });
                      else setNewEvent({ ...newEvent, [`title_${formLang}`]: e.target.value });
                    }}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>DJ / Sanatçı Adı</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editingEvent ? (editingEvent.djName || '') : newEvent.djName}
                    onChange={(e) => {
                      if (editingEvent) setEditingEvent({ ...editingEvent, djName: e.target.value });
                      else setNewEvent({ ...newEvent, djName: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tarih & Saat</label>
                  <input
                    type="datetime-local"
                    className={styles.formInput}
                    value={editingEvent ? editingEvent.date.slice(0, 16) : newEvent.date}
                    onChange={(e) => {
                      if (editingEvent) setEditingEvent({ ...editingEvent, date: e.target.value });
                      else setNewEvent({ ...newEvent, date: e.target.value });
                    }}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Görsel Linki</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className={styles.formInput}
                      style={{ flex: 1 }}
                      value={editingEvent ? (editingEvent.imageUrl || '') : newEvent.imageUrl}
                      onChange={(e) => {
                        if (editingEvent) setEditingEvent({ ...editingEvent, imageUrl: e.target.value });
                        else setNewEvent({ ...newEvent, imageUrl: e.target.value });
                      }}
                    />
                    <label className="btn-neon" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 14px', fontSize: '0.8rem' }}>
                      {uploading ? 'Yükleniyor...' : '📁 Görsel Seç'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Açıklama ({formLang.toUpperCase()})</label>
                  <textarea
                    className={styles.formTextarea}
                    value={
                      editingEvent
                        ? (editingEvent as any)[`description_${formLang}`] || ''
                        : (newEvent as any)[`description_${formLang}`] || ''
                    }
                    onChange={(e) => {
                      if (editingEvent) setEditingEvent({ ...editingEvent, [`description_${formLang}`]: e.target.value });
                      else setNewEvent({ ...newEvent, [`description_${formLang}`]: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label className={styles.formCheckboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.formCheckbox}
                    checked={editingEvent ? editingEvent.isActive : newEvent.isActive}
                    onChange={(e) => {
                      if (editingEvent) setEditingEvent({ ...editingEvent, isActive: e.target.checked });
                      else setNewEvent({ ...newEvent, isActive: e.target.checked });
                    }}
                  />
                  <span>Aktif</span>
                </label>
              </div>

              <div className={styles.formActions}>
                {editingEvent && (
                  <button type="button" className="btn-neon" onClick={() => setEditingEvent(null)} disabled={loading}>
                    İptal
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {editingEvent ? 'GÜNCELLE' : 'EKLE'}
                </button>
              </div>
            </form>

            {/* LIST */}
            <div className={styles.cardGrid}>
              {events.map((ev) => (
                <div key={ev.id} className={`${styles.itemCard} glass`}>
                  <div className={styles.itemCardHeader}>
                    <div>
                      <h4 className={styles.itemCardTitle}>{ev.title_tr}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neon-blue)', display: 'block', marginTop: '4px' }}>
                        📅 {new Date(ev.date).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <span className={`${styles.itemCardBadge} ${ev.isActive ? styles.badgeActive : styles.badgePassive}`}>
                      {ev.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  <div className={styles.itemCardDetails}>
                    {ev.djName && <p>🎧 DJ: <strong>{ev.djName}</strong></p>}
                    <p style={{ marginTop: '6px' }}>{ev.description_tr || 'Açıklama yok.'}</p>
                  </div>

                  <div className={styles.itemCardActions}>
                    <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => { setEditingEvent(ev); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      Düzenle
                    </button>
                    <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => handleEventDelete(ev.id)}>
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. STATS & ANALYTICS DASHBOARD VIEW */}
        {activeMenu === 'analytics' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className="text-gold">SaaS Ziyaretçi & QR İstatistikleri</h2>
            </div>

            {analytics ? (
              <div>
                {/* Metric cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: 'var(--border-gold)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOPLAM SAYFA GÖRÜNTÜLENME</p>
                    <h3 className="text-gold" style={{ fontSize: '2rem', marginTop: '8px' }}>{analytics.totalVisits}</h3>
                  </div>
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: 'var(--border-gold)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>QR KOD TARANMA SAYISI</p>
                    <h3 className="text-gold" style={{ fontSize: '2rem', marginTop: '8px' }}>{analytics.qrScans}</h3>
                  </div>
                </div>

                {/* CSS charts grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                  
                  {/* Language stats */}
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px' }}>
                    <h4 className="text-gold" style={{ marginBottom: '16px' }}>Dil Dağılımı</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analytics.languages.map((l: any) => {
                        const pct = analytics.totalVisits > 0 ? (l.value / analytics.totalVisits) * 100 : 0;
                        return (
                          <div key={l.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                              <span>{l.name}</span>
                              <span>{l.value} kez (%{pct.toFixed(0)})</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold-primary)' }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Device stats */}
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px' }}>
                    <h4 className="text-gold" style={{ marginBottom: '16px' }}>Cihaz Türü</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analytics.devices.map((d: any) => {
                        const pct = analytics.totalVisits > 0 ? (d.value / analytics.totalVisits) * 100 : 0;
                        return (
                          <div key={d.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                              <span style={{ textTransform: 'capitalize' }}>{d.name}</span>
                              <span>{d.value} kez (%{pct.toFixed(0)})</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--neon-purple)' }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Hourly density chart */}
                <div className="glass" style={{ padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                  <h4 className="text-gold" style={{ marginBottom: '20px' }}>Saatlik Yoğunluk Grafiği (Son 7 Gün)</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '150px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {analytics.hourlyData.map((d: any) => {
                      const maxVisitors = Math.max(...analytics.hourlyData.map((h: any) => h.visitors), 1);
                      const heightPct = (d.visitors / maxVisitors) * 100;
                      return (
                        <div 
                          key={d.hour} 
                          style={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            height: '100%', 
                            justifyContent: 'flex-end' 
                          }}
                        >
                          <div 
                            title={`${d.hour}: ${d.visitors} ziyaretçi`}
                            style={{ 
                              width: '12px', 
                              height: `${heightPct}%`, 
                              background: 'linear-gradient(to top, var(--neon-purple), var(--gold-primary))', 
                              borderRadius: '3px 3px 0 0',
                              minHeight: d.visitors > 0 ? '4px' : '0'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <span>00:00</span>
                    <span>04:00</span>
                    <span>08:00</span>
                    <span>12:00</span>
                    <span>16:00</span>
                    <span>20:00</span>
                    <span>23:00</span>
                  </div>
                </div>

              </div>
            ) : (
              <p>Yükleniyor...</p>
            )}
          </div>
        )}

        {/* 7. SECURITY AUDIT LOG VIEW */}
        {activeMenu === 'logs' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className="text-gold">Sistem Giriş Güvenlik Günlükleri (Audit Logs)</h2>
            </div>

            <div className="glass" style={{ borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '12px' }}>Kullanıcı Adı</th>
                    <th style={{ padding: '12px' }}>IP Adresi</th>
                    <th style={{ padding: '12px' }}>Durum</th>
                    <th style={{ padding: '12px' }}>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {loginLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{log.username}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.ipAddress || 'Bilinmiyor'}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`${styles.itemCardBadge} ${
                          log.status === 'success' ? styles.badgeActive : styles.badgePassive
                        }`}>
                          {log.status === 'success' ? 'Başarılı' : log.status === 'locked_out' ? 'Bloke Edildi' : 'Hatalı Şifre'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. SETTINGS VIEW */}
        {activeMenu === 'settings' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2 className="text-gold">Kulüp Ayarları & Canlı QR Kod</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              
              {/* SETTINGS FORM */}
              <form onSubmit={handleSettingsSubmit} className={styles.dataForm}>
                <h3 className="text-gold" style={{ marginBottom: '20px' }}>Genel Kulüp Bilgileri</h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tema Seçimi</label>
                    <select
                      className={styles.formSelect}
                      value={settingsForm.themeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, themeName: e.target.value })}
                    >
                      <option value="luxury-gold">Luxury Gold (Siyah / Altın)</option>
                      <option value="neon-blue">Neon Blue (Koyu Lacivert / Mavi)</option>
                      <option value="dark-club">Dark Club (Siyah / Neon Mor)</option>
                      <option value="white-premium">White Premium (Lüks Beyaz / Altın)</option>
                    </select>
                  </div>

                  {/* BACKGROUND IMAGES (SLIDER) SETTING */}
                  <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.formLabel}>
                      Arka Plan Görselleri (Slider - Çoklu Eklenebilir)
                    </label>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      {getCoversList().map((url, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            position: 'relative', 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '6px', 
                            border: '1px solid #c8a261', 
                            overflow: 'hidden' 
                          }}
                        >
                          <img 
                            src={url} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCoverUrl(idx)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(217, 83, 79, 0.9)',
                              color: '#fff',
                              border: 'none',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        style={{ display: 'none' }}
                        id="cover-upload-input"
                      />
                      <label
                        htmlFor="cover-upload-input"
                        className="btn-primary"
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '8px 16px', 
                          borderRadius: '4px', 
                          cursor: 'pointer', 
                          backgroundColor: '#c8a261', 
                          color: '#111',
                          fontWeight: 'bold' 
                        }}
                      >
                        📷 Yeni Görsel Yükle
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>WhatsApp Rezervasyon Tel</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. 905300000000"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Instagram Kullanıcı Adı</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. crystallounge"
                      value={settingsForm.instagramUsername}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUsername: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Kulüp / İşletme Adı</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Çalışma Saatleri (Örn: Hafta içi 20:00-04:00)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. 20:00 - 05:00"
                      value={settingsForm.openingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                  <label className={styles.formLabel}>Google Haritalar Konum Linki</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="https://maps.google.com/..."
                    value={settingsForm.googleMapsUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                  />
                </div>

                {/* Localized about us description tabs */}
                <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className={styles.formLabel}>Hakkımızda Metinleri</span>
                    <div className="lang-switch">
                      {(['tr', 'en', 'ru', 'de', 'ar'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className={`lang-btn ${formLang === lang ? 'active' : ''}`}
                          onClick={() => setFormLang(lang)}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Kulüp hakkında bilgi yazın..."
                    value={(settingsForm as any)[`description_${formLang}`] || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, [`description_${formLang}`]: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                  <label className={styles.formLabel}>VIP Masa Limit & Koşul Bilgisi</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="VIP masalar için minimum harcama limiti..."
                    value={settingsForm.vipMinSpendInfo}
                    onChange={(e) => setSettingsForm({ ...settingsForm, vipMinSpendInfo: e.target.value })}
                  />
                </div>

                {/* Bugünün Önerisi Welcome Popup Settings */}
                <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                  <h4 className="text-gold" style={{ marginBottom: '14px' }}>Bugünün Önerisi Popup Ayarları</h4>
                  
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '14px' }}>
                    <label className={styles.formCheckboxGroup}>
                      <input
                        type="checkbox"
                        className={styles.formCheckbox}
                        checked={settingsForm.showHighlightPopup}
                        onChange={(e) => setSettingsForm({ ...settingsForm, showHighlightPopup: e.target.checked })}
                      />
                      <span>Popup'ı Etkinleştir (Sayfa Açılışında Göster)</span>
                    </label>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Popup Başlığı (Örn: 🍸 Bugünün Kokteyli)</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="🍸 Bugünün Kokteyli"
                        value={settingsForm.highlightTitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, highlightTitle: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Önerilen Ürün</label>
                      <select
                        className={styles.formSelect}
                        value={settingsForm.highlightProductId}
                        onChange={(e) => setSettingsForm({ ...settingsForm, highlightProductId: e.target.value })}
                      >
                        <option value="">Seçiniz...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name_tr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Özel İndirim/Fırsat Açıklaması</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Örn: Bu geceye özel %20 İndirimli!"
                        value={settingsForm.highlightDiscountText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, highlightDiscountText: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Geçerlilik Süresi</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Örn: Saat 22:00'ye kadar geçerli"
                        value={settingsForm.highlightValidUntil}
                        onChange={(e) => setSettingsForm({ ...settingsForm, highlightValidUntil: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    AYARLARI KAYDET
                  </button>
                </div>
              </form>

              {/* LIVE QR CODE SECTION */}
              <div className={styles.qrSection} style={{ maxWidth: '420px', margin: '30px auto 0 auto', width: '100%' }}>
                <h3 className="text-gold" style={{ marginBottom: '10px' }}>Menü QR Kodu (V2 SVG Generator)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Sistem kendi vector QR kodunu üretmektedir. QR kodu taranarak doğrudan menüye yönlendirilir.
                </p>

                <div className={styles.qrImagePlaceholder} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getQrCodeUrl()} alt="Dior Menu QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Canlı Menü Adresi:</p>
                <a href={getMenuUrl()} target="_blank" rel="noopener noreferrer" className={styles.qrLinkText} style={{ color: 'var(--color-accent, #C8A977)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                  {getMenuUrl()}
                </a>

                {/* Printable Window PDF & Image download actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center', width: '100%' }}>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ fontSize: '0.8rem', padding: '10px 16px', flex: '1' }}
                    onClick={() => window.open(getQrCodeUrl(), '_blank')}
                  >
                    📥 PNG İndir
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ fontSize: '0.8rem', padding: '10px 16px', flex: '1', backgroundColor: 'transparent', color: 'var(--color-accent, #C8A977)', border: '1px solid var(--border-gold, #E8DED0)' }}
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Print QR Code - ${business.name}</title>
                              <style>
                                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                                h1 { margin-bottom: 20px; font-size: 24px; }
                                img { width: 350px; height: 350px; }
                                p { margin-top: 20px; font-size: 14px; color: #555; }
                                @media print {
                                  button { display: none; }
                                }
                              </style>
                            </head>
                            <body>
                              <h1>${business.name}</h1>
                              <img src="${getQrCodeUrl()}" />
                              <p>${getMenuUrl()}</p>
                              <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; font-size: 16px; cursor: pointer;">Yazdır (Print PDF)</button>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                  >
                    🖨️ PDF / Yazdır
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      </div>
    </>
  );
}
