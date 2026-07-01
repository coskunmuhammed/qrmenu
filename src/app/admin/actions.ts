'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Middleware helper to check admin session and enforce tenant boundaries
async function checkAuth() {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error('Yetkisiz erişim. Lütfen giriş yapın.');
  }
  return session;
}

// Helper to assert businessId is available for standard tenant actions
async function getTenantBusinessId() {
  const session = await checkAuth();
  if (session.role === 'super_admin') {
    // Super admin fallback (get first business if not assigned)
    const business = await prisma.business.findFirst();
    if (!business) throw new Error('İşletme bulunamadı.');
    return business.id;
  }
  
  if (!session.businessId) {
    throw new Error('Kullanıcıya atanmış bir işletme bulunamadı.');
  }
  return session.businessId;
}

/* =========================================================================
   BUSINESS / SETTINGS ACTIONS
   ========================================================================= */

export async function getBusinessSettings() {
  const businessId = await getTenantBusinessId();
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  return JSON.parse(JSON.stringify(business));
}

export async function updateBusinessSettings(data: {
  name: string;
  description_tr: string;
  description_en: string;
  description_ru: string;
  description_de: string;
  description_ar: string;
  whatsappNumber: string;
  instagramUsername: string;
  googleMapsUrl: string;
  vipMinSpendInfo: string;
  openingHours: string;
  themeName: string;
  customColors?: string;
  showHighlightPopup: boolean;
  highlightTitle?: string | null;
  highlightProductId?: string | null;
  highlightDiscountText?: string | null;
  highlightValidUntil?: string | null;
  coverUrl?: string | null;
}) {
  const businessId = await getTenantBusinessId();

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      name: data.name,
      description_tr: data.description_tr,
      description_en: data.description_en,
      description_ru: data.description_ru,
      description_de: data.description_de,
      description_ar: data.description_ar,
      whatsappNumber: data.whatsappNumber,
      instagramUsername: data.instagramUsername,
      googleMapsUrl: data.googleMapsUrl,
      vipMinSpendInfo: data.vipMinSpendInfo,
      openingHours: data.openingHours,
      themeName: data.themeName,
      customColors: data.customColors || null,
      showHighlightPopup: data.showHighlightPopup,
      highlightTitle: data.highlightTitle || null,
      highlightProductId: data.highlightProductId || null,
      highlightDiscountText: data.highlightDiscountText || null,
      highlightValidUntil: data.highlightValidUntil || null,
      coverUrl: data.coverUrl !== undefined ? data.coverUrl : undefined,
    },
  });

  revalidatePath(`/menu/${updated.slug}`);
  return JSON.parse(JSON.stringify(updated));
}

/* =========================================================================
   CATEGORY ACTIONS
   ========================================================================= */

export async function getCategories() {
  const businessId = await getTenantBusinessId();
  const categories = await prisma.category.findMany({
    where: { businessId },
    orderBy: { order: 'asc' },
  });
  return JSON.parse(JSON.stringify(categories));
}

