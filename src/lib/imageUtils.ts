// Image compression utility for storing images as base64 in Firestore
// Firestore has a 1MB document limit, so we need to compress images

export async function compressImage(
  base64Image: string,
  maxWidth: number = 400,
  maxHeight: number = 533,
  quality: number = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Create canvas and draw compressed image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Use better image smoothing for quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      
      console.log(
        `Image compressed: ${Math.round(base64Image.length / 1024)}KB -> ${Math.round(compressedBase64.length / 1024)}KB`
      );
      
      resolve(compressedBase64);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for compression"));
    };

    img.src = base64Image;
  });
}

// Check if a base64 string is within Firestore document size limits
// Firestore limit is 1MB, but we should stay well under for other fields
export function isImageSizeAcceptable(base64Image: string, maxSizeKB: number = 500): boolean {
  const sizeKB = base64Image.length / 1024;
  return sizeKB <= maxSizeKB;
}

// Compress image until it fits within size limit
export async function compressImageToFit(
  base64Image: string,
  maxSizeKB: number = 400
): Promise<string> {
  let compressed = base64Image;
  let quality = 0.7;
  let maxDimension = 400;
  
  while (!isImageSizeAcceptable(compressed, maxSizeKB) && quality > 0.1) {
    compressed = await compressImage(base64Image, maxDimension, maxDimension * 1.33, quality);
    
    if (isImageSizeAcceptable(compressed, maxSizeKB)) {
      break;
    }
    
    // Reduce quality and dimensions for next iteration
    quality -= 0.1;
    maxDimension = Math.max(200, maxDimension - 50);
  }
  
  return compressed;
}
