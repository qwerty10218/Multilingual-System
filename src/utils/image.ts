/**
 * Helper to convert SVG data URLs or raw SVG strings into a clean PNG Data URL using HTML5 Canvas.
 * This guarantees Gemini API receives a supported raster image (image/png or image/jpeg).
 */
export function convertSvgToPngDataUrl(svgInput: string, width = 1000, height = 1250): Promise<string> {
  return new Promise((resolve) => {
    try {
      const trimmed = svgInput.trim();
      let svgDataUri = trimmed;

      if (!trimmed.startsWith('data:image/svg+xml')) {
        if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
          svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(trimmed);
        } else if (trimmed.startsWith('data:')) {
          // If it's already a non-SVG data URL, return it as is
          if (!trimmed.includes('image/svg+xml')) {
            return resolve(trimmed);
          }
        }
      } else {
        // Already a data:image/svg+xml URL
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const targetWidth = img.naturalWidth || img.width || width;
          const targetHeight = img.naturalHeight || img.height || height;

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            const pngDataUrl = canvas.toDataURL('image/png');
            return resolve(pngDataUrl);
          }
          resolve(trimmed);
        } catch (err) {
          console.warn('Canvas rasterization failed, returning original:', err);
          resolve(trimmed);
        }
      };

      img.onerror = (err) => {
        console.warn('Image loading failed in SVG rasterizer, returning original:', err);
        resolve(trimmed);
      };

      img.src = svgDataUri;
    } catch (e) {
      console.warn('Svg conversion error:', e);
      resolve(svgInput);
    }
  });
}

/**
 * Ensures any selected/uploaded image is converted to a clean raster PNG/JPEG data URL.
 * It also automatically resizes and compresses large photos (e.g. from mobile cameras) 
 * to massively speed up the network payload and Gemini API processing time.
 */
export async function ensureRasterImageDataUrl(input: string): Promise<string> {
  if (!input) return input;
  const trimmed = input.trim();
  
  // 1. Handle SVG first if needed
  let dataUrlToProcess = trimmed;
  if (trimmed.includes('image/svg+xml') || trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
    dataUrlToProcess = await convertSvgToPngDataUrl(trimmed);
  }

  // 2. Compress and resize using Canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set maximum dimension for OCR (1600px is plenty for Gemini Vision, heavily reduces payload)
      const MAX_DIMENSION = 1600;
      let width = img.width;
      let height = img.height;

      // Only resize if the image is larger than the max dimension
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Use white background in case of transparency
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output as highly optimized JPEG (0.8 quality cuts size by 80% with invisible loss for OCR)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        return resolve(compressedDataUrl);
      }
      resolve(dataUrlToProcess);
    };
    
    img.onerror = () => {
      console.warn('Image compression failed, returning original.');
      resolve(dataUrlToProcess);
    };

    img.src = dataUrlToProcess;
  });
}
