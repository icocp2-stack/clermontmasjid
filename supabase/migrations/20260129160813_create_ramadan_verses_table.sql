/*
  # Create Ramadan Verses Table with Ibn Arabi Number Knowledge

  ## Overview
  This migration creates a system for the 25 sequential Ramadan verses that reveal
  the sacred number knowledge taught by Ibn Arabi (25 → 7 → The Seven Oft-Repeated).

  ## New Tables
  
  ### `ramadan_verses`
  Stores the 25 core verses related to Ramadan for sequential daily reading.
  - `id` (serial, primary key) - Auto-incrementing ID
  - `day_number` (integer, unique) - Day number (1-25) for sequential reading
  - `surah` (integer) - Surah number
  - `ayah` (integer) - Ayah number
  - `arabic_text` (text) - Arabic verse text
  - `english_translation` (text) - English translation
  - `theme` (text) - Spiritual theme of the verse
  - `reference` (text) - Human-readable reference (e.g., "Quran 2:183")
  - `created_at` (timestamptz) - Timestamp of creation

  ## Security
  - Enable RLS on `ramadan_verses` table
  - Allow public read access (these are Quranic verses meant to be shared)
  - Restrict write access to prevent unauthorized modifications

  ## Data Population
  Populates the table with 25 verses in sequential order following the Ibn Arabi
  number knowledge system.
*/

