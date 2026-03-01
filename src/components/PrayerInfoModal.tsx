import { X } from 'lucide-react';

interface PrayerInfo {
  name: string;
  verse: string;
  verseReference: string;
  footnote: string;
  memoryTechnique: string;
  reflection: string;
  reflectionTitle?: string;
}

interface PrayerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerInfo: PrayerInfo | null;
}

function formatTextWithStyles(text: string) {
  const parts: (string | JSX.Element)[] = [];
  let currentIndex = 0;

  const combinedRegex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|"[^"]+"|==[^=]+==)/g;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }

    const matchedText = match[0];
    if (matchedText.startsWith('***') && matchedText.endsWith('***')) {
      const boldItalicText = matchedText.slice(3, -3);
      parts.push(<strong key={match.index} className="font-bold italic">{boldItalicText}</strong>);
    } else if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      const boldText = matchedText.slice(2, -2);
      parts.push(<strong key={match.index} className="font-bold">{boldText}</strong>);
    } else if (matchedText.startsWith('"') && matchedText.endsWith('"')) {
      const italicText = matchedText.slice(1, -1);
      parts.push(<em key={match.index} className="italic">{italicText}</em>);
    } else if (matchedText.startsWith('==') && matchedText.endsWith('==')) {
      const highlightText = matchedText.slice(2, -2);
      parts.push(<span key={match.index} className="bg-yellow-500/80 text-slate-900 px-1.5 py-0.5 rounded font-semibold">{highlightText}</span>);
    }

    currentIndex = match.index + match[0].length;
  }

  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function PrayerInfoModal({ isOpen, onClose, prayerInfo }: PrayerInfoModalProps) {
  if (!isOpen || !prayerInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border-2 border-yellow-500/50">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-4 flex items-center justify-between border-b border-yellow-500/30">
          <h2 className="text-2xl font-bold text-white">{prayerInfo.name} Prayer</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-700/50 rounded-lg p-5 border border-yellow-500/30">
            <h3 className="text-yellow-400 font-bold text-lg mb-3">Quranic Reference</h3>
            <div className="text-white text-base leading-relaxed mb-2 italic">
              {prayerInfo.verse.split('\n').map((line, index) => {
                const isQuranReference = line.trim().startsWith('— Qur') || line.trim().startsWith('— Quran');
                return (
                  <div key={index} className={line.trim() === '' ? 'h-4' : ''}>
                    {line.trim() === '' ? '\u00A0' : (
                      <span className={isQuranReference ? 'text-emerald-400 font-semibold not-italic' : ''}>
                        {line}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {prayerInfo.verseReference && (
              <p className="text-emerald-400 font-semibold text-sm">— {prayerInfo.verseReference}</p>
            )}
          </div>

          {prayerInfo.footnote && (
            <div className="bg-slate-700/50 rounded-lg p-5 border border-slate-600">
              <h3 className="text-yellow-400 font-bold text-lg mb-3">Footnote</h3>
              <div className="text-slate-200 text-base leading-relaxed">
                {prayerInfo.footnote.split('\n').map((line, index) => (
                  <div key={index} className={line.trim() === '' ? 'h-4' : ''}>
                    {line.trim() === '' ? '\u00A0' : formatTextWithStyles(line)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {prayerInfo.memoryTechnique && (
            <div className="bg-slate-700/50 rounded-lg p-5 border border-slate-600">
              <h3 className="text-yellow-400 font-bold text-lg mb-3">Memory Technique: Recognizing Patterns</h3>
              <div className="text-slate-200 text-base leading-relaxed whitespace-pre-line">
                {prayerInfo.memoryTechnique.split('\n').map((line, index) => (
                  <div key={index} className={line.trim() === '' ? 'h-4' : ''}>
                    {line.trim() === '' ? '\u00A0' : formatTextWithStyles(line)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {prayerInfo.reflection && (
            <div className="bg-gradient-to-br from-emerald-700/30 to-teal-800/30 rounded-lg p-5 border border-emerald-500/50">
              <h3 className="text-yellow-400 font-bold text-lg mb-3">
                📌 Reflection{prayerInfo.reflectionTitle && `: ${prayerInfo.reflectionTitle}`}
              </h3>
              <div className="text-slate-100 text-base leading-relaxed whitespace-pre-line">
                {prayerInfo.reflection.split('\n').map((line, index) => (
                  <div key={index} className={line.trim() === '' ? 'h-4' : ''}>
                    {line.trim() === '' ? '\u00A0' : formatTextWithStyles(line)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-800/90 backdrop-blur-sm px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
