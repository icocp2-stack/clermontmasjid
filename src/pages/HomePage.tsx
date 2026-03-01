import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import TodaysPrayerTimesCard from '../components/TodaysPrayerTimesCard';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative h-[600px] md:h-[700px] lg:h-[800px] w-full overflow-hidden">
        <img
          src="/sitelocation-2.png"
          alt="Islamic Center of Clermont"
          className="w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60"></div>

        <div className="absolute inset-0 flex flex-col">
          <div className="flex flex-col items-center gap-2 pt-8 md:pt-12 px-4">
            <img
              src="/logo-9.png"
              alt="ICOC Logo"
              className="w-32 h-auto md:w-40 lg:w-48"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3))' }}
            />
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-500 text-center"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), -1px -1px 2px rgba(255, 255, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.3)' }}
            >
              ISLAMIC CENTER OF CLERMONT
            </h1>
            <p className="text-base md:text-lg text-white font-medium drop-shadow-md">
              Welcome to Our Community
            </p>
          </div>

          <div className="flex-1"></div>

          <div className="pb-8 md:pb-12">
            <div className="container mx-auto px-4">
              <Navigation currentPage="home-page" />
            </div>
          </div>
        </div>
      </div>

      <TodaysPrayerTimesCard />

      <div className="w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 py-8 md:py-12 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 py-14 px-10 md:py-16 md:px-12 rounded-lg shadow-lg border border-yellow-500/40 flex items-center">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-yellow-500/40 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-yellow-500/40 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-yellow-500/40 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-yellow-500/40 rounded-br-lg"></div>

            {/* Inner decorative stars */}
            <div className="absolute top-4 left-4 text-yellow-500/30 text-xl">✦</div>
            <div className="absolute top-4 right-4 text-yellow-500/30 text-xl">✦</div>
            <div className="absolute bottom-4 left-4 text-yellow-500/30 text-xl">✦</div>
            <div className="absolute bottom-4 right-4 text-yellow-500/30 text-xl">✦</div>

            <div
              className="text-white leading-relaxed space-y-4 relative z-10 text-lg md:text-xl lg:text-[22px]"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.1)' }}
            >
              <p>
                <span className="italic" style={{ color: '#f8de7e' }}>ICOC</span> aka Clermont Masjid is a welcoming Islamic Center serving the Clermont community through <span className="italic" style={{ color: '#f8de7e' }}>Jumuʿah</span> and daily prayers, Saturday <span className="italic" style={{ color: '#f8de7e' }}>Ṭālib al-ʿIlm</span> School, Sunday community <span className="italic" style={{ color: '#f8de7e' }}>duʿāʾ</span>, Sunday <span className="italic" style={{ color: '#f8de7e' }}>breakfast</span>, Wednesday <span className="italic" style={{ color: '#f8de7e' }}>Qur'an</span> studies, monthly <span className="italic" style={{ color: '#f8de7e' }}>dinners</span> (second Saturday), quarterly <span className="italic" style={{ color: '#f8de7e' }}>food fairs</span>, annual <span className="italic" style={{ color: '#f8de7e' }}>Eid</span> celebrations, and our growing community <span className="italic" style={{ color: '#f8de7e' }}>food pantry</span> and our <span className="italic" style={{ color: '#f8de7e' }}>youth program</span> along with other meaningful events that serve, uplift, and unite our community.
              </p>
              <p>
                <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Bediüzzaman Said Nursî</span> expressed the principle that supplication draws closer to acceptance when it becomes collective. In other words, the more <span className="italic" style={{ color: '#f8de7e' }}>duʿāʾ</span> is shared in unity, the stronger it rises toward the heavens. On Sunday mornings, we gather to form that unity of <span className="italic" style={{ color: '#f8de7e' }}>hearts</span> and voices.
              </p>
              <p>
                Join us and support this community in worship, learning, service, <span className="italic" style={{ color: '#f8de7e' }}>ṣāliḥ</span> deeds (righteous action), and special gatherings that strengthen <span className="italic" style={{ color: '#f8de7e' }}>faith</span>, cultivate <span className="italic" style={{ color: '#f8de7e' }}>barakah</span>, and foster <span className="italic" style={{ color: '#f8de7e' }}>brotherhood</span> and <span className="italic" style={{ color: '#f8de7e' }}>sisterhood</span>.
              </p>
              <p className="italic text-center" style={{ color: '#f8de7e', marginTop: '2.5rem' }}>
                "And cooperate in righteousness and piety, and do not cooperate in sin and transgression." (Qur'an 5:2)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <footer className="text-center text-slate-400 space-y-6">
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
