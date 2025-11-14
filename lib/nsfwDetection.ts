import * as nsfwjs from "nsfwjs";

let model: nsfwjs.NSFWJS | null = null;

/**
 * Load the NSFW detection model
 * Call this once when the app starts or when needed
 */
export async function loadNSFWModel(): Promise<nsfwjs.NSFWJS> {
  if (model) return model;

  try {
    // Load the model (uses CDN, no download needed)
    model = await nsfwjs.load();
    console.log("NSFW model loaded successfully");
    return model;
  } catch (error) {
    console.error("Error loading NSFW model:", error);
    throw error;
  }
}

/**
 * Check if an image contains NSFW content
 * @param imageElement - HTMLImageElement or HTMLVideoElement
 * @returns Object with classification results and isSafe flag
 */
export async function checkImageSafety(
  imageElement: HTMLImageElement | HTMLVideoElement
): Promise<{
  isSafe: boolean;
  predictions: Array<{ className: string; probability: number }>;
  message: string;
}> {
  try {
    // Load model if not already loaded
    const nsfwModel = await loadNSFWModel();

    // Classify the image
    const predictions = await nsfwModel.classify(imageElement);

    // Predictions are returned in order of probability
    // Classes: Porn, Sexy, Hentai, Neutral, Drawing

    // Find probabilities for unsafe categories
    const pornProb = predictions.find(p => p.className === "Porn")?.probability || 0;
    const sexyProb = predictions.find(p => p.className === "Sexy")?.probability || 0;
    const hentaiProb = predictions.find(p => p.className === "Hentai")?.probability || 0;

    // Define thresholds (adjustable based on your needs)
    const PORN_THRESHOLD = 0.3;    // 30% confidence for porn
    const SEXY_THRESHOLD = 0.5;     // 50% confidence for sexy
    const HENTAI_THRESHOLD = 0.3;   // 30% confidence for hentai

    // Check if image is unsafe
    const isPorn = pornProb > PORN_THRESHOLD;
    const isSexy = sexyProb > SEXY_THRESHOLD;
    const isHentai = hentaiProb > HENTAI_THRESHOLD;

    const isSafe = !isPorn && !isSexy && !isHentai;

    let message = "";
    if (!isSafe) {
      if (isPorn) {
        message = "Explicit adult content detected. Please upload an appropriate image.";
      } else if (isHentai) {
        message = "Inappropriate content detected. Please upload an appropriate image.";
      } else if (isSexy) {
        message = "Suggestive content detected. Please upload a more appropriate image.";
      }
    } else {
      message = "Image is safe to upload.";
    }

    console.log("NSFW Detection Results:", predictions);
    console.log(`Image is ${isSafe ? "SAFE" : "UNSAFE"}: ${message}`);

    return {
      isSafe,
      predictions,
      message,
    };
  } catch (error) {
    console.error("Error checking image safety:", error);
    // In case of error, return safe (fail open) or you can fail closed
    return {
      isSafe: true, // Change to false if you want to reject on error
      predictions: [],
      message: "Unable to verify image safety. Proceeding with caution.",
    };
  }
}

/**
 * Check if a File contains NSFW content
 * @param file - Image file to check
 * @returns Object with classification results and isSafe flag
 */
export async function checkFileSafety(file: File): Promise<{
  isSafe: boolean;
  predictions: Array<{ className: string; probability: number }>;
  message: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const img = new Image();

      img.onload = async () => {
        try {
          const result = await checkImageSafety(img);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if a URL contains NSFW content
 * @param imageUrl - URL of the image to check
 * @returns Object with classification results and isSafe flag
 */
export async function checkUrlSafety(imageUrl: string): Promise<{
  isSafe: boolean;
  predictions: Array<{ className: string; probability: number }>;
  message: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS

    img.onload = async () => {
      try {
        const result = await checkImageSafety(img);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image from URL"));
    };

    img.src = imageUrl;
  });
}
