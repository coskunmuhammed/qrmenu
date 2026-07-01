import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './db';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'access-secret-crystal-lounge-vip-99887766'
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'refresh-secret-crystal-lounge-vip-11223344'
);

const ACCESS_COOKIE = 'vip_menu_access';
const REFRESH_COOKIE = 'vip_menu_refresh';
const CSRF_COOKIE = 'vip_menu_csrf';

export interface UserSession {
  userId: string;
  username: string;
  role: string;
  businessId: string | null;
}

export async function signAccessToken(payload: UserSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Short-lived access token
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: { userId: string }): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Long-lived refresh token
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      businessId: payload.businessId as string | null,
    };
  } catch (err) {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return {
      userId: payload.userId as string,
    };
  } catch (err) {
    return null;
  }
}

// Generate a random CSRF token
export function generateCsrfToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (accessToken) {
    const decoded = await verifyAccessToken(accessToken);
    if (decoded) return decoded;
  }

  // Access token is missing or expired, attempt refresh token swap
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const refreshDecoded = await verifyRefreshToken(refreshToken);
  if (!refreshDecoded) {
    // Refresh token expired, clear cookies
    await destroySession();
    return null;
  }

  // Refresh token is valid, query user details and set new access token
  try {
    const user = await prisma.user.findUnique({
      where: { id: refreshDecoded.userId },
    });

    if (!user) return null;

    const newSession: UserSession = {
      userId: user.id,
      username: user.username,
      role: user.role,
      businessId: user.businessId,
    };

    // Set new access token cookie
    const newAccessToken = await signAccessToken(newSession);
    cookieStore.set(ACCESS_COOKIE, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return newSession;
  } catch (e) {
    return null;
  }
}

export async function setSession(sessionData: UserSession): Promise<string> {
  const cookieStore = await cookies();
  
  // 1. Create Access Token (15m)
  const accessToken = await signAccessToken(sessionData);
  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  // 2. Create Refresh Token (7d)
  const refreshToken = await signRefreshToken({ userId: sessionData.userId });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  // 3. Create CSRF Token
  const csrfToken = generateCsrfToken();
  cookieStore.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false, // Must be readable by client script
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60,
    path: '/',
  });

  return csrfToken;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  cookieStore.delete(CSRF_COOKIE);
}

// CSRF check function to protect API updates
export async function validateCsrfRequest(clientCsrfToken: string | null): Promise<boolean> {
  const cookieStore = await cookies();
  const serverCsrfToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!serverCsrfToken || !clientCsrfToken) return false;
  return serverCsrfToken === clientCsrfToken;
}
