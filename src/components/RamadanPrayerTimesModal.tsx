import { X, Printer } from 'lucide-react';
import { calculatePrayerTimes, formatTime } from '../services/prayerTimes';
import { toHijri, toGregorian } from 'hijri-converter';
import type { LocationData } from '../services/geolocation';

interface RamadanPrayerTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  ramadanYear: number;
}

interface DayPrayerTimes {
  day: number;
  hijriDate: string;
  gregorianDate: string;
  shortDate: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export default function RamadanPrayerTimesModal({
  isOpen,
  onClose,
  location,
  ramadanYear
}: RamadanPrayerTimesModalProps) {
  if (!isOpen) return null;

  const generateRamadanPrayerTimes = (): DayPrayerTimes[] => {
    const prayerTimesData: DayPrayerTimes[] = [];

    for (let day = 1; day <= 30; day++) {
      try {
        const gregorianDate = toGregorian(ramadanYear, 9, day);
        const date = new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd);

        // Validate the date - if invalid, push with placeholder times
        if (isNaN(date.getTime())) {
          console.error(`Invalid date for day ${day}, using placeholders`);
          prayerTimesData.push({
            day,
            hijriDate: `${day} Ramadan ${ramadanYear}`,
            gregorianDate: 'Invalid Date',
            shortDate: 'Invalid',
            fajr: '--:--',
            dhuhr: '--:--',
            asr: '--:--',
            maghrib: '--:--',
            isha: '--:--'
          });
          continue;
        }

        const prayerTimes = calculatePrayerTimes(location, date);

        const hijriDateStr = `${day} Ramadan ${ramadanYear}`;
        const gregorianDateStr = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const shortDateStr = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        prayerTimesData.push({
          day,
          hijriDate: hijriDateStr,
          gregorianDate: gregorianDateStr,
          shortDate: shortDateStr,
          fajr: formatTime(prayerTimes.fajr),
          dhuhr: formatTime(prayerTimes.dhuhr),
          asr: formatTime(prayerTimes.asr),
          maghrib: formatTime(prayerTimes.maghrib),
          isha: formatTime(prayerTimes.isha)
        });
      } catch (error) {
        console.error(`Error generating prayer times for day ${day}:`, error);
        // Still push the day even if there's an error, with placeholder times
        try {
          const gregorianDate = toGregorian(ramadanYear, 9, day);
          const date = new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd);
          const validDate = !isNaN(date.getTime());
          prayerTimesData.push({
            day,
            hijriDate: `${day} Ramadan ${ramadanYear}`,
            gregorianDate: validDate ? date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'Error',
            shortDate: validDate ? date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }) : 'Error',
            fajr: '--:--',
            dhuhr: '--:--',
            asr: '--:--',
            maghrib: '--:--',
            isha: '--:--'
          });
        } catch (innerError) {
          prayerTimesData.push({
            day,
            hijriDate: `${day} Ramadan ${ramadanYear}`,
            gregorianDate: 'Error',
            shortDate: 'Error',
            fajr: '--:--',
            dhuhr: '--:--',
            asr: '--:--',
            maghrib: '--:--',
            isha: '--:--'
          });
        }
      }
    }

    return prayerTimesData;
  };

  const prayerTimesData = generateRamadanPrayerTimes();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const rows = prayerTimesData.map((d) => `
      <tr>
        <td class="center bold">${d.day}</td>
        <td>${d.day} Ram</td>
        <td>${d.shortDate}</td>
        <td class="center green">${d.fajr}</td>
        <td class="center blue">${d.dhuhr}</td>
        <td class="center amber">${d.asr}</td>
        <td class="center orange">${d.maghrib}</td>
        <td class="center dark">${d.isha}</td>
      </tr>`).join('');

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Ramadan ${ramadanYear} Prayer Times</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; color: #000; background: #fff; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 8px; }
    .header img { width: 40px; height: 40px; object-fit: contain; }
    .header h1 { font-size: 18px; font-weight: bold; }
    .header p { font-size: 11px; color: #555; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #aaa; padding: 5px 4px; }
    th { background: #f0f0f0; font-weight: bold; text-align: center; }
    th:nth-child(1), th:nth-child(2), th:nth-child(3) { text-align: left; }
    .center { text-align: center; }
    .bold { font-weight: bold; text-align: center; }
    .green { background: #f0fdf4; color: #166534; font-weight: 600; }
    .blue { background: #eff6ff; color: #1e40af; font-weight: 600; }
    .amber { background: #fffbeb; color: #92400e; font-weight: 600; }
    .orange { background: #fff7ed; color: #9a3412; font-weight: 600; }
    .dark { background: #f8fafc; color: #1e293b; font-weight: 600; }
    tr:nth-child(even) td:not(.green):not(.blue):not(.amber):not(.orange):not(.dark) { background: #fafafa; }
    .footer { margin-top: 10px; font-size: 10px; color: #666; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="${window.location.origin}/logo-9.png" alt="Logo" />
    <div>
      <h1>Ramadan ${ramadanYear} Prayer Times</h1>
      <p>${location.city}, ${location.region}</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Hijri</th><th>Date</th>
        <th>Fajr</th><th>Dhuhr</th><th>Asr</th><th>Maghrib</th><th>Isha</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Prayer times calculated for ${location.city}, ${location.region} using North America calculation method</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:bg-white print:static print:inset-auto print:p-0 print:block print:overflow-auto">
      <div className="print-content bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col print:bg-white print:max-w-none print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:rounded-none print:flex print:flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 print:border-b-2 print:border-gray-800 print:pb-1 print:pt-1 print:px-2 print:mb-1 print:flex-none">
          <div className="flex items-center gap-4 print:gap-2">
            <img
              src="/logo-9.png"
              alt="ICOC Logo"
              className="hidden print:block w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-3xl font-bold text-white print:text-black print:text-lg print:font-bold print:leading-tight">
                Ramadan {ramadanYear} Prayer Times
              </h2>
              <p className="text-slate-300 mt-1 print:text-gray-700 print:text-[10px] print:mt-0 print:leading-tight">
                {location.city}, {location.region}
              </p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1 p-6 print:overflow-visible print:flex-none print:p-2">
          <table className="w-full border-collapse text-sm print:text-[11px] print:leading-normal print:table-fixed">
            <colgroup>
              <col className="print:w-[5%]" />
              <col className="print:w-[12%]" />
              <col className="print:w-[12%]" />
              <col className="print:w-[14%]" />
              <col className="print:w-[14%]" />
              <col className="print:w-[14%]" />
              <col className="print:w-[14%]" />
              <col className="print:w-[14%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-800">
                <th className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-left text-white print:text-black print:bg-gray-100 font-bold">
                  #
                </th>
                <th className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-left text-white print:text-black print:bg-gray-100 font-bold">
                  Hijri
                </th>
                <th className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-left text-white print:text-black print:bg-gray-100 font-bold">
                  Date
                </th>
                <th className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-white print:text-green-800 print:bg-green-50 font-bold">
                  Fajr
                </th>
                <th className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-white print:text-blue-800 print:bg-blue-50 font-bold">
                  Dhuhr
                </th>
                <th className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-white print:text-amber-800 print:bg-amber-50 font-bold">
                  Asr
                </th>
                <th className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-white print:text-orange-800 print:bg-orange-50 font-bold">
                  Maghrib
                </th>
                <th className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-white print:text-slate-800 print:bg-slate-100 font-bold">
                  Isha
                </th>
              </tr>
            </thead>
            <tbody>
              {prayerTimesData.map((dayData) => {
                return (
                  <tr
                    key={dayData.day}
                    className="hover:bg-slate-800/50 print:hover:bg-transparent print:bg-white"
                  >
                    <td className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-white print:text-black font-bold text-center">
                      {dayData.day}
                    </td>
                    <td className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-slate-200 print:text-black text-xs">
                      <span className="hidden print:inline">{dayData.day} Ram</span>
                      <span className="print:hidden">{dayData.hijriDate}</span>
                    </td>
                    <td className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-slate-200 print:text-black text-xs">
                      <span className="hidden print:inline">{dayData.shortDate}</span>
                      <span className="print:hidden">{dayData.gregorianDate}</span>
                    </td>
                    <td className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-emerald-400 print:text-green-800 print:bg-green-50 font-semibold">
                      {dayData.fajr}
                    </td>
                    <td className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-blue-400 print:text-blue-800 print:bg-blue-50 font-semibold">
                      {dayData.dhuhr}
                    </td>
                    <td className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-amber-400 print:text-amber-800 print:bg-amber-50 font-semibold">
                      {dayData.asr}
                    </td>
                    <td className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-orange-400 print:text-orange-800 print:bg-orange-50 font-semibold">
                      {dayData.maghrib}
                    </td>
                    <td className="border border-slate-700 print:border print:border-gray-400 p-3 print:py-1.5 print:px-1 text-center text-purple-400 print:text-slate-800 print:bg-slate-100 font-semibold">
                      {dayData.isha}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-700 print:hidden bg-slate-800">
          <p className="text-sm text-slate-400 text-center">
            Prayer times calculated for {location.city}, {location.region} using North America calculation method
          </p>
        </div>
      </div>
    </div>
  );
}
