import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import MenuView from './MenuView';
import { headers } from 'next/headers';

export const revalidate = 0; // Prevent dynamic caching

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function MenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { t: tableNo } = await searchParams;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              variations: {
                orderBy: { price: 'asc' },
              },
            },
          },
        },
      },
      campaigns: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
      events: {
        where: { isActive: true },
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!business) {
    notFound();
  }

  // Determine user agent and language for analytics logging
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const acceptLanguage = headersList.get('accept-language') || 'tr';

  let deviceType = 'desktop';
  if (/mobile/i.test(userAgent)) deviceType = 'mobile';
  else if (/tablet/i.test(userAgent)) deviceType = 'tablet';

  const langCode = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
  const trackedLang = ['tr', 'en', 'ru', 'de', 'ar'].includes(langCode) ? langCode : 'tr';

  // Log analytics asynchronously to keep page loading instantaneous
  prisma.analyticsLog.create({
    data: {
      businessId: business.id,
      eventType: tableNo ? 'qr_scan' : 'page_view',
      deviceType,
      language: trackedLang,
      tableNo: tableNo || null,
      details: JSON.stringify({ userAgent }),
    },
  }).catch((e) => console.error('Analytics log failed:', e));

  // Serialize DB models safely to transfer to Client Component
  const serializedBusiness = JSON.parse(JSON.stringify(business));

  return <MenuView business={serializedBusiness} tableNo={tableNo || null} />;
}