-- Create the ramadan_verses table
CREATE TABLE IF NOT EXISTS ramadan_verses (
  id serial PRIMARY KEY,
  day_number integer UNIQUE NOT NULL CHECK (day_number >= 1 AND day_number <= 25),
  surah integer NOT NULL CHECK (surah >= 1 AND surah <= 114),
  ayah integer NOT NULL CHECK (ayah >= 1),
  arabic_text text NOT NULL,
  english_translation text NOT NULL,
  theme text NOT NULL,
  reference text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ramadan_verses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the verses (public access)
CREATE POLICY "Allow public read access to Ramadan verses"
  ON ramadan_verses
  FOR SELECT
  USING (true);

-- Prevent unauthorized modifications (only service role can insert/update)
CREATE POLICY "Prevent public insert on Ramadan verses"
  ON ramadan_verses
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Prevent public update on Ramadan verses"
  ON ramadan_verses
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Prevent public delete on Ramadan verses"
  ON ramadan_verses
  FOR DELETE
  USING (false);

-- Insert the 25 Ramadan verses in sequential order
INSERT INTO ramadan_verses (day_number, surah, ayah, arabic_text, english_translation, theme, reference) VALUES
  (1, 2, 183, 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ', 'O you who have believed, fasting is prescribed for you as it was prescribed for those before you that you may become righteous.', 'Prescription of Fasting', 'Quran 2:183'),
  
  (2, 2, 184, 'أَيَّامًا مَّعْدُودَاتٍ ۚ فَمَن كَانَ مِنكُم مَّرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ ۚ وَعَلَى الَّذِينَ يُطِيقُونَهُ فِدْيَةٌ طَعَامُ مِسْكِينٍ', 'Fasting for a limited number of days. So whoever among you is ill or on a journey during them - then an equal number of days are to be made up. And upon those who are able to fast, but with hardship - a ransom of feeding a poor person each day.', 'Divine Mercy and Flexibility', 'Quran 2:184'),
  
  (3, 2, 185, 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ', 'The month of Ramadan is that in which was revealed the Quran, a guidance for the people and clear proofs of guidance and criterion.', 'Revelation of the Quran', 'Quran 2:185'),
  
  (4, 2, 186, 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ', 'And when My servants ask you concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me. So let them respond to Me and believe in Me that they may be guided.', 'Nearness of Allah', 'Quran 2:186'),
  
  (5, 32, 16, 'تَتَجَافَىٰ جُنُوبُهُمْ عَنِ الْمَضَاجِعِ يَدْعُونَ رَبَّهُمْ خَوْفًا وَطَمَعًا وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ', 'Their sides forsake their beds to invoke their Lord in fear and aspiration, and from what We have provided them, they spend.', 'Night Prayer and Devotion', 'Quran 32:16'),
  
  (6, 33, 35, 'إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ وَالْقَانِتِينَ وَالْقَانِتَاتِ وَالصَّادِقِينَ وَالصَّادِقَاتِ وَالصَّابِرِينَ وَالصَّابِرَاتِ وَالْخَاشِعِينَ وَالْخَاشِعَاتِ وَالْمُتَصَدِّقِينَ وَالْمُتَصَدِّقَاتِ وَالصَّائِمِينَ وَالصَّائِمَاتِ وَالْحَافِظِينَ فُرُوجَهُمْ وَالْحَافِظَاتِ وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا', 'Indeed, the Muslim men and Muslim women, the believing men and believing women, the obedient men and obedient women, the truthful men and truthful women, the patient men and patient women, the humble men and humble women, the charitable men and charitable women, the fasting men and fasting women, the men who guard their private parts and the women who do so, and the men who remember Allah often and the women who do so - for them Allah has prepared forgiveness and a great reward.', 'Virtues of the Faithful', 'Quran 33:35'),
  
  (7, 44, 3, 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةٍ مُّبَارَكَةٍ ۚ إِنَّا كُنَّا مُنذِرِينَ', 'Indeed, We sent it down during a blessed night. Indeed, We were to warn mankind.', 'The Blessed Night', 'Quran 44:3'),
  
  (8, 73, 1, 'يَا أَيُّهَا الْمُزَّمِّلُ', 'O you who wraps himself in clothing.', 'Call to Night Vigil', 'Quran 73:1'),
  
  (9, 73, 2, 'قُمِ اللَّيْلَ إِلَّا قَلِيلًا', 'Arise in the night, except for a little.', 'Standing in Prayer', 'Quran 73:2'),
  
  (10, 73, 3, 'نِّصْفَهُ أَوِ انقُصْ مِنْهُ قَلِيلًا', 'Half of it - or subtract from it a little.', 'Measure of Night Worship', 'Quran 73:3'),
  
  (11, 73, 4, 'أَوْ زِدْ عَلَيْهِ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا', 'Or add to it, and recite the Quran with measured recitation.', 'Quran Recitation', 'Quran 73:4'),
  
  (12, 73, 5, 'إِنَّا سَنُلْقِي عَلَيْكَ قَوْلًا ثَقِيلًا', 'Indeed, We will cast upon you a heavy word.', 'Weight of Divine Revelation', 'Quran 73:5'),
  
  (13, 73, 6, 'إِنَّ نَاشِئَةَ اللَّيْلِ هِيَ أَشَدُّ وَطْئًا وَأَقْوَمُ قِيلًا', 'Indeed, the hours of the night are more effective for concurrence of heart and tongue and more suitable for words.', 'Power of Night Worship', 'Quran 73:6'),
  
  (14, 91, 9, 'قَدْ أَفْلَحَ مَن زَكَّاهَا', 'He has succeeded who purifies it.', 'Purification of the Soul', 'Quran 91:9'),
  
  (15, 91, 10, 'وَقَدْ خَابَ مَن دَسَّاهَا', 'And he has failed who corrupts it.', 'Corruption of the Soul', 'Quran 91:10'),
  
  (16, 96, 1, 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', 'Read! In the Name of your Lord, who has created all that exists.', 'The First Command', 'Quran 96:1'),
  
  (17, 96, 2, 'خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ', 'He has created man from a clot of blood.', 'Creation of Humanity', 'Quran 96:2'),
  
  (18, 96, 3, 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ', 'Read! And your Lord is the Most Generous.', 'Divine Generosity', 'Quran 96:3'),
  
  (19, 96, 4, 'الَّذِي عَلَّمَ بِالْقَلَمِ', 'Who has taught by the pen.', 'Knowledge and Writing', 'Quran 96:4'),
  
  (20, 96, 5, 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ', 'He has taught man that which he knew not.', 'Gift of Knowledge', 'Quran 96:5'),
  
  (21, 97, 1, 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ', 'Indeed, We sent it down during the Night of Decree.', 'Night of Power', 'Quran 97:1'),
  
  (22, 97, 2, 'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ', 'And what can make you know what the Night of Decree is?', 'Mystery of Laylat al-Qadr', 'Quran 97:2'),
  
  (23, 97, 3, 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ', 'The Night of Decree is better than a thousand months.', 'Transcendent Value', 'Quran 97:3'),
  
  (24, 97, 4, 'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ', 'The angels and the Spirit descend therein by permission of their Lord for every matter.', 'Descent of Angels', 'Quran 97:4'),
  
  (25, 97, 5, 'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ', 'Peace it is until the emergence of dawn.', 'Peace Until Dawn', 'Quran 97:5');

-- Create an index on day_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_ramadan_verses_day_number ON ramadan_verses(day_number);
