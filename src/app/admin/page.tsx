import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

export const revalidate = 0; // Prevent server component caching

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  // Fetch all necessary business information
  const business = await prisma.business.findFirst({
    include: {
      categories: {
        orderBy: { order: 'asc' },
      },
      campaigns: {
        orderBy: { order: 'asc' },
      },
      events: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!business) {
    // If no business exists (e.g. database not seeded), redirect to login
    redirect('/admin/login');
  }

  // Fetch all products associated with this business
  const products = await prisma.product.findMany({
    where: {
      category: {
        businessId: business.id,
      },
    },
    include: {
      category: true,
    },
    orderBy: [
      { categoryId: 'asc' },
      { order: 'asc' },
    ],
  });

  // Safely serialize database models (converts Date objects and decimals to primitives)
  const serializedBusiness = JSON.parse(JSON.stringify(business));
  const serializedProducts = JSON.parse(JSON.stringify(products));

  return (
    <AdminDashboard
      initialBusiness={serializedBusiness}
      initialProducts={serializedProducts}
      userSession={session}
    />
  );
}
