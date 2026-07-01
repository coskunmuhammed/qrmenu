import QRCode from 'qrcode';

export async function generateQrSvg(url: string): Promise<string> {
  try {
    const svgString = await QRCode.toString(url, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#030306',  // Background theme match dark
        light: '#ffffff' // QR contrast light
      }
    });
    return svgString;
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    throw new Error('QR kod üretilemedi.');
  }
}

export async function generateQrDataUrl(url: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      margin: 2,
      width: 400,
      color: {
        dark: '#030306',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR Data URL:', err);
    throw new Error('QR kod görseli üretilemedi.');
  }
}
