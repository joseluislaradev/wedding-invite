import React, { useEffect, useRef, useState } from 'react';
import siteConfig from '../siteConfig';

const uploadStates = {
  idle: 'idle',
  preparing: 'preparing',
  uploading: 'uploading',
  success: 'success',
  error: 'error',
};

const MAX_IMAGE_DIMENSION = 1920;
const INITIAL_JPEG_QUALITY = 0.8;
const MIN_JPEG_QUALITY = 0.65;
const QUALITY_STEP = 0.05;

function UploadPhotos() {
  const [status, setStatus] = useState(uploadStates.idle);
  const [message, setMessage] = useState('');
  const [sheetConfig, setSheetConfig] = useState(null);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    successCount: 0,
    failedFiles: [],
  });
  const [retryFiles, setRetryFiles] = useState([]);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const localUploadConfig = siteConfig.uploadPhotos || {};
  const isUsingSheetConfig = sheetConfig !== null;
  const uploadConfig = isUsingSheetConfig ? sheetConfig : localUploadConfig;

  const getConfigValue = (key, fallback = '') => {
    if (isUsingSheetConfig) {
      return Object.prototype.hasOwnProperty.call(sheetConfig, key) ? sheetConfig[key] : '';
    }

    return localUploadConfig[key] ?? fallback;
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
        if (isMounted) {
          setSheetConfig(null);
        }
      }
    };

    loadSheetConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const eventName =
    getConfigValue('eventName') ||
    getConfigValue('title') ||
    (isUsingSheetConfig ? '' : siteConfig.couple?.displayName || siteConfig.app?.name || 'Nuestra boda');

  const formatTemplate = (template, values) => (
    Object.entries(values).reduce(
      (text, [key, value]) => text.replaceAll(`{${key}}`, value),
      template
    )
  );

  const getMaxCompressedSize = () => {
    const maxFileSize = Number(uploadConfig.maxFileSize || localUploadConfig.maxFileSize || 4);
    return {
      maxFileSize,
      maxSizeBytes: maxFileSize * 1024 * 1024,
    };
  };

  const validateFileType = (file) => {
    const allowedTypes = uploadConfig.allowedTypes || localUploadConfig.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!file) {
      return getConfigValue('noFileMessage', 'No se seleccionó ninguna foto.');
    }

    if (!allowedTypes.includes(file.type)) {
      return getConfigValue('invalidTypeMessage', 'Ese formato de imagen no es compatible.');
    }

    return '';
  };

  const loadImage = (file) => new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(getConfigValue('compressionFailedMessage', 'No se pudo preparar la foto.')));
    };
    image.src = objectUrl;
  });

  const canvasToBlob = (canvas, quality) => new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  const compressImage = async (file) => {
    const image = await loadImage(file);
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const { maxFileSize, maxSizeBytes } = getMaxCompressedSize();

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    for (
      let quality = INITIAL_JPEG_QUALITY;
      quality >= MIN_JPEG_QUALITY - 0.001;
      quality -= QUALITY_STEP
    ) {
      const blob = await canvasToBlob(canvas, Number(quality.toFixed(2)));

      if (!blob) {
        throw new Error(getConfigValue('compressionFailedMessage', 'No se pudo preparar la foto.'));
      }

      if (blob.size <= maxSizeBytes) {
        const originalName = file.name.replace(/\.[^.]+$/, '');
        return new File([blob], `${originalName || 'foto-boda'}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
      }
    }

    throw new Error(formatTemplate(
      getConfigValue('compressedFileTooLargeMessage', 'La foto sigue siendo muy grande después de comprimirla. Máximo {maxFileSize} MB.'),
      { maxFileSize }
    ));
  };

  const uploadSinglePhoto = async (file) => {
    const formData = new FormData();
    formData.append('images', file);

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

    return result;
  };

  const uploadFiles = async (selectedFiles) => {
    const files = Array.from(selectedFiles || []);
    const totalFiles = files.length;
    let successCount = 0;
    const failedFiles = [];

    setRetryFiles([]);

    if (totalFiles === 0) {
      setStatus(uploadStates.error);
      setMessage(getConfigValue('noFileMessage', 'No se seleccionó ninguna foto.'));
      return;
    }

    setProgress({ current: 0, total: totalFiles, successCount: 0, failedFiles: [] });

    for (let index = 0; index < totalFiles; index += 1) {
      const file = files[index];
      const current = index + 1;
      const typeError = validateFileType(file);

      if (typeError) {
        failedFiles.push({ file, name: file?.name || `Foto ${current}`, reason: typeError });
        setProgress({ current, total: totalFiles, successCount, failedFiles: [...failedFiles] });
        continue;
      }

      try {
        setStatus(uploadStates.preparing);
        setProgress({ current, total: totalFiles, successCount, failedFiles: [...failedFiles] });
        setMessage(totalFiles === 1
          ? getConfigValue('preparingMessage', 'Preparando foto...')
          : formatTemplate(
            getConfigValue('preparingMultipleMessage', 'Preparando {current} de {total}...'),
            { current, total: totalFiles }
          ));

        const compressedFile = await compressImage(file);

        setStatus(uploadStates.uploading);
        setMessage(totalFiles === 1
          ? getConfigValue('uploadingMessage', 'Subiendo tu foto...')
          : formatTemplate(
            getConfigValue('uploadingMultipleMessage', 'Subiendo {current} de {total} fotos...'),
            { current, total: totalFiles }
          ));

        await uploadSinglePhoto(compressedFile);
        successCount += 1;
        setProgress({ current, total: totalFiles, successCount, failedFiles: [...failedFiles] });
      } catch (error) {
        console.error('Error processing photo upload:', error);
        failedFiles.push({
          file,
          name: file?.name || `Foto ${current}`,
          reason: error.message || getConfigValue('errorMessage', 'No se pudo subir la foto. Intenta otra vez.'),
        });
        setProgress({ current, total: totalFiles, successCount, failedFiles: [...failedFiles] });
      }
    }

    setRetryFiles(failedFiles.map((failedFile) => failedFile.file).filter(Boolean));

    if (totalFiles === 1 && successCount === 1) {
      setStatus(uploadStates.success);
      setMessage(getConfigValue('successMessage', '¡Gracias! Tu foto fue guardada.'));
      return;
    }

    const summary = formatTemplate(
      getConfigValue('multiUploadSummaryMessage', 'Se subieron {successCount} de {total} fotos.'),
      { successCount, total: totalFiles }
    );

    setStatus(failedFiles.length > 0 ? uploadStates.error : uploadStates.success);
    setMessage(summary);
  };

  const handleInputChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';
    uploadFiles(selectedFiles);
  };

  const openCamera = () => {
    if (status !== uploadStates.preparing && status !== uploadStates.uploading) {
      cameraInputRef.current?.click();
    }
  };

  const openFilePicker = () => {
    if (status !== uploadStates.preparing && status !== uploadStates.uploading) {
      fileInputRef.current?.click();
    }
  };

  const retryFailedUploads = () => {
    if (retryFiles.length > 0) {
      uploadFiles(retryFiles);
    } else {
      openCamera();
    }
  };

  const isPreparing = status === uploadStates.preparing;
  const isUploading = status === uploadStates.uploading;
  const isBusy = isPreparing || isUploading;
  const isSuccess = status === uploadStates.success;
  const isError = status === uploadStates.error;
  const albumLabel = getConfigValue('albumLabel', 'Álbum de la boda');
  const instructions = getConfigValue(
    'instructions',
    'Toma una foto y se guardará automáticamente en nuestro álbum.'
  );
  const cameraButton = getConfigValue('cameraButton', 'Tomar foto');
  const anotherPhotoButton = getConfigValue('anotherPhotoButton', 'Tomar otra foto');
  const openCameraMessage = getConfigValue('openCameraMessage', 'Toca aquí para abrir la cámara.');
  const retryButton = getConfigValue('retryButton', 'Intentar de nuevo');
  const selectFileButton = getConfigValue('selectFileButton', 'Seleccionar archivo');
  const helperText = getConfigValue('helperText', 'Sin login. Solo toma la foto y listo.');
  const hasHeaderText = Boolean(albumLabel || eventName || instructions);
  const progressText = progress.total > 1
    ? formatTemplate(
      getConfigValue('progressCountMessage', '{successCount} de {total} subidas'),
      { successCount: progress.successCount, total: progress.total }
    )
    : '';
  const pageStyle = {
    color: getConfigValue('textColor', '#1c1c1e'),
    background: `linear-gradient(135deg, ${getConfigValue('backgroundStartColor', '#e0f2fe')}, ${getConfigValue('backgroundMiddleColor', '#ede9fe')}, ${getConfigValue('backgroundEndColor', '#f5d0fe')})`,
  };
  const mutedTextStyle = { color: getConfigValue('mutedTextColor', '#636366') };
  const cardStyle = { backgroundColor: getConfigValue('cardBackgroundColor', 'rgba(255,255,255,0.45)') };
  const panelStyle = { backgroundColor: getConfigValue('panelBackgroundColor', 'rgba(255,255,255,0.35)') };
  const primaryTextStyle = { color: getConfigValue('primaryColor', '#4338ca') };
  const iconStyle = {
    background: `linear-gradient(135deg, ${getConfigValue('iconStartColor', '#22d3ee')}, ${getConfigValue('iconEndColor', '#c026d3')})`,
  };
  const errorBoxStyle = {
    backgroundColor: getConfigValue('errorBackgroundColor', '#fef2f2'),
    borderColor: getConfigValue('errorBorderColor', '#fecaca'),
    color: getConfigValue('errorTextColor', '#b91c1c'),
  };
  const errorLabelStyle = {
    color: getConfigValue('errorLabelColor', '#ef4444'),
  };

  return (
    <main
      className="min-h-screen px-5 pb-8 pt-8"
      style={pageStyle}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col">
        {hasHeaderText && (
          <header className="mb-6 text-center">
            {albumLabel && (
              <p
                className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]"
                style={mutedTextStyle}
              >
                {albumLabel}
              </p>
            )}
            {eventName && (
              <h1 className="text-4xl font-bold leading-tight">
                {eventName}
              </h1>
            )}
            {instructions && (
              <p
                className="mx-auto mt-3 max-w-xs text-lg leading-7"
                style={mutedTextStyle}
              >
                {instructions}
              </p>
            )}
          </header>
        )}

        <section
          className="flex flex-1 flex-col rounded-[2rem] border-2 border-white/80 p-5 shadow-apple-xl backdrop-blur-apple"
          style={cardStyle}
        >
          <button
            type="button"
            onClick={openCamera}
            disabled={isBusy}
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
              {isSuccess ? anotherPhotoButton : cameraButton}
            </span>
            {(message || openCameraMessage) && (
              isError ? (
                <span
                  className="mt-5 max-w-xs rounded-2xl border px-4 py-3 text-base font-semibold leading-6"
                  style={errorBoxStyle}
                >
                  <span
                    className="block text-xs font-bold uppercase tracking-[0.14em]"
                    style={errorLabelStyle}
                  >
                    Error
                  </span>
                  {message}
                  {progress.failedFiles.length > 0 && (
                    <span className="mt-3 block text-left text-sm font-medium leading-5">
                      {progress.failedFiles.slice(0, 3).map((failedFile) => (
                        <span key={`${failedFile.name}-${failedFile.reason}`} className="block">
                          {failedFile.name}: {failedFile.reason}
                        </span>
                      ))}
                      {progress.failedFiles.length > 3 && (
                        <span className="block">
                          {formatTemplate(
                            getConfigValue('moreFailedFilesMessage', 'Y {count} más.'),
                            { count: progress.failedFiles.length - 3 }
                          )}
                        </span>
                      )}
                    </span>
                  )}
                </span>
              ) : (
                <span
                  className="mt-4 text-lg leading-7"
                  style={mutedTextStyle}
                >
                  {message || openCameraMessage}
                </span>
              )
            )}

            {isBusy && (
              <span className="mt-8 flex w-full max-w-[12rem] flex-col items-center gap-2">
                <span className="h-3 w-full overflow-hidden rounded-full bg-white/70">
                  <span
                    className="block h-full rounded-full bg-indigo-600 transition-all"
                    style={{
                      width: progress.total > 0
                        ? `${Math.max(8, Math.round((progress.current / progress.total) * 100))}%`
                        : '50%',
                    }}
                  />
                </span>
                {progressText && (
                  <span className="text-sm font-semibold" style={mutedTextStyle}>
                    {progressText}
                  </span>
                )}
              </span>
            )}
          </button>

          {isError && retryButton && (
            <button
              type="button"
              onClick={retryFailedUploads}
              className="mt-4 w-full rounded-2xl px-6 py-5 text-lg font-bold text-white shadow-apple active:scale-[0.99]"
              style={{ backgroundColor: getConfigValue('primaryDarkColor', '#111827') }}
            >
              {retryButton}
            </button>
          )}

          {selectFileButton && (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isBusy}
              className="mt-4 w-full rounded-2xl border border-white/70 px-5 py-4 text-base font-semibold shadow-apple disabled:cursor-wait disabled:opacity-70"
              style={{ ...panelStyle, ...primaryTextStyle }}
            >
              {selectFileButton}
            </button>
          )}

          {helperText && (
            <p
              className="mt-4 text-center text-sm leading-6"
              style={mutedTextStyle}
            >
              {helperText}
            </p>
          )}
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
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </main>
  );
}

export default UploadPhotos;
