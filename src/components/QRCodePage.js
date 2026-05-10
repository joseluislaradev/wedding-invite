import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import siteConfig from '../siteConfig';

function getUploadUrl() {
  const configuredUrl =
    process.env.REACT_APP_NETLIFY_PUBLIC_UPLOAD_URL ||
    process.env.REACT_APP_UPLOAD_URL ||
    process.env.NETLIFY_PUBLIC_UPLOAD_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/upload`;
  }

  return '/upload';
}

function QRCodePage() {
  const [sheetEventName, setSheetEventName] = useState('');
  const qrRef = useRef(null);
  const uploadUrl = useMemo(() => getUploadUrl(), []);

  useEffect(() => {
    let isMounted = true;

    const loadEventName = async () => {
      try {
        const response = await fetch('/.netlify/functions/upload-config');
        const result = await response.json();

        if (isMounted && response.ok && result.success) {
          setSheetEventName(result.config?.eventName || '');
        }
      } catch (error) {
        console.warn('Using local QR event name because Google Sheets config could not be loaded.', error);
      }
    };

    loadEventName();

    return () => {
      isMounted = false;
    };
  }, []);

  const eventName =
    sheetEventName ||
    siteConfig.uploadPhotos?.eventName ||
    siteConfig.couple?.displayName ||
    siteConfig.app?.name ||
    'Nuestra boda';

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');

    if (!canvas) {
      return;
    }

    const imageUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'qr-subida-fotos-boda.png';
    link.click();
  };

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-apple-gray-900 print:px-0 print:py-0">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col items-center justify-center text-center print:min-h-screen">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-apple-gray-500">
          QR para invitados
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">
          Subir fotos
        </h1>
        <p className="mt-3 max-w-md text-lg leading-7 text-apple-gray-600">
          Escanea para abrir la cámara y guardar recuerdos de {eventName}.
        </p>

        <section className="mt-8 rounded-2xl border border-apple-gray-200 bg-white p-5 shadow-apple print:border-0 print:shadow-none">
          <div ref={qrRef} className="rounded-xl bg-white p-4">
            <QRCodeCanvas
              value={uploadUrl}
              size={320}
              level="H"
              includeMargin
            />
          </div>
        </section>

        <p className="mt-5 max-w-xl break-all text-sm leading-6 text-apple-gray-500">
          {uploadUrl}
        </p>

        <button
          type="button"
          onClick={downloadQRCode}
          className="mt-8 rounded-2xl bg-apple-gray-900 px-8 py-4 text-lg font-bold text-white shadow-apple transition active:scale-[0.99] print:hidden"
        >
          Descargar QR
        </button>
      </div>
    </main>
  );
}

export default QRCodePage;
