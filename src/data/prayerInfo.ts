export interface PrayerInfo {
  name: string;
  verse: string;
  verseReference: string;
  footnote: string;
  memoryTechnique: string;
  reflection: string;
  reflectionTitle?: string;
}

// Standard Einstein quote for all Basirah Method sections
export const EINSTEIN_QUOTE = `

**As Albert Einstein said:**
"Knowledge without imagination stagnates. Imagination activates knowledge."`;

export const prayerInformation: Record<string, PrayerInfo> = {
  Fajr: {
    name: 'Fajr',
    verse: '"Observe the prayer from the decline of the sun until the darkness of the night and the dawn prayer, for certainly the dawn prayer is witnessed ˹by the unseen realm˺."',
    verseReference: 'Quran 17:78',
    footnote: 'This verse gives the times of the five daily prayers: the decline of the sun refers to the afternoon ***(Zhur)*** and late afternoon prayers ***(Asr)***, the darkness of night refers to sunset ***(Maghrib)*** and late evening prayers ***(Isha)***, then the dawn prayer ***(Fajr)***.',
    memoryTechnique: `To accept and affirm the Qur'an as opposed to denial (kufr, which literally means to cover) the learner should connect the verse intellectually and emotionally, allowing it to settle in the heart.

**Verse Reference: 17:78**
This verse itself becomes a memory anchor through recognizable patterns:

1 represents origin and unity, the beginning of all things.
7 is a Qur'anic number of completion and repetition (as highlighted in "the seven oft-repeated" in 15:87).

**The number 7 appears twice:**
• In the chapter number (17), 7-appearing at the end
• In the verse number (78), 7-appearing at the beginning

This creates a mirror-like symmetry:
end of the chapter ↔ beginning of the verse

8 follows 7, reminding the learner of continuity, sequence, and unfolding guidance, not randomness.

**Basirah Method:**
Now we close our eyes (enter the unseen realm) and see the Chapter 17 and verse 78 in the imagination mind and connect the memory technique pattern with it${EINSTEIN_QUOTE}`,
    reflection: 'Just as the daily prayers are structured across time, the verse number itself carries structure. Recognizing this harmony helps the learner move from mere reading to affirmation (īmān), where knowledge is no longer covered, but illuminated.'
  },
  Sunrise: {
    name: 'Sunrise (Shurūq al-Shams)',
    verse: '"And among His signs are the night and the day, and the sun and the moon. Do not prostrate to the sun or the moon but prostrate to Allah who created them"',
    verseReference: 'Qur\'an 41:37',
    footnote: `This verse establishes a foundational principle: acts of worship must never resemble sun-worship or celestial worship. Although the Qur'an does not list forbidden prayer times explicitly, it sets the theological boundary that worship belongs only to Allah, not to created signs such as the sun. One must also read Qur'an 6:75-79 to understand the concept of gaining unseen knowledge related in Prophet Ibrahim story.`,
    reflectionTitle: 'Prophetic Guidance (Sunnah Clarification)',
    memoryTechnique: `To accept and affirm the Qur'an, as opposed to denial (kufr, which means to cover the truth), the learner connects revelation, timing, and intention.


**Quran Reference: 41**
Quran chapter itself becomes a memory anchor through recognizable patterns:
4 represents direction, structure, and grounding
(four directions, four corners, stability in space).
1 represents unity and origin, the oneness of the Creator.
Together, 41 reminds the learner:
Structured creation points back to One Creator.


**Verse Reference: 37**
3 represents signs, clarity, and distinction
(a pattern of emergence: beginning → middle → completion). Light: Star, Sun, Moon. Child born from 2 parents.
7 represents completion and repetition in the Qur'an (as highlighted in "the seven oft-repeated" in 15:87).
Together, 37 signifies:
Clear signs brought to completion.


**Quran Pattern Alignment:**
41 (chapter) → Order and unity in creation
37 (verse) → Completion of signs within creation


**Basīrah Method**
Now close the eyes (enter the unseen realm) and visualize the numbers:
4 directions holding the world
1 center anchoring all existence
3 clear signs (Child)
7 Repeating & completing (15:87)
See 41:37 as a map of tawḥīd in the imagination. Creation ← ==Creator== ∉ Creation${EINSTEIN_QUOTE}`,
    reflection: `**The Prophet ﷺ said:**
"Do not pray at sunrise nor at sunset, for the sun rises and sets between the horns of Shayṭān."
— Sahih Muslim


**Another narration states:**
"There are three times when the Messenger of Allah ﷺ forbade us to pray… when the sun rises until it has fully risen."
— Sahih Muslim


**Voluntary Prayer After Sunrise (Ishrāq)**

**The Prophet ﷺ said:**
"Whoever prays Fajr in congregation, then sits remembering Allah until the sun rises, then prays two rakʿahs, will have the reward of a complete ḥajj and ʿumrah."
— Jamiʿ al-Tirmidhi`
  },
  Dhuhr: {
    name: 'Dhuhr (Midday) Prayer',
    verse: `"Observe the prayer from the decline of the sun until the darkness of the night and the dawn prayer, for certainly the dawn prayer is witnessed ˹by the unseen realm˺."
Quran 17:78

"And for him are all praise in the heavens and the earth at night and when you are at noon."
Quran 30:18`,
    verseReference: 'Quran 30:18',
    footnote: `The phrase "decline of the sun" (dulūk al-shams) marks the moment when the sun passes its highest point (zenith) and begins to descend. This is the entry time of Dhuhr prayer, the first prayer after the sun's peak. (17:78)

The expression "when you reach midday" (ḥīna tuẓ'hirūn) linguistically shares the same root as Dhuhr, confirming midday as a recognized Qur'anic time marker for worship. (30:18)

Dhuhr is the pivot of the day, separating morning effort from afternoon continuation.`,
    memoryTechnique: `To accept and affirm the Qur'an, as opposed to denial (kufr, which means to cover the truth), the learner connects revelation, timing, and inner alignment.

**Qur'an Reference: 17:78**
1 represents unity and origin — intention before action.
7 represents completion and structure (the seven oft-repeated, 15:87).
The decline of the sun mirrors the number pattern:
• A turning point, not an ending
• A shift from ascent to descent

**Qur'an Reference: 30:18**
3 represents balance and clarity (beginning → middle → completion). Child from 2-Parents
0 represents pause and reset, stillness at the center.
1 represents unity.
8 represents continuation and unfolding guidance.

**Mnemonic Insight:**
Just as the sun pauses at its highest point before declining, Dhuhr teaches the soul to pause, realign, and continue with purpose.

**Qur'an Pattern Alignment**
Zenith of the sun → Midpoint of the day
Dhuhr prayer → Midpoint of awareness
Creation pauses → The believer pauses
This alignment protects the heart from heedlessness (ghaflah) during peak activity.

**Basīrah Method**
Now we close our eyes (enter the unseen realm) and visualize:
The sun at its highest point
No shadow, a moment of stillness
The heart turning upward before returning to motion
See Dhuhr as a realignment prayer.
Creation ← Creator
Creation ≠ Creator${EINSTEIN_QUOTE}`,
    reflection: `Dhuhr interrupts productivity to restore direction. It reminds the believer that movement without alignment leads to loss.

Just as the sun must decline after reaching its peak, the heart must humble itself through prayer.

Balance is not found in stopping,
but in returning to Allah before continuing.`
  },
  Asr: {
    name: 'ʿAṣr (Late Afternoon)',
    verse: `"By Time (al-ʿAṣr). Indeed, mankind is in loss."
— Qur'an 103:1-2

"Protect the conscious alignment with Allah through prayer, especially the middle prayer and stand before Him in full humility and obedience."
— Qur'an 2:238`,
    verseReference: '',
    footnote: `The word al-ʿAṣr linguistically refers to pressing, squeezing, and narrowing time, reflecting the late-afternoon phase of the day when daylight begins to diminish rapidly.

Many scholars identify Ṣalāt al-ʿAṣr as the middle prayer (2-Before it (Fajr+Dhuhr) & 2-After it (Maghrib + Isha), emphasized due to:
Increasing distraction, Fatigue of the day
Shrinking the remaining sun time

ʿAṣr marks the approach of loss in the remembrance of Allah unless it consciously redeemed through prayer.`,
    memoryTechnique: `To accept and affirm the Qur'an, as opposed to denial (kufr, which means to cover the truth), the learner connects time, urgency, and accountability.

**Qur'an Reference: 103 (al-ʿAṣr)**
1 represents unity of one life, one chance, one moment. Also unity with the diversity (1-0-3)
0 represents emptiness. Time to fill it back, with consciously align with Allah, for the Ruh to ascend
3 represents balance and clarity (beginning → middle → completion). Child from 2-Parent a new beginning for the old

**📌 Mnemonic Insight:**
Sun Time is being compressed, what remains must be protected.  We must conscious alignment with Allah.

**Qur'an Reference: 2:238**
2 represents duality, choice between loss and salvation.
3 represents balance.
8 represents continuity and consequence.
The middle prayer stands at the crossroads:
What came before is spent
What remains is uncertain

**Qur'an Pattern Alignment**
Late afternoon sun → Shadows lengthen
Energy declines → Distraction increases
ʿAṣr prayer → Conscious resistance to loss
The sun's descent mirrors the human condition:
Time does not stop — it presses.

**Basīrah Method**
Now we close our eyes (enter the unseen realm) and visualize:
The sun lowering
Shadows stretching
Time narrowing like sand through fingers
See ʿAṣr as a warning prayer.
Creation ← Creator
Creation ≠ Creator

Time itself is a sign, not an object of control.${EINSTEIN_QUOTE}`,
    reflection: `ʿAṣr teaches that loss is the default, unless interrupted by conscious awareness.
Prayer at this time declares:
Time belongs to Allah
Effort alone does not save
Conscious alignment redeems what remains

Whoever protects ʿAṣr protects the day.
Whoever neglects it risks losing more than time.`
  },
  Maghrib: {
    name: 'Maghrib (Sunset) Prayer',
    verse: `"So glorify Allah when you reach the evening and when you reach the morning."
— Qur'an 30:17

"Establish prayer at the two ends of the day and at the early part of the night."
— Qur'an 11:114`,
    verseReference: 'Qur\'an 30:17, 11:114',
    footnote: `Sunset (ghurūb al-shams) marks the end of the visible day. With the disappearance of the sun, Maghrib time begins immediately.

The Qur'an consistently links evening with:
• Completion
• Transition
• Accountability

Maghrib is the first prayer of the night, signaling that what was given during the day has now concluded.`,
    memoryTechnique: `To accept and affirm the Qur'an, as opposed to denial (kufr, which means to cover the truth), the learner connects endings with responsibility.

**Qur'an Chapter Reference: 30**
3 represents signs, clarity, and distinction
(a pattern of emergence: beginning → middle → completion). Light: Star, Sun, Moon. Child born from 2 parents. progression.
0 represents closure and reset.

**Qur'an Verse Reference: 17**
1 represents origin and unity, the beginning of all things and the return
7 is a Qur'anic number of completion and repetition (as highlighted in the seven oft-repeated in 15:87).

**Qur'an Chapter Reference 11**
1 represents origin and intention.
1 repeated reinforces accountability.
Totaling 1+1 = 2 (the pair) The two ends of the day demand reflection:

**Qur'an Verse Reference: 114**
1 represents origin and intention.
1 repeated reinforces accountability.
Totaling 1+1 = 2 (the pair) The two ends of the day demand reflection:
4 represents direction, structure, and grounding, boundaries and limits
(four directions, four corners, stability in space).

• What was entrusted
• What was fulfilled
• What was neglected

**📌 Mnemonic Insight:**
What begins in unity returns to unity, but only after completion.

**Qur'an Pattern Alignment**
• Sunset → Light withdraws
• Maghrib prayer → Action pauses
• Night approaches → Accountability awakens

Just as the sun does not delay its setting, time does not delay judgment.

**Basīrah Method**
Now we close our eyes (enter the unseen realm) and visualize:
• The sun touching the horizon
• Light dissolving into shadow
• The heart taking account before darkness

See Maghrib as the prayer of reckoning.
Creation ← Creator
Creation ≠ Creator

Endings belong to Allah, just as beginnings do.${EINSTEIN_QUOTE}`,
    reflection: `Maghrib teaches that every opportunity ends. What was started at Fajr, aligned at Ẓuhr, and pressed at ʿAṣr is now sealed.

Prayer at sunset declares:
• I do not control time
• I answer for what was given
• I return before the night arrives

Whoever honors Maghrib learns to honor endings and whoever honors endings prepares for meeting Allah.`
  },
  Midnight: {
    name: 'Midnight (Middle of the Night)',
    verse: `"Indeed, worship in the night is more impactful and more suitable for recitation."
— Qur'an 73:6

"And glorify Him during part of the night and after the setting of the stars."
— Qur'an 52:49`,
    verseReference: "Qur'an 73:6, 52:49",
    footnote: `"Midnight" here means the deep quiet portion of the night — a time when distractions fade and sincerity rises.

Unlike sunrise/zenith/sunset, there is no prohibition on praying at midnight; prohibited times are tied to the sun's rising/zenith/setting.

This is not an obligatory prayer but a time-window for night worship — a sacred opening that the Qur'an repeatedly honors.`,
    memoryTechnique: `To accept and affirm the Qur'an — rather than cover the truth (kufr) — the learner anchors times to Qur'anic verses and can recall them at all times.

**Night Pattern (simple):**
Noise fades → Presence increases
World sleeps → Heart awakens

**Qur'an Reference: 73:6**
7 represents completion and structure (the seven oft-repeated, 15:87).
3 represents signs, clarity, and distinction — emergence through stages.
6 represents the six days of creation, a completed cycle of effort.

Together, 73:6 maps a complete arc:
Structure → Clarity → Rest → Worship

**Qur'an Reference: 52:49**
5 represents the five pillars — the framework of submission.
2 represents the pair: day/night, seen/unseen, action/surrender.
4 represents direction — stability and grounding.
9 represents fullness before return.

Together, 52:49 anchors the worshipper between structure and completion.

**Qur'anic Pattern Alignment**
Night deepens → Silence expands
Midnight arrives → Sincerity is tested
No one watches → Only Allah remains

**Basīrah Method**
Now we close our eyes (enter the unseen realm) and visualize:
The world gone quiet
The heart still awake
Standing before Allah with no audience but Him

See Midnight as the prayer of pure intention.
Creation ← Creator
Creation ≠ Creator

When nothing moves, the heart that moves toward Allah is the truest heart.${EINSTEIN_QUOTE}`,
    reflectionTitle: 'Distinction: Midnight vs. Tahajjud',
    reflection: `Midnight teaches ikhlāṣ (sincerity): worship when no one sees — only Allah.

**Midnight (general):** a time window for night worship (qiyām al-layl).
**Tahajjud (specific):** night prayer after sleep, best in the last third of the night.

Both are honored. Both are voluntary. Both elevate the one who rises.

The difference is not in worth but in method:
Midnight requires wakefulness before rest.
Tahajjud requires rising after rest.

Both teach the same truth:
The one who worships in darkness
chooses Allah over comfort,
sincerity over display,
and the unseen over the seen.`
  },
  Tahajjud: {
    name: 'Tahajjud (Late-Night Prayer)',
    verse: `"And from the night, keep vigil with it (tahajjud) as an extra for you…"
— Qur'an 17:79

"And remember the Name of your Lord… and during part of the night prostrate to Him…"
— Qur'an 76:25–26`,
    verseReference: "Qur'an 17:79, 76:25–26",
    footnote: `Qiyām al-layl = any voluntary worship or prayer during the night.
Tahajjud = a specific form of night prayer performed **after sleeping** (wake up, then pray). This is the common scholarly definition; the Qur'an uses the word once in 17:79.

This is a voluntary prayer — not obligatory — yet it is the prayer most directly linked to the Prophet ﷺ as a personal practice and to divine nearness in the last third of the night.`,
    memoryTechnique: `To affirm the Qur'an, the learner links tahajjud to its anchor:
Sleep → Wake → Stand before Allah
Last third → Duʿā' answered → Forgiveness sought

**Qur'an Reference: 17:79**
1 represents unity and origin — intention before action.
7 represents completion and structure (the seven oft-repeated, 15:87).
Together, 17 anchors the foundation: unity before completion.

7 opens the verse number, reinforcing completion.
9 represents fullness before return — the edge of a cycle before it renews.
Together, 79 marks the final stage of night: the last third, fullness before dawn.

**Qur'an Reference: 76:25–26**
7 represents completion and structure.
6 represents the six days of creation — a completed cycle of effort.
Together, 76 marks a completed arc of creation returning to worship.

2 represents the pair: night and day, sleep and wakefulness.
5 represents the five pillars — the framework of submission.
Together, 25–26 signals: within the structured framework, the worshipper rises.

**Qur'anic Pattern Alignment**
Sleep deepens → Sincerity is stripped bare
Last third begins → The gate of descent opens
Body surrendered → Soul ascends

**Basīrah Method**
Now we close our eyes (enter the unseen realm) and visualize:
The house quiet and dark
Every soul at rest
One figure rising
Standing before Allah with no witness but Him

See Tahajjud as the prayer of the rising soul.
Creation ← Creator
Creation ≠ Creator

The one who wakes when all others sleep
answers a call no human voice can give.${EINSTEIN_QUOTE}`,
    reflectionTitle: 'Distinction: Tahajjud vs. Midnight',
    reflection: `Tahajjud is worship after surrender: when the body wanted rest, the soul chose return.

**Hadith Support (Last Third of the Night)**

The Prophet ﷺ said:
"Our Lord descends every night to the nearest heaven when the last third of the night remains and says: Who is calling upon Me, that I may answer? Who is asking of Me, that I may give? Who is seeking My forgiveness, that I may forgive?"
— Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim

**Midnight (general):** a time window for night worship (qiyām al-layl).
**Tahajjud (specific):** night prayer after sleep, best in the last third of the night.

The difference is not in worth but in method:
Midnight requires wakefulness before rest.
Tahajjud requires rising after rest.

Both teach the same truth:
The one who worships in darkness
chooses Allah over comfort,
sincerity over display,
and the unseen over the seen.`
  },
  Isha: {
    name: 'Ishāʾ (Night) Prayer',
    verse: `"So be patient over what they say and glorify your Lord before the rising of the sun and before its setting, and during parts of the night glorify Him…"
— Qur'an 20:130

"And remember the Name of your Lord morning and evening. And during part of the night, prostrate to Him and glorify Him a long night."
— Qur'an 76:25–26

"And glorify Him during part of the night and after the setting of the stars."
— Qur'an 52:49`,
    verseReference: 'Qur\'an 20:130, 76:25-26, 52:49',
    footnote: `These verses collectively establish nighttime worship as a distinct and elevated act:

"Parts of the night" indicates intentional devotion beyond daylight

"After the setting of the stars" places worship in deep darkness

Prostration at night signifies humility when visibility, energy, and activity have withdrawn

ʿIshāʾ stands as the obligatory gateway into night worship, anchoring the believer before rest, sleep, and surrender.

In Qur'an 39:42, Allah takes the soul during sleep; let ʿIshāʾ be the last act before returning to Him.`,
    memoryTechnique: `To accept and affirm the Qur'an rather than cover the truth (kufr), the learner internalizes its verses, anchors each prayer to its Qur'anic reference, and recalls it at all times.

**Night Pattern**
• Day is ruled by sight (seen), sun and physical effort
• Night is ruled by sight (unseen), moon, trust and reliance
• When vision fades, intention remains

**📌 Mnemonic Insight:**
When nothing is seen, only sincerity is visible to the unseen beings

ʿIshāʾ trains the heart to worship without seen witnesses, except Allah and his unseen angles

**Qur'anic Pattern Alignment**
• Stars appear → Guidance emerges
• Night deepens → Trust is required
• ʿIshāʾ prayer → Reliance is declared

The believer hands over what cannot be guarded while asleep.

**Basīrah Method**
Now we close our eyes (enter the unseen realm) and visualize:

• Darkness settling fully
• The stars appearing
• The heart standing without sight

See ʿIshāʾ as the prayer of surrender.
Creation ← Creator
Creation ≠ Creator

What you cannot see, Allah still governs.${EINSTEIN_QUOTE}`,
    reflectionTitle: 'Prophetic Guidance (Sunnah Support)',
    reflection: `**Virtue of ʿIshāʾ in congregation**

The Prophet ﷺ said:
"Whoever prays ʿIshāʾ in congregation, it is as if he prayed half the night."
— Sahih Muslim

**ʿIshāʾ and Fajr: the Bookends of Faith**

The Prophet ﷺ said:
"Whoever prays the two cool prayers (al-bardayn) will enter Paradise."
(Fajr and ʿIshāʾ)
— Sahih al-Bukhari

**📌 These two prayers (Maghrib + Isha):**
• Are performed in darkness
• Test sincerity
• Frame the believer's entire day

**Final Reflection**

ʿIshāʾ teaches that faith does not depend on visibility.
It is worship offered when effort ends and trust begins.

Prayer at night declares:
• I release control
• I trust what I cannot manage
• I rely on Allah beyond what I can see

Whoever ends the day with ʿIshāʾ
learns to entrust both night and life to Allah.`
  }
};
