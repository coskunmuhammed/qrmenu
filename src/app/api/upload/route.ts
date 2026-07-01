import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // 1. Authorize session
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Görsel yüklemek için yetkiniz bulunmamaktadır.' },
        { status: 401 }
      );
    }

    // 2. Parse Multipart Data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = path.extname(file.name);
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${fileExt}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'qr-menu-images';

    // 3. Option A: Supabase Storage (Production)
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniqueFileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error('Supabase Storage Upload Error:', error);
        return NextResponse.json(
          { error: `Cloud upload hatası: ${error.message}` },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uniqueFileName);

      return NextResponse.json({ url: urlData.publicUrl });
    }

    // 4. Option B: Local Disk Fallback (Development/Local Test)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      // Ensure directory exists
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, uniqueFileName);
      await fs.writeFile(filePath, buffer);

      const localUrl = `/uploads/${uniqueFileName}`;
      return NextResponse.json({ url: localUrl });
    } catch (diskError) {
      console.warn('Local disk write failed, falling back to Base64 URI:', diskError);
      // Fallback: Convert to Base64 data URI
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${file.type || 'image/jpeg'};base64,${base64Data}`;
      return NextResponse.json({ url: dataUri });
    }

  } catch (error: any) {
    console.error('Upload Endpoint Error:', error);
    return NextResponse.json(
      { error: 'Dosya yükleme işlemi başarısız oldu.' },
      { status: 500 }
    );
  }
}
