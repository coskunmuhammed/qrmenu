import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 0. Redirect HTTP to HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') === 'http'
  ) {
    const secureUrl = new URL(request.url);
    secureUrl.protocol = 'https:';
    return NextResponse.redirect(secureUrl.toString(), 308);
  }

  const response = NextResponse.next();

  // 1. Content Security Policy (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co https://res.cloudinary.com https://api.qrserver.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // 2. Clickjacking prevention
  response.headers.set('X-Frame-Options', 'DENY');

  // 3. XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 4. Content Type sniffing prevention
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 5. Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 6. Strict Transport Security (HSTS) - production only
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  return response;
}

// Matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (optional if you want to apply different headers there)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
