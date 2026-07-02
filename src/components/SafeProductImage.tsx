'use client';

import React, { useState, useEffect } from 'react';

interface SafeProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SafeProductImage({
  src,
  alt,
  className,
  style,
}: SafeProductImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);

    if (!src) {
      setError(true);
      setLoading(false);
      return;
    }

    // Resolve URL path
    let resolved = src.trim();
    
    // Check if it is already absolute (HTTP/HTTPS) or is a data URI/absolute root path
    if (
      !resolved.startsWith('http://') &&
      !resolved.startsWith('https://') &&
      !resolved.startsWith('/') &&
      !resolved.startsWith('data:')
    ) {
      resolved = `/images/products/${resolved}`;
    }

    setImageSrc(resolved);
  }, [src]);

  // Premium placeholder if image is missing or broken
  if (error || !imageSrc) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F2', // Premium sand color
          border: '1px solid rgba(212, 175, 55, 0.3)', // Champagne gold border
          padding: '16px',
          textAlign: 'center',
          color: '#8A7A5F', // Muted champagne gold text color
          fontFamily: "'Playfair Display', Georgia, serif",
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '180px',
          boxSizing: 'border-box',
          borderRadius: 'inherit',
          ...style,
        }}
      >
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '6px',
            color: '#6D5C43',
          }}
        >
          DIOR
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            opacity: 0.85,
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          BEACH CLUB
        </div>
        <div
          style={{
            fontSize: '0.58rem',
            letterSpacing: '0.08em',
            opacity: 0.6,
            textTransform: 'uppercase',
            borderTop: '1px solid rgba(138, 122, 95, 0.2)',
            paddingTop: '6px',
            width: '60%',
          }}
        >
          Image Coming Soon
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #121221 25%, #1a1a2e 50%, #121221 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer-pulse 1.6s infinite linear',
            borderRadius: 'inherit',
          }}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: loading ? 'none' : 'block',
          ...style,
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />

      {/* CSS rule for shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer-pulse {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
