import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  let username = '';
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const userAgent = headersList.get('user-agent') || 'Unknown';

  // Safe logging helper to prevent crashes on read-only or locked databases
  const logActivitySafely = async (data: any) => {
    try {
      await prisma.loginActivityLog.create({ data });
    } catch (e) {
      console.error('Failed to log login activity safely:', e);
    }
  };

  try {
    const body = await request.json();
    username = body.username || '';
    const password = body.password || '';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    // 1. Check Brute-Force Rate Limiting (5 failures in 15 mins)
    const blockTimeLimit = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
    let failedAttemptsCount = 0;
    
    try {
      failedAttemptsCount = await prisma.loginActivityLog.count({
        where: {
          username,
          status: 'failed_bad_password',
          createdAt: { gte: blockTimeLimit },
        },
      });
    } catch (e) {
      console.error('Failed to query login activity count safely:', e);
    }

    if (failedAttemptsCount >= 5) {
      // Log locked out state
      await logActivitySafely({
        username,
        ipAddress,
        userAgent,
        status: 'locked_out',
      });

      return NextResponse.json(
        { error: 'Çok fazla hatalı giriş denemesi. Hesabınız güvenlik nedeniyle 15 dakika kilitlenmiştir.' },
        { status: 429 }
      );
    }

    // 2. Fetch User
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // Log fake username failure
      await logActivitySafely({
        username,
        ipAddress,
        userAgent,
        status: 'failed_bad_password',
      });

      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // 3. Verify Hashed Password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      // Log password failure
      await logActivitySafely({
        userId: user.id,
        username,
        ipAddress,
        userAgent,
        status: 'failed_bad_password',
      });

      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // 4. Log Successful Login
    await logActivitySafely({
      userId: user.id,
      username,
      ipAddress,
      userAgent,
      status: 'success',
    });

    // 5. Generate Session Tokens
    const csrfToken = await setSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      businessId: user.businessId,
    });

    return NextResponse.json({
      success: true,
      csrfToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        businessId: user.businessId,
      },
    });

  } catch (error) {
    console.error('API Auth Login Error:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken sistem hatası oluştu.' },
      { status: 500 }
    );
  }
}
