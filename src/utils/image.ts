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
 * Ensures any selected/uploaded image is converted to a clean raster PNG/JPEG data URL if it is SVG.
 */
export async function ensureRasterImageDataUrl(input: string): Promise<string> {
  if (!input) return input;
  const trimmed = input.trim();
  if (trimmed.includes('image/svg+xml') || trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
    return await convertSvgToPngDataUrl(trimmed);
  }
  return trimmed;
}
