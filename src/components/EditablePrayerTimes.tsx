import { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { calculatePrayerTimes } from '../services/prayerTimes';
import { LocationData } from '../services/geolocation';

interface PrayerTimesData {
  id?: string;
  date: string;
  fajr_time: string | null;
  sunrise_time: string | null;
  dhuhr_time: string | null;
  asr_time: string | null;
  maghrib_time: string | null;
  isha_time: string | null;
  midnight: string | null;
  tahajjud: string | null;
}

interface EditablePrayerTimesProps {
  location: LocationData;
  currentTime: Date;
}

export default function EditablePrayerTimes({ location, currentTime }: EditablePrayerTimesProps) {
  const { user, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [editedTimes, setEditedTimes] = useState<PrayerTimesData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPrayerTimes();
  }, [currentTime]);

  const loadPrayerTimes = async () => {
    const today = currentTime.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mosque_prayer_times')
      .select('*')
      .eq('date', today)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setPrayerTimes(data);
    } else {
      const calculated = calculatePrayerTimes(location, currentTime);
      const defaultTimes: PrayerTimesData = {
        date: today,
        fajr_time: formatDateToTimeString(calculated.fajr),
        sunrise_time: formatDateToTimeString(calculated.sunrise),
        dhuhr_time: formatDateToTimeString(calculated.dhuhr),
        asr_time: formatDateToTimeString(calculated.asr),
        maghrib_time: formatDateToTimeString(calculated.maghrib),
        isha_time: formatDateToTimeString(calculated.isha),
        midnight: formatDateToTimeString(calculated.midnight),
        tahajjud: formatDateToTimeString(calculated.tahajjud),
      };
      setPrayerTimes(defaultTimes);
    }
  };

  const handleEdit = () => {
    setEditedTimes({ ...prayerTimes! });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTimes(null);
  };

  const handleSave = async () => {
    if (!editedTimes) return;

    // Check authentication using AuthContext (respects dev mode)
    if (!user) {
      alert('You must be logged in to edit prayer times.');
      return;
    }

    if (!role.isAdmin) {
      alert('You do not have permission to edit prayer times. Admin access required.');
      return;
    }

    setIsSaving(true);
    try {
      if (prayerTimes?.id) {
        const { error } = await supabase
          .from('mosque_prayer_times')
          .update({
            fajr_time: editedTimes.fajr_time,
            sunrise_time: editedTimes.sunrise_time,
            dhuhr_time: editedTimes.dhuhr_time,
            asr_time: editedTimes.asr_time,
            maghrib_time: editedTimes.maghrib_time,
            isha_time: editedTimes.isha_time,
            midnight: editedTimes.midnight,
            tahajjud: editedTimes.tahajjud,
            updated_at: new Date().toISOString(),
          })
          .eq('id', prayerTimes.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('mosque_prayer_times')
          .insert([{
            date: editedTimes.date,
            fajr_time: editedTimes.fajr_time,
            sunrise_time: editedTimes.sunrise_time,
            dhuhr_time: editedTimes.dhuhr_time,
            asr_time: editedTimes.asr_time,
            maghrib_time: editedTimes.maghrib_time,
            isha_time: editedTimes.isha_time,
            midnight: editedTimes.midnight,
            tahajjud: editedTimes.tahajjud,
          }]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }

      setPrayerTimes(editedTimes);
      setIsEditing(false);
      setEditedTimes(null);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('prayerTimesUpdated'));

      alert('Prayer times saved successfully!');
    } catch (error: any) {
      console.error('Error saving prayer times:', error);
      alert(`Failed to save prayer times: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = (prayer: keyof PrayerTimesData, value: string) => {
    if (!editedTimes) return;
    setEditedTimes({ ...editedTimes, [prayer]: value });
  };

  if (!prayerTimes) return null;

  const prayers = [
    { name: 'Fajr', key: 'fajr_time' as const, color: 'text-blue-400' },
    { name: 'Sunrise', key: 'sunrise_time' as const, color: 'text-orange-400' },
    { name: 'Dhuhr', key: 'dhuhr_time' as const, color: 'text-yellow-400' },
    { name: 'Asr', key: 'asr_time' as const, color: 'text-amber-400' },
    { name: 'Maghrib', key: 'maghrib_time' as const, color: 'text-red-400' },
    { name: 'Isha', key: 'isha_time' as const, color: 'text-indigo-400' },
    { name: 'Midnight', key: 'midnight' as const, color: 'text-slate-400' },
    { name: 'Tahajjud', key: 'tahajjud' as const, color: 'text-purple-400' },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-500">Today's Prayer Times</h2>
        {role.isAdmin && !isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Edit2 size={16} />
            Edit Times
          </button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {prayers.map((prayer) => {
          const time = isEditing ? editedTimes![prayer.key] : prayerTimes[prayer.key];

          return (
            <div
              key={prayer.key}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className={`text-sm font-semibold mb-2 ${prayer.color}`}>
                {prayer.name}
              </div>
              {isEditing ? (
                <input
                  type="time"
                  value={time || ''}
                  onChange={(e) => handleTimeChange(prayer.key, e.target.value)}
                  className="w-full bg-slate-800 text-white text-xl font-bold px-3 py-2 rounded border border-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {time ? formatTime(time) : '--:--'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-slate-400 text-center">
        {currentTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  );
}

function formatDateToTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
