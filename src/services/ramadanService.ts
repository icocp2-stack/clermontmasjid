import { toHijri, toGregorian } from 'hijri-converter';
import { supabase } from '../lib/supabase';

export interface RamadanDates {
  startDate: Date;
  endDate: Date;
  year: number;
}

export interface RamadanInfo {
  isRamadan: boolean;
  currentDay: number;
  totalDays: number;
  remainingDays: number;
  daysUntilRamadan: number;
  ramadanDates: RamadanDates;
  currentHijriDate: { year: number; month: number; day: number };
}

export interface RamadanVerse {
  arabic: string;
  translation: string;
  reference: string;
  theme?: string;
  progress?: string;
  mysteryMessage?: string;
  revelationMessage?: string;
}

export function getRamadanDates(year: number): RamadanDates {
  const ramadanStart = toGregorian(year, 9, 1);
  const ramadanEnd = toGregorian(year, 9, 29);

  return {
    startDate: new Date(ramadanStart.gy, ramadanStart.gm - 1, ramadanStart.gd),
    endDate: new Date(ramadanEnd.gy, ramadanEnd.gm - 1, ramadanEnd.gd),
    year
  };
}

export function getCurrentRamadanInfo(currentDate: Date = new Date()): RamadanInfo {
  const hijriDate = toHijri(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate()
  );

  const currentRamadan = getRamadanDates(hijriDate.hy);
  const nextRamadan = getRamadanDates(hijriDate.hy + 1);

  const isRamadan = hijriDate.hm === 9;
  const currentDay = isRamadan ? hijriDate.hd : 0;
  const totalDays = 29;
  const remainingDays = isRamadan ? totalDays - currentDay : 0;

  let daysUntilRamadan = 0;
  if (!isRamadan) {
    const now = currentDate.getTime();
    const ramadanStart = currentRamadan.startDate.getTime();

    if (now < ramadanStart) {
      daysUntilRamadan = Math.ceil((ramadanStart - now) / (1000 * 60 * 60 * 24));
    } else {
      const nextRamadanStart = nextRamadan.startDate.getTime();
      daysUntilRamadan = Math.ceil((nextRamadanStart - now) / (1000 * 60 * 60 * 24));
    }
  }

  return {
    isRamadan,
    currentDay,
    totalDays,
    remainingDays,
    daysUntilRamadan,
    ramadanDates: isRamadan || currentDate < currentRamadan.startDate ? currentRamadan : nextRamadan,
    currentHijriDate: hijriDate
  };
}

export function getLaylatAlQadrProbabilities(currentDay: number): { day: number; probability: number; isToday: boolean }[] {
  const oddNights = [21, 23, 25, 27, 29];
  const probabilities: { [key: number]: number } = {
    21: 15,
    23: 20,
    25: 25,
    27: 30,
    29: 10
  };

  return oddNights.map(day => ({
    day,
    probability: probabilities[day],
    isToday: currentDay === day
  }));
}

export interface HistoricalEvent {
  day: number;
  title: string;
  description: string;
  year?: string;
}

export function getRamadanHistoricalEvents(): HistoricalEvent[] {
  return [
    {
      day: 1,
      title: 'Start of Ramadan',
      description: 'The blessed month of fasting begins'
    },
    {
      day: 10,
      title: 'Passing of Khadijah (RA)',
      description: 'The beloved wife of Prophet Muhammad (PBUH) passed away',
      year: '619 CE'
    },
    {
      day: 15,
      title: 'Birth of Imam Hassan (RA)',
      description: 'Grandson of Prophet Muhammad (PBUH) was born',
      year: '625 CE'
    },
    {
      day: 17,
      title: 'Battle of Badr',
      description: 'The first major battle in Islamic history',
      year: '624 CE / 2 AH'
    },
    {
      day: 19,
      title: 'Conquest of Makkah',
      description: 'Muslims peacefully conquered Makkah',
      year: '630 CE / 8 AH'
    },
    {
      day: 21,
      title: 'Martyrdom of Ali (RA)',
      description: 'Fourth Caliph was martyred',
      year: '661 CE / 40 AH'
    },
    {
      day: 27,
      title: 'Laylat al-Qadr',
      description: 'The Night of Power - when the Quran was first revealed',
      year: '610 CE'
    }
  ];
}

