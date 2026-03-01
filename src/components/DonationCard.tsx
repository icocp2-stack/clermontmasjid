import { Heart, Copy } from 'lucide-react';
import { useState } from 'react';

export default function DonationCard() {
  const [copied, setCopied] = useState(false);
  const zelleEmail = 'clermontmasjid@gmail.com';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(zelleEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="mt-6 p-6 bg-slate-800/40 rounded-lg border border-slate-700">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            <span className="text-sm md:text-base text-slate-300">
              Support <span className="text-yellow-500 font-semibold">Islamic Center of Clermont</span> via Zelle:
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 rounded-md px-3 py-2 border border-slate-700">
            <span className="text-sm md:text-base font-mono text-white">
              {zelleEmail}
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors text-xs"
              title="Copy to clipboard"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <a
            href="https://www.paypal.com/donate/?hosted_button_id=HMUEUNJ6JFR7L"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-base font-semibold transition-all shadow-lg hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            Donate via PayPal
          </a>
        </div>
      </div>
    </div>
  );
}
