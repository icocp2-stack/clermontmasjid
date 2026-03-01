interface QuranVerseTheme {
  count: number;
  quranTheme: string;
  verseTheme: string;
  chapter: number;
  verse: number;
  verseText?: string;
  translation?: string;
}

export async function fetchVerseText(chapter: number, verse: number): Promise<{ arabic: string; translation: string }> {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${chapter}:${verse}/editions/quran-uthmani,en.sahih`);
    const data = await response.json();

    if (data.code === 200 && data.data) {
      return {
        arabic: data.data[0].text,
        translation: data.data[1].text
      };
    }

    throw new Error('Failed to fetch verse');
  } catch (error) {
    console.error('Error fetching verse:', error);
    return {
      arabic: '',
      translation: ''
    };
  }
}

export async function fetchMultipleVerses(verses: Array<{ chapter: number; verse: number }>): Promise<Map<string, { arabic: string; translation: string }>> {
  const verseMap = new Map<string, { arabic: string; translation: string }>();

  for (const { chapter, verse } of verses) {
    const key = `${chapter}:${verse}`;
    const verseData = await fetchVerseText(chapter, verse);
    verseMap.set(key, verseData);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return verseMap;
}
