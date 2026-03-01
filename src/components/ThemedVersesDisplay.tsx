import { useState, useEffect } from 'react';
import { BookOpen, Tag, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VerseTheme {
  id: string;
  count: number;
  quran_theme: string;
  verse_theme: string;
  chapter: number;
  verse: number;
  verse_text_arabic: string;
  verse_text_translation: string;
}

export function ThemedVersesDisplay() {
  const [verses, setVerses] = useState<VerseTheme[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quran_verses_themes')
        .select('*')
        .order('count', { ascending: true });

      if (error) throw error;

      if (data) {
        setVerses(data);
        const uniqueThemes = Array.from(new Set(data.map(v => v.quran_theme)));
        setThemes(uniqueThemes);
      }
    } catch (error) {
      console.error('Error loading verses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVerses = verses.filter(verse => {
    const matchesTheme = selectedTheme === 'all' || verse.quran_theme === selectedTheme;
    const matchesSearch = searchQuery === '' ||
      verse.verse_theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verse.verse_text_translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (verses.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-xl shadow-lg">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No verses imported yet</h3>
        <p className="text-gray-500">Use the importer above to add verses from your Excel file.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Verses
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by theme or translation..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Theme
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Themes ({verses.length})</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>
                  {theme} ({verses.filter(v => v.quran_theme === theme).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Tag className="w-4 h-4" />
          <span>Showing {filteredVerses.length} of {verses.length} verses</span>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredVerses.map((verse) => (
          <div key={verse.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-700 font-bold">{verse.count}</span>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                    {verse.quran_theme}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {verse.verse_theme}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    Surah {verse.chapter}:{verse.verse}
                  </span>
                </div>

                {verse.verse_text_arabic && (
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
                    <p className="text-right text-2xl leading-loose font-arabic text-gray-800">
                      {verse.verse_text_arabic}
                    </p>
                  </div>
                )}

                {verse.verse_text_translation && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {verse.verse_text_translation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVerses.length === 0 && (
        <div className="text-center p-12 bg-white rounded-xl shadow-lg">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No verses found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