export async function getRamadanVerseForDay(day: number): Promise<RamadanVerse> {
  // Days 1-25: Sequential verses from database
  if (day >= 1 && day <= 25) {
    const { data, error } = await supabase
      .from('ramadan_verses')
      .select('arabic_text, english_translation, theme, reference')
      .eq('day_number', day)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching Ramadan verse:', error);
      return getFallbackVerse(day);
    }

    return {
      arabic: data.arabic_text,
      translation: data.english_translation,
      reference: data.reference,
      theme: data.theme,
      progress: `Verse ${day} of 25: Journey towards a new knowledge`,
      mysteryMessage: getMysteryMessage()
    };
  }

  // Days 26-30: Reveal the Ibn Arabi knowledge with Al-Fatihah and 15:87
  if (day >= 26 && day <= 30) {
    return getRevelationVerse(day);
  }

  // Fallback for invalid days
  return getFallbackVerse(1);
}

function getMysteryMessage(): string {
  return "Reflect deeply upon each verse. At the completion of this journey, you will be blessed with Laduni Knowledge - the sacred wisdom of numbers that the great scholar Ibn Arabi unveiled to those who seek. Patience in this path reveals what the hasty overlook.";
}

function getRevelationVerse(day: number): RamadanVerse {
  const revelationMessage = `
    You have completed the journey of 25 verses. Now witness the sacred numerology taught by Ibn Arabi:

    25 verses → 2 + 5 = 7

    The number 7 points to Surah Al-Fatihah, known as "As-Sab'ul-Mathani" (The Seven Oft-Repeated),
    and to Surah 15:87 which declares: "And We have certainly given you seven of the often repeated
    [verses] and the great Quran."

    This is Laduni Knowledge - divine wisdom revealed through the language of numbers,
    showing how the Quran's structure itself is a miracle. The 25 verses of Ramadan reduce to 7,
    pointing us back to the foundation of all prayer and the essence of revelation.
  `;

  // Alternate between Al-Fatihah verses and Surah 15:87
  if (day === 26) {
    return {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      reference: 'Quran 1:1 - Al-Fatihah',
      theme: 'The Opening - First of the Seven Oft-Repeated',
      revelationMessage
    };
  }

  if (day === 27) {
    return {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      translation: 'All praise is due to Allah, Lord of the worlds.',
      reference: 'Quran 1:2 - Al-Fatihah',
      theme: 'Praise to the Lord of All Worlds',
      revelationMessage
    };
  }

  if (day === 28) {
    return {
      arabic: 'وَلَقَدْ آتَيْنَاكَ سَبْعًا مِّنَ الْمَثَانِي وَالْقُرْآنَ الْعَظِيمَ',
      translation: 'And We have certainly given you, [O Muhammad], seven of the often repeated [verses] and the great Quran.',
      reference: 'Quran 15:87',
      theme: 'The Seven Oft-Repeated Verses',
      revelationMessage
    };
  }

  if (day === 29) {
    return {
      arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
      translation: 'The Entirely Merciful, the Especially Merciful.',
      reference: 'Quran 1:3 - Al-Fatihah',
      theme: 'Divine Mercy',
      revelationMessage
    };
  }

  // Day 30
  return {
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    translation: 'Sovereign of the Day of Recompense.',
    reference: 'Quran 1:4 - Al-Fatihah',
    theme: 'Master of the Day of Judgment',
    revelationMessage
  };
}

function getFallbackVerse(day: number): RamadanVerse {
  return {
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    translation: 'O you who have believed, fasting is prescribed for you as it was prescribed for those before you that you may become righteous.',
    reference: 'Quran 2:183',
    theme: 'Prescription of Fasting',
    progress: day <= 25 ? `Verse ${day} of 25: Journey towards a new knowledge` : undefined
  };
}

export interface DuaText {
  arabic: string;
  transliteration: string;
  translation: string;
}

export function getSehriDua(): DuaText {
  return {
    arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: 'Wa bisawmi ghadinn nawaiytu min shahri ramadan',
    translation: 'I intend to keep the fast for tomorrow in the month of Ramadan'
  };
}

export function getIftarDua(): DuaText {
  return {
    arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: 'Allahumma inni laka sumtu wa bika aamantu wa \'alayka tawakkaltu wa \'ala rizq-ika-aftartu',
    translation: 'O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance'
  };
}
