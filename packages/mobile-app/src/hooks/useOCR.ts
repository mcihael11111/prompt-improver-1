import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { extractTextFromImage } from '../services/ocr';

export function useOCR() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAndExtract = useCallback(async (): Promise<string | null> => {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission required');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    setProcessing(true);
    try {
      const text = await extractTextFromImage(result.assets[0].uri);
      if (!text) {
        setError('Could not extract text from image. Try pasting the conversation instead.');
        return null;
      }
      return text;
    } catch (e: any) {
      setError(e.message || 'OCR failed');
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  return { pickAndExtract, processing, error };
}
