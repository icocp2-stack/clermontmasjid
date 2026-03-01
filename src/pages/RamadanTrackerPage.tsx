import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import RamadanTracker from '../components/RamadanTracker';
import { getCurrentLocation, reverseGeocode, type LocationData } from '../services/geolocation';
import { loadUserLocation, saveUserLocation } from '../services/locationStorage';

export default function RamadanTrackerPage() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const savedLocation = await loadUserLocation();
        if (savedLocation) {
          setLocation(savedLocation);
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
        } catch {
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
        }
      } catch {
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
      }
    };
    initializeLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2f4a] to-[#0f1f35]">
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
            <p className="text-base md:text-lg text-white font-medium">Ramadan Tracker</p>
          </div>
        </header>

        <Navigation currentPage="ramadan-tracker" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {location ? (
          <RamadanTracker location={location} currentTime={currentTime} />
        ) : (
          <div className="text-white text-center py-12">
            <p className="text-xl">Loading location data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
