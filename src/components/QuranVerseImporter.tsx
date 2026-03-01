import { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchVerseText } from '../services/quranData';

interface ParsedVerse {
  count: number;
  quranTheme: string;
  verseTheme: string;
  chapter: number;
  verse: number;
}

export function QuranVerseImporter() {
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  const parseCSV = (text: string): ParsedVerse[] => {
    const lines = text.trim().split('\n');
    const verses: ParsedVerse[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const delimiter = line.includes('\t') ? '\t' : ',';
      const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));

      if (parts.length >= 5) {
        verses.push({
          count: parseInt(parts[0]) || i,
          quranTheme: parts[1],
          verseTheme: parts[2],
          chapter: parseInt(parts[3]),
          verse: parseInt(parts[4])
        });
      }
    }

    return verses;
  };

  const importVerses = async () => {
    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const verses = parseCSV(csvText);

      if (verses.length === 0) {
        setError('No valid verses found in the data');
        setIsProcessing(false);
        return;
      }

      setProgress({ current: 0, total: verses.length });

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < verses.length; i++) {
        const verse = verses[i];
        setProgress({ current: i + 1, total: verses.length });

        try {
          const { arabic, translation } = await fetchVerseText(verse.chapter, verse.verse);

          const { error: insertError } = await supabase
            .from('quran_verses_themes')
            .insert({
              count: verse.count,
              quran_theme: verse.quranTheme,
              verse_theme: verse.verseTheme,
              chapter: verse.chapter,
              verse: verse.verse,
              verse_text_arabic: arabic,
              verse_text_translation: translation
            });

          if (insertError) {
            console.error('Insert error:', insertError);
            failedCount++;
          } else {
            successCount++;
          }

          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (err) {
          console.error('Error processing verse:', err);
          failedCount++;
        }
      }

      setResult({ success: successCount, failed: failedCount });
      if (successCount > 0) {
        setCsvText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import verses');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="w-8 h-8 text-teal-600" />
        <h2 className="text-2xl font-bold text-gray-800">Import Quran Verses with Themes</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste CSV Data (Count, Quran Theme, Verse Theme, Chapter#, Verse#)
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            disabled={isProcessing}
            placeholder="1,Faith,Belief in Allah,2,285
2,Prayer,Importance of Prayer,2,45
3,Patience,Reward for Patience,2,153"
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Export your Excel file as CSV and paste the contents here. The first row (headers) will be skipped.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-blue-700 font-medium">Processing verses...</p>
              <p className="text-blue-600 text-sm">
                {progress.current} of {progress.total} verses processed
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-700 font-medium">Import completed!</p>
              <p className="text-green-600 text-sm">
                Successfully imported: {result.success} verses
                {result.failed > 0 && ` | Failed: ${result.failed} verses`}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={importVerses}
          disabled={isProcessing || !csvText.trim()}
          className="w-full px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Import Verses
            </>
          )}
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Open your Excel file</li>
          <li>Select all data and copy (Ctrl+C / Cmd+C)</li>
          <li>Paste into the text area above</li>
          <li>Click "Import Verses" - the system will automatically fetch the Arabic text and English translation</li>
        </ol>
      </div>
    </div>
  );
}
