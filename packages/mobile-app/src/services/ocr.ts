// On-device OCR using ML Kit
// Note: react-native-mlkit-ocr needs to be installed and linked
// For privacy, images never leave the device — only extracted text goes to the API

interface OCRResult {
  text: string;
  blocks: { text: string; lines: { text: string }[] }[];
}

export async function extractTextFromImage(imageUri: string): Promise<string> {
  try {
    // Dynamic import to avoid crash if not installed
    const MlkitOcr = require('react-native-mlkit-ocr');
    const result: OCRResult[] = await MlkitOcr.default.detectFromUri(imageUri);

    if (!result || result.length === 0) {
      return '';
    }

    // Combine all recognized text blocks
    const lines = result
      .flatMap((block: any) => block.lines || [block])
      .map((line: any) => line.text)
      .filter(Boolean);

    return lines.join('\n');
  } catch (error) {
    console.error('OCR error:', error);
    // Fallback: return empty and let user paste manually
    return '';
  }
}
