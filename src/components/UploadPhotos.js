import React, { useEffect, useRef, useState } from 'react';
import siteConfig from '../siteConfig';

const uploadStates = {
  idle: 'idle',
  uploading: 'uploading',
  success: 'success',
  error: 'error',
};

function UploadPhotos() {
  const [status, setStatus] = useState(uploadStates.idle);
  const [message, setMessage] = useState('');
  const [sheetConfig, setSheetConfig] = useState({});
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadConfig = {
    ...(siteConfig.uploadPhotos || {}),
    ...sheetConfig,
  };

  useEffect(() => {
    let isMounted = true;

    const loadSheetConfig = async () => {
      try {
        const response = await fetch('/.netlify/functions/upload-config');
        const result = await response.json();

        if (isMounted && response.ok && result.success && result.config) {
          setSheetConfig(result.config);
        }
      } catch (error) {
        console.warn('Using local upload config because Google Sheets config could not be loaded.', error);
      }
    };

    loadSheetConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const eventName =
    uploadConfig.eventName ||
    uploadConfig.title ||
    siteConfig.couple?.displayName ||
    siteConfig.app?.name ||
    'Nuestra boda';

  const validateFile = (file) => {
    const maxFileSize = uploadConfig.maxFileSize || 10;
    const maxSize = maxFileSize * 1024 * 1024;
    const allowedTypes = uploadConfig.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!file) {
      return uploadConfig.noFileMessage || 'No se seleccionó ninguna foto.';
    }

    if (!allowedTypes.includes(file.type)) {
      return uploadConfig.invalidTypeMessage || 'Ese formato de imagen no es compatible.';
    }

    if (file.size > maxSize) {
      return (uploadConfig.fileTooLargeMessage || 'La foto es muy grande. Máximo {maxFileSize} MB.')
        .replace('{maxFileSize}', maxFileSize);
    }

    return '';
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setStatus(uploadStates.error);
      setMessage(validationError);
      return;
    }

    setStatus(uploadStates.uploading);
    setMessage(uploadConfig.uploadingMessage || 'Subiendo tu foto...');

    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await response.json()
        : { success: false, message: await response.text() };

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No se pudo guardar la foto.');
      }

      setStatus(uploadStates.success);
      setMessage(uploadConfig.successMessage || '¡Gracias! Tu foto fue guardada.');
    } catch (error) {
      console.error('Error during photo upload:', error);
      setStatus(uploadStates.error);
      setMessage(uploadConfig.errorMessage || 'No se pudo subir la foto. Intenta otra vez.');
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    uploadFile(file);
  };

  const openCamera = () => {
    if (status !== uploadStates.uploading) {
      cameraInputRef.current?.click();
    }
  };

  const openFilePicker = () => {
    if (status !== uploadStates.uploading) {
      fileInputRef.current?.click();
    }
  };

  const isUploading = status === uploadStates.uploading;
  const isSuccess = status === uploadStates.success;
  const isError = status === uploadStates.error;
  const pageStyle = {
    color: uploadConfig.textColor,
    background: `linear-gradient(135deg, ${uploadConfig.backgroundStartColor}, ${uploadConfig.backgroundMiddleColor}, ${uploadConfig.backgroundEndColor})`,
  };
  const mutedTextStyle = { color: uploadConfig.mutedTextColor };
  const cardStyle = { backgroundColor: uploadConfig.cardBackgroundColor };
  const panelStyle = { backgroundColor: uploadConfig.panelBackgroundColor };
  const primaryTextStyle = { color: uploadConfig.primaryColor };
  const iconStyle = {
    background: `linear-gradient(135deg, ${uploadConfig.iconStartColor}, ${uploadConfig.iconEndColor})`,
  };

  return (
    <main
      className="min-h-screen px-5 pb-8 pt-8"
      style={pageStyle}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col">
        <header className="mb-6 text-center">
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]"
            style={mutedTextStyle}
          >
            {uploadConfig.albumLabel || 'Álbum de la boda'}
          </p>
          <h1 className="text-4xl font-bold leading-tight">
            {eventName}
          </h1>
          <p
            className="mx-auto mt-3 max-w-xs text-lg leading-7"
            style={mutedTextStyle}
          >
            {uploadConfig.instructions || 'Toma una foto y se guardará automáticamente en nuestro álbum.'}
          </p>
        </header>

        <section
          className="flex flex-1 flex-col rounded-[2rem] border-2 border-white/80 p-5 shadow-apple-xl backdrop-blur-apple"
          style={cardStyle}
        >
          <button
            type="button"
            onClick={openCamera}
            disabled={isUploading}
            className="flex min-h-[430px] flex-1 flex-col items-center justify-center rounded-[1.5rem] border-2 border-white/80 px-6 py-10 text-center shadow-apple transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
            style={panelStyle}
          >
            <span
              className="mb-7 flex h-28 w-28 items-center justify-center rounded-3xl shadow-apple-lg"
              style={iconStyle}
            >
              <svg
                className="h-16 w-16 text-white"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M14 22.5C14 19.46 16.46 17 19.5 17H25L28 12H39L42 17H45.5C48.54 17 51 19.46 51 22.5V44.5C51 47.54 48.54 50 45.5 50H19.5C16.46 50 14 47.54 14 44.5V22.5Z"
                  fill="currentColor"
                />
                <circle cx="32.5" cy="34" r="10.5" fill="#312e81" opacity="0.25" />
                <circle cx="32.5" cy="34" r="8" stroke="#fff" strokeWidth="4" />
                <circle cx="44.5" cy="24.5" r="3.5" fill="#fff" opacity="0.9" />
              </svg>
            </span>

            <span
              className="text-3xl font-bold"
              style={primaryTextStyle}
            >
              {isSuccess
                ? uploadConfig.anotherPhotoButton || 'Tomar otra foto'
                : uploadConfig.cameraButton || 'Tomar foto'}
            </span>
            <span
              className="mt-4 min-h-[3.5rem] text-lg leading-7"
              style={mutedTextStyle}
            >
              {message || uploadConfig.openCameraMessage || 'Toca aquí para abrir la cámara.'}
            </span>

            {isUploading && (
              <span className="mt-8 h-3 w-40 overflow-hidden rounded-full bg-white/70">
                <span className="block h-full w-2/3 animate-pulse rounded-full bg-indigo-600" />
              </span>
            )}
          </button>

          {isError && (
            <button
              type="button"
              onClick={openCamera}
              className="mt-4 w-full rounded-2xl px-6 py-5 text-lg font-bold text-white shadow-apple active:scale-[0.99]"
              style={{ backgroundColor: uploadConfig.primaryDarkColor }}
            >
              {uploadConfig.retryButton || 'Intentar de nuevo'}
            </button>
          )}

          <button
            type="button"
            onClick={openFilePicker}
            disabled={isUploading}
            className="mt-4 w-full rounded-2xl border border-white/70 px-5 py-4 text-base font-semibold shadow-apple disabled:cursor-wait disabled:opacity-70"
            style={{ ...panelStyle, ...primaryTextStyle }}
          >
            {uploadConfig.selectFileButton || 'Seleccionar archivo'}
          </button>

          <p
            className="mt-4 text-center text-sm leading-6"
            style={mutedTextStyle}
          >
            {uploadConfig.helperText || 'Sin login. Solo toma la foto y listo.'}
          </p>
        </section>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInputChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </main>
  );
}

export default UploadPhotos;
