import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import PrayerClock from '../components/PrayerClock';
import PrayerTimesPanel from '../components/PrayerTimesPanel';
import PrayerTimesDisplay from '../components/PrayerTimesDisplay';
import LocationSearch from '../components/LocationSearch';
import { DailyVerseCard } from '../components/DailyVerseCard';
import RamadanTracker from '../components/RamadanTracker';
import DonationCard from '../components/DonationCard';
import Navigation from '../components/Navigation';
import ImamDashboard from '../components/ImamDashboard';
import EditablePrayerTimes from '../components/EditablePrayerTimes';
import { getCurrentLocation, reverseGeocode, LocationData } from '../services/geolocation';
import { saveUserLocation, loadUserLocation } from '../services/locationStorage';
import { calculatePrayerTimes } from '../services/prayerTimes';
import { useAuth } from '../contexts/AuthContext';

type ViewType = 'prayer-times' | 'ramadan-tracker';

export default function PublicHomePage() {
  const { role, user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('prayer-times');

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeLocation = async () => {
    try {
      const savedLocation = await loadUserLocation();

      if (savedLocation) {
        setLocation(savedLocation);
        setIsLoading(false);
        return;
      }

      try {
        const position = await getCurrentLocation();
        const locationData = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );

        setLocation(locationData);
        await saveUserLocation(locationData);
        setIsLoading(false);
      } catch (geoError) {
        console.log('GPS location not available:', geoError);
        setError('Location access denied or unavailable. Please use the "Use My Location" button or search for your location.');

        const defaultLocation: LocationData = {
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York',
          state_province: 'NY',
          country: 'United States',
          postal_code: '10001',
          timezone: 'America/New_York'
        };
        setLocation(defaultLocation);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Location initialization error:', err);
      setError('Unable to load location. Please search for your location or click "Use My Location".');

      const defaultLocation: LocationData = {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York',
        state_province: 'NY',
        country: 'United States',
        postal_code: '10001',
        timezone: 'America/New_York'
      };
      setLocation(defaultLocation);
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async (newLocation: LocationData) => {
    setLocation(newLocation);
    await saveUserLocation(newLocation);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Detecting your location...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Unable to load location</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-6">
        <header className="mb-6 md:mb-8">
          <div className="text-center mb-6 md:mb-8">
            <img
              src="/logo-9.png"
              alt="ICOC Logo"
              className="w-32 h-auto md:w-40 lg:w-48 mx-auto mb-4"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3))' }}
            />
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-500 mb-2"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), -1px -1px 2px rgba(255, 255, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.3)' }}
            >
              ISLAMIC CENTER OF CLERMONT
            </h1>
            <p className="text-base md:text-lg text-white font-medium">Welcome to Our Community</p>
          </div>
        </header>
        <div className="mb-8">
          {error && (
            <div className="mb-4 p-4 bg-amber-900/30 border border-amber-700 rounded-lg">
              <p className="text-amber-200">{error}</p>
            </div>
          )}
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>

        <div className="mb-8">
          <EditablePrayerTimes location={location} currentTime={currentTime} />
        </div>

        <Navigation activeView={activeView} onViewChange={setActiveView} currentPage="public-home" />

        {activeView === 'prayer-times' ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:items-stretch">
            <div className="lg:col-span-2 flex flex-col">
              <div className="bg-slate-900 rounded-lg shadow-2xl border border-slate-800 overflow-hidden w-full aspect-square">
                <PrayerClock
                  userLatitude={location.latitude}
                  userLongitude={location.longitude}
                  currentTime={currentTime}
                  city={location.city}
                />
              </div>
              <PrayerTimesDisplay
                prayerTimes={calculatePrayerTimes(location, currentTime)}
                currentTime={currentTime}
                location={location}
              />
              <DailyVerseCard />
            </div>

            <div className="lg:col-span-1 flex flex-col">
              <PrayerTimesPanel location={location} currentTime={currentTime} />
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <RamadanTracker location={location} currentTime={currentTime} />
          </div>
        )}

        {user && (role.canManagePosts || role.canManageVideos) && !role.isAdmin && (
          <div className="mt-8 md:mt-12">
            <ImamDashboard />
          </div>
        )}

        <footer className="mt-8 md:mt-12 text-center text-slate-400 space-y-3">
          <DonationCard />

          <div className="text-sm md:text-base space-y-1">
            <p className="font-semibold text-yellow-500 text-lg md:text-xl">ISLAMIC CENTER OF CLERMONT</p>
            <p>15020 Johns Lake Rd, Clermont, Florida 34711</p>
            <p>Phone: 407-267-8320</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
