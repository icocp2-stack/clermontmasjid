import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface VerseData {
  count: number;
  quran_theme: string;
  verse_theme: string;
  chapter: number;
  verse: number;
  verse_text_translation: string;
}

export function DailyVerseCard() {
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDailyVerses();
  }, []);

  const loadDailyVerses = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date('2026-01-28');
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const verseCount1 = (daysSinceStart % 67) + 1;
      const verseCount2 = ((daysSinceStart + 1) % 67) + 1;

      const { data, error } = await supabase
        .from('quran_verses_themes')
        .select('count, quran_theme, verse_theme, chapter, verse, verse_text_translation')
        .in('count', [verseCount1, verseCount2])
        .order('count', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setVerses(data);
      }
    } catch (error) {
      console.error('Error loading daily verses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const highlightVerseTheme = (text: string, theme: string): JSX.Element => {
    if (!text || !theme) {
      return <span>{text}</span>;
    }

    const themeWords = theme.split(/[-\s]+/).filter(word => word.length > 2);

    const pattern = themeWords.join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) => {
          const isMatch = themeWords.some(
            word => part.toLowerCase() === word.toLowerCase()
          );

          if (isMatch) {
            return (
              <span
                key={index}
                className="bg-yellow-300 text-gray-900 px-1 italic font-semibold"
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="mt-3 md:mt-4 p-4 md:p-6 bg-slate-800/50 rounded-lg border border-slate-700 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
        </div>
      </div>
    );
  }

  if (verses.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 md:mt-4 p-4 md:p-6 bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-800/70 rounded-lg border border-teal-700/50 shadow-lg">
      <h2 className="text-amber-200 font-bold text-lg md:text-xl mb-2 text-center tracking-wide">
        Verse of the Day
      </h2>

      <h3 className="text-white font-semibold text-base md:text-lg mb-4 text-center">
        How the Quran itself reveals its Value and Trust
      </h3>

      {verses.map((verse, index) => (
        <div key={verse.count} className={index > 0 ? 'mt-6 pt-6 border-t border-slate-600/50' : ''}>
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{verse.count}</span>
            </div>
            <div className="flex-1">
              <p className="text-amber-200 font-semibold text-base md:text-lg">
                {verse.verse_theme}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Surah {verse.chapter}, Verse {verse.verse}
              </p>
            </div>
          </div>

          <div className="pl-0 md:pl-13">
            <p className="text-white leading-relaxed text-sm md:text-base">
              {highlightVerseTheme(verse.verse_text_translation, verse.verse_theme)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
