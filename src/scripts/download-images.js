const fs = require('fs');
const path = require('path');
const http = require('https');

const publicDir = path.join(__dirname, '../../public');
const placeholdersDir = path.join(publicDir, 'images/placeholders');
const productsDir = path.join(publicDir, 'images/products');

// Create directories recursively
fs.mkdirSync(placeholdersDir, { recursive: true });
fs.mkdirSync(productsDir, { recursive: true });

const imagesToDownload = [
  {
    name: 'placeholders/product-placeholder.jpg',
    url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=70&fit=crop'
  },
  {
    name: 'products/purple-rain.jpg',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=70&fit=crop'
  },
  {
    name: 'products/gold-rush.jpg',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=70&fit=crop'
  },
  {
    name: 'products/whiskey.jpg',
    url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=70&fit=crop'
  },
  {
    name: 'products/champagne.jpg',
    url: 'https://images.unsplash.com/photo-1594487540885-48baff7d1e8d?w=800&q=70&fit=crop'
  },
  {
    name: 'products/lounge.jpg',
    url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&q=70&fit=crop'
  }
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = http.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
    
    // Set a timeout of 10 seconds
    request.setTimeout(10000, () => {
      request.destroy();
      fs.unlink(dest, () => {});
      reject(new Error('Timeout'));
    });
  });
};

const writeFallbackImage = (dest) => {
  // A tiny valid 1x1 grey JPEG
  const base64Jpeg = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  fs.writeFileSync(dest, Buffer.from(base64Jpeg, 'base64'));
};

async function run() {
  console.log('Downloading public image assets...');
  for (const img of imagesToDownload) {
    const dest = path.join(publicDir, 'images', img.name);
    console.log(`Downloading ${img.name}...`);
    try {
      await download(img.url, dest);
      console.log(`Success: ${img.name}`);
    } catch (err) {
      console.warn(`Failed to download ${img.name}: ${err.message}. Creating placeholder fallback...`);
      writeFallbackImage(dest);
    }
  }
  console.log('Done downloading image assets!');
}

run();
