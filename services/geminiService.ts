
import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfessionalPhoto = async (
  image: ImageData,
  userPrompt: string
): Promise<{ newImage: ImageData | null; textResponse: string | null }> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const basePrompt = `Given the user-uploaded product image, transform it into a professional, high-quality product photograph suitable for e-commerce. 
    - The background should be clean, minimalist, and non-distracting. Use a soft, neutral-colored surface or a subtle gradient.
    - Enhance the lighting to be bright and even, highlighting the product's features without harsh shadows.
    - Improve color balance and saturation to make the product look appealing and true-to-life.
    - Ensure the final image is crisp and high-resolution.
    - Do not add any text or watermarks.
    - Focus only on improving the existing product image on a better background.
    - User's specific request: "${userPrompt}"`;
    
    const imagePart = {
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType,
      },
    };

    const textPart = {
      text: basePrompt,
    };
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let newImage: ImageData | null = null;
    let textResponse: string | null = null;

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                newImage = {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                    name: 'generated_product_photo.png',
                };
            } else if (part.text) {
                textResponse = part.text;
            }
        }
    }

    if (!newImage) {
        throw new Error("AI did not return an image. Please try again with a different image or prompt.");
    }
    
    return { newImage, textResponse };

  } catch (error) {
    console.error("Error generating professional photo:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate photo: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the photo.");
  }
};