export async function createCategory(data: {
  name_tr: string;
  name_en: string;
  name_ru: string | null;
  name_de: string | null;
  name_ar: string | null;
  order: number;
  isActive: boolean;
}) {
  const businessId = await getTenantBusinessId();

  const category = await prisma.category.create({
    data: {
      businessId,
      name_tr: data.name_tr,
      name_en: data.name_en,
      name_ru: data.name_ru || null,
      name_de: data.name_de || null,
      name_ar: data.name_ar || null,
      order: data.order,
      isActive: data.isActive,
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(category));
}

export async function updateCategory(
  id: string,
  data: {
    name_tr: string;
    name_en: string;
    name_ru: string | null;
    name_de: string | null;
    name_ar: string | null;
    order: number;
    isActive: boolean;
  }
) {
  const businessId = await getTenantBusinessId();

  // Guard: Ensure category belongs to active tenant
  const existing = await prisma.category.findFirst({
    where: { id, businessId },
  });
  if (!existing) throw new Error('Kategori bulunamadı veya yetkiniz yok.');

  const category = await prisma.category.update({
    where: { id },
    data: {
      name_tr: data.name_tr,
      name_en: data.name_en,
      name_ru: data.name_ru || null,
      name_de: data.name_de || null,
      name_ar: data.name_ar || null,
      order: data.order,
      isActive: data.isActive,
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(category));
}

export async function deleteCategory(id: string) {
  const businessId = await getTenantBusinessId();

  const existing = await prisma.category.findFirst({
    where: { id, businessId },
  });
  if (!existing) throw new Error('Kategori bulunamadı veya yetkiniz yok.');

  const category = await prisma.category.delete({
    where: { id },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(category));
}

/* =========================================================================
   PRODUCT ACTIONS
   ========================================================================= */

export async function getProducts() {
  const businessId = await getTenantBusinessId();
  const products = await prisma.product.findMany({
    where: {
      category: {
        businessId,
      },
    },
    include: {
      category: true,
      variations: true,
    },
    orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
  });
  return JSON.parse(JSON.stringify(products));
}

export async function createProduct(data: {
  categoryId: string;
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
  discountPrice?: number | null;
  currency: string;
  imageUrl: string | null;
  isPopular: boolean;
  isNew: boolean;
  isRecommended: boolean;
  isAvailable: boolean;
  isActive: boolean;
  alcoholRatio?: number | null;
  ingredients?: string | null;
  volume?: string | null;
  order: number;
}) {
  const businessId = await getTenantBusinessId();

  // Guard: Ensure target category belongs to tenant
  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, businessId },
  });
  if (!category) throw new Error('Kategori bulunamadı.');

  const product = await prisma.product.create({
    data: {
      categoryId: data.categoryId,
      name_tr: data.name_tr,
      name_en: data.name_en,
      name_ru: data.name_ru || null,
      name_de: data.name_de || null,
      name_ar: data.name_ar || null,
      description_tr: data.description_tr || null,
      description_en: data.description_en || null,
      description_ru: data.description_ru || null,
      description_de: data.description_de || null,
      description_ar: data.description_ar || null,
      price: Number(data.price),
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      currency: data.currency,
      imageUrl: data.imageUrl || null,
      isPopular: data.isPopular,
      isNew: data.isNew,
      isRecommended: data.isRecommended,
      isAvailable: data.isAvailable,
      isActive: data.isActive,
      alcoholRatio: data.alcoholRatio ? Number(data.alcoholRatio) : null,
      ingredients: data.ingredients || null,
      volume: data.volume || null,
      order: data.order,
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(product));
}

export async function updateProduct(
  id: string,
  data: {
    categoryId: string;
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
    discountPrice?: number | null;
    currency: string;
    imageUrl: string | null;
    isPopular: boolean;
    isNew: boolean;
    isRecommended: boolean;
    isAvailable: boolean;
    isActive: boolean;
    alcoholRatio?: number | null;
    ingredients?: string | null;
    volume?: string | null;
    order: number;
  }
) {
  const businessId = await getTenantBusinessId();

  // Guard: Ensure product belongs to tenant
  const existing = await prisma.product.findFirst({
    where: { id, category: { businessId } },
  });
  if (!existing) throw new Error('Ürün bulunamadı.');

  const product = await prisma.product.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      name_tr: data.name_tr,
      name_en: data.name_en,
      name_ru: data.name_ru || null,
      name_de: data.name_de || null,
      name_ar: data.name_ar || null,
      description_tr: data.description_tr || null,
      description_en: data.description_en || null,
      description_ru: data.description_ru || null,
      description_de: data.description_de || null,
      description_ar: data.description_ar || null,
      price: Number(data.price),
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      currency: data.currency,
      imageUrl: data.imageUrl || null,
      isPopular: data.isPopular,
      isNew: data.isNew,
      isRecommended: data.isRecommended,
      isAvailable: data.isAvailable,
      isActive: data.isActive,
      alcoholRatio: data.alcoholRatio ? Number(data.alcoholRatio) : null,
      ingredients: data.ingredients || null,
      volume: data.volume || null,
      order: data.order,
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(product));
}

export async function deleteProduct(id: string) {
  const businessId = await getTenantBusinessId();

  const existing = await prisma.product.findFirst({
    where: { id, category: { businessId } },
  });
  if (!existing) throw new Error('Ürün bulunamadı.');

  const product = await prisma.product.delete({
    where: { id },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(product));
}

/* =========================================================================
   VARIATION ACTIONS
   ========================================================================= */

export async function createVariation(data: {
  productId: string;
  name_tr: string;
  name_en: string;
  name_ru: string;
  name_de: string;
  name_ar: string;
  price: number;
}) {
  const businessId = await getTenantBusinessId();

  // Guard: Check product ownership
  const product = await prisma.product.findFirst({
    where: { id: data.productId, category: { businessId } },
  });
  if (!product) throw new Error('Ürün bulunamadı.');

  const variation = await prisma.productVariation.create({
    data: {
      productId: data.productId,
      name_tr: data.name_tr,
      name_en: data.name_en,
      name_ru: data.name_ru || null,
      name_de: data.name_de || null,
      name_ar: data.name_ar || null,
      price: Number(data.price),
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(variation));
}

export async function deleteVariation(id: string) {
  const businessId = await getTenantBusinessId();

  const existing = await prisma.productVariation.findFirst({
    where: { id, product: { category: { businessId } } },
  });
  if (!existing) throw new Error('Seçenek bulunamadı.');

  await prisma.productVariation.delete({ where: { id } });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return { success: true };
}

/* =========================================================================
   TABLE REQUESTS & MANAGEMENT
   ========================================================================= */

export async function getTablesWithRequests() {
  const businessId = await getTenantBusinessId();
  const tables = await prisma.table.findMany({
    where: { businessId },
    include: {
      requests: {
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { tableNo: 'asc' },
  });
  return JSON.parse(JSON.stringify(tables));
}

export async function resolveTableRequest(requestId: string) {
  const businessId = await getTenantBusinessId();

  // Guard: check request ownership
  const request = await prisma.tableRequest.findFirst({
    where: { id: requestId, table: { businessId } },
  });
  if (!request) throw new Error('Talep bulunamadı.');

  await prisma.tableRequest.update({
    where: { id: requestId },
    data: { status: 'completed' },
  });

  // Check if there are other pending requests for this table
  const otherRequests = await prisma.tableRequest.count({
    where: { tableId: request.tableId, status: 'pending' },
  });

  if (otherRequests === 0) {
    await prisma.table.update({
      where: { id: request.tableId },
      data: { status: 'available' },
    });
  }

  return { success: true };
}

export async function addTable(tableNo: string) {
  const businessId = await getTenantBusinessId();
  
  const existing = await prisma.table.findFirst({
    where: { businessId, tableNo },
  });
  if (existing) throw new Error('Masa zaten mevcut.');

  const table = await prisma.table.create({
    data: { businessId, tableNo },
  });

  return JSON.parse(JSON.stringify(table));
}

export async function deleteTable(id: string) {
  const businessId = await getTenantBusinessId();

  const existing = await prisma.table.findFirst({
    where: { id, businessId },
  });
  if (!existing) throw new Error('Masa bulunamadı.');

  await prisma.table.delete({ where: { id } });
  return { success: true };
}

/* =========================================================================
   CAMPAIGN ACTIONS
   ========================================================================= */

export async function getCampaigns() {
  const businessId = await getTenantBusinessId();
  const campaigns = await prisma.campaign.findMany({
    where: { businessId },
    orderBy: { order: 'asc' },
  });
  return JSON.parse(JSON.stringify(campaigns));
}

export async function createCampaign(data: {
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
  startDate?: string | null;
  endDate?: string | null;
  order: number;
}) {
  const businessId = await getTenantBusinessId();

  const campaign = await prisma.campaign.create({
    data: {
      businessId,
      title_tr: data.title_tr,
      title_en: data.title_en,
      title_ru: data.title_ru || null,
      title_de: data.title_de || null,
      title_ar: data.title_ar || null,
      description_tr: data.description_tr || null,
      description_en: data.description_en || null,
      description_ru: data.description_ru || null,
      description_de: data.description_de || null,
      description_ar: data.description_ar || null,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      order: data.order,
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(campaign));
}

export async function updateCampaign(
  id: string,
  data: {
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
    startDate?: string | null;
    endDate?: string | null;
    order: number;
  }
) {
  const businessId = await getTenantBusinessId();

  const existing = await prisma.campaign.findFirst({
    where: { id, businessId },
  });
  if (!existing) throw new Error('Kampanya bulunamadı.');

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      title_tr: data.title_tr,
      title_en: data.title_en,
      title_ru: data.title_ru || null,
      title_de: data.title_de || null,
      title_ar: data.title_ar || null,
      description_tr: data.description_tr || null,
      description_en: data.description_en || null,
      description_ru: data.description_ru || null,
      description_de: data.description_de || null,
      description_ar: data.description_ar || null,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      order: data.order,
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(campaign));
}

export async function deleteCampaign(id: string) {
  const businessId = await getTenantBusinessId();

  const existing = await prisma.campaign.findFirst({
    where: { id, businessId },
  });
  if (!existing) throw new Error('Kampanya bulunamadı.');

  await prisma.campaign.delete({ where: { id } });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return { success: true };
}

/* =========================================================================
   EVENT ACTIONS
   ========================================================================= */

export async function getEvents() {
  const businessId = await getTenantBusinessId();
  const events = await prisma.event.findMany({
    where: { businessId },
    orderBy: { date: 'asc' },
  });
  return JSON.parse(JSON.stringify(events));
}

export async function createEvent(data: {
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
}) {
  const businessId = await getTenantBusinessId();

  const event = await prisma.event.create({
    data: {
      businessId,
      title_tr: data.title_tr,
      title_en: data.title_en,
      title_ru: data.title_ru || null,
      title_de: data.title_de || null,
      title_ar: data.title_ar || null,
      djName: data.djName || null,
      date: new Date(data.date),
      description_tr: data.description_tr || null,
      description_en: data.description_en || null,
      description_ru: data.description_ru || null,
      description_de: data.description_de || null,
      description_ar: data.description_ar || null,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive,
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(event));
}

export async function updateEvent(
  id: string,
  data: {
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
) {
  const businessId = await getTenantBusinessId();

  const existing = await prisma.event.findFirst({
    where: { id, businessId },
  });
  if (!existing) throw new Error('Etkinlik bulunamadı.');

  const event = await prisma.event.update({
    where: { id },
    data: {
      title_tr: data.title_tr,
      title_en: data.title_en,
      title_ru: data.title_ru || null,
      title_de: data.title_de || null,
      title_ar: data.title_ar || null,
      djName: data.djName || null,
      date: new Date(data.date),
      description_tr: data.description_tr || null,
      description_en: data.description_en || null,
      description_ru: data.description_ru || null,
      description_de: data.description_de || null,
      description_ar: data.description_ar || null,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive,
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return JSON.parse(JSON.stringify(event));
}

export async function deleteEvent(id: string) {
  const businessId = await getTenantBusinessId();

  const existing = await prisma.event.findFirst({
    where: { id, businessId },
  });
  if (!existing) throw new Error('Etkinlik bulunamadı.');

  await prisma.event.delete({ where: { id } });

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (business) revalidatePath(`/menu/${business.slug}`);

  return { success: true };
}

/* =========================================================================
   ANALYTICS SUMMARIES
   ========================================================================= */

export async function getAnalyticsSummary() {
  const businessId = await getTenantBusinessId();

  // Get total scan logs
  const totalVisits = await prisma.analyticsLog.count({
    where: { businessId },
  });

  const qrScans = await prisma.analyticsLog.count({
    where: { businessId, eventType: 'qr_scan' },
  });

  // Group by Device
  const rawDevices = await prisma.analyticsLog.groupBy({
    by: ['deviceType'],
    where: { businessId },
    _count: { deviceType: true },
  });
  const devices = rawDevices.map((d) => ({
    name: d.deviceType || 'Desktop',
    value: d._count.deviceType,
  }));

  // Group by Language
  const rawLanguages = await prisma.analyticsLog.groupBy({
    by: ['language'],
    where: { businessId },
    _count: { language: true },
  });
  const languages = rawLanguages.map((l) => ({
    name: (l.language || 'tr').toUpperCase(),
    value: l._count.language,
  }));

  // Hourly density loader (past 7 days)
  const logs = await prisma.analyticsLog.findMany({
    where: {
      businessId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    select: { createdAt: true },
  });

  const hourlyDistribution = Array(24).fill(0);
  logs.forEach((log) => {
    const hour = new Date(log.createdAt).getHours();
    hourlyDistribution[hour]++;
  });

  const hourlyData = hourlyDistribution.map((count, hour) => ({
    hour: `${hour}:00`,
    visitors: count,
  }));

  return {
    totalVisits,
    qrScans,
    devices,
    languages,
    hourlyData,
  };
}

/* =========================================================================
   SECURITY AUDIT / LOGIN LOGS
   ========================================================================= */

export async function getLoginActivityLogs() {
  const session = await checkAuth();
  const businessId = await getTenantBusinessId();

  // Find users belonging to active tenant
  const users = await prisma.user.findMany({
    where: { businessId },
    select: { id: true, username: true },
  });
  const userIds = users.map((u) => u.id);

  const logs = await prisma.loginActivityLog.findMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { username: { in: users.map((u) => u.username) } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return JSON.parse(JSON.stringify(logs));
}

/* =========================================================================
   CLIENT CUSTOMER TRIGGERS (NO AUTH REQUIRED)
   ========================================================================= */

export async function guestCallWaiter(businessSlug: string, tableNo: string) {
  const business = await prisma.business.findUnique({
    where: { slug: businessSlug },
  });
  if (!business) throw new Error('İşletme bulunamadı.');

  // Find or create Table mapping
  let table = await prisma.table.findFirst({
    where: { businessId: business.id, tableNo },
  });

  if (!table) {
    table = await prisma.table.create({
      data: { businessId: business.id, tableNo, status: 'needs_service' },
    });
  } else {
    await prisma.table.update({
      where: { id: table.id },
      data: { status: 'needs_service' },
    });
  }

  // Insert waiter alert
  await prisma.tableRequest.create({
    data: {
      tableId: table.id,
      type: 'waiter_call',
      status: 'pending',
    },
  });

  // Log analytics scan
  await prisma.analyticsLog.create({
    data: {
      businessId: business.id,
      eventType: 'waiter_call',
      tableNo,
    },
  });

  return { success: true };
}

export async function guestRequestBill(
  businessSlug: string,
  tableNo: string,
  paymentMethod: 'cash' | 'card',
  tipPercentage: number
) {
  const business = await prisma.business.findUnique({
    where: { slug: businessSlug },
  });
  if (!business) throw new Error('İşletme bulunamadı.');

  let table = await prisma.table.findFirst({
    where: { businessId: business.id, tableNo },
  });

  if (!table) {
    table = await prisma.table.create({
      data: { businessId: business.id, tableNo, status: 'bill_requested' },
    });
  } else {
    await prisma.table.update({
      where: { id: table.id },
      data: { status: 'bill_requested' },
    });
  }

  // Insert waiter alert with cash/card and tip details
  await prisma.tableRequest.create({
    data: {
      tableId: table.id,
      type: 'bill_request',
      status: 'pending',
      details: JSON.stringify({ paymentMethod, tipPercentage }),
    },
  });

  // Log analytics action
  await prisma.analyticsLog.create({
    data: {
      businessId: business.id,
      eventType: 'bill_request',
      tableNo,
      details: JSON.stringify({ paymentMethod, tipPercentage }),
    },
  });

  return { success: true };
}
