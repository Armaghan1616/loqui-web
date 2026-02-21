// App.js — Loqui (Expo React Native)
// Build: long lessons + paraphrase buttons + disable Check until answer + Settings/Rename + Achievements page

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  StatusBar,
  TextInput,
  Animated,
  Easing,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* =================== THEME =================== */
const colors = { navy: '#1A2B4C', gold: '#F5B642', white: '#FFFFFF', bg0: '#111728' };

/* =================== MODEL =================== */
const SKILL = {
  BodyLanguage: { key: 'BodyLanguage', emoji: '🧍‍♂️', label: 'Body Language' },
  Structure:    { key: 'Structure',    emoji: '🧩',   label: 'Structure' },
  Rhetoric:     { key: 'Rhetoric',     emoji: '✨',   label: 'Rhetoric' },
  Voice:        { key: 'Voice',        emoji: '🎙️',  label: 'Voice' },
};

/* ========== BADGES ========== */
const BADGE_ORDER = [
  ['Rookie', 'First Lesson'],
  ['Perfect', 'Perfect Lesson'],
  ['TwoInADay', '2 in a Day'],
  ['Streak3', '3-Day Streak'],
  ['Streak7', '7-Day Streak'],
  ['Streak14', '14-Day Streak'],
  ['XP100', '100 XP'],
  ['XP250', '250 XP'],
  ['XP500', '500 XP'],
  ['Body3', 'Body x3'],
  ['Voice3', 'Voice x3'],
  ['Struct3', 'Structure x3'],
  ['Rhet3', 'Rhetoric x3'],
];
const BADGE_DESC = {
  Rookie:  'Complete your first lesson.',
  Perfect: 'Finish any lesson with all answers correct.',
  TwoInADay: 'Complete two lessons in a single day.',
  Streak3: 'Practice 3 days in a row.',
  Streak7: 'Practice 7 days in a row.',
  Streak14:'Practice 14 days in a row.',
  XP100:   'Reach 100 total XP.',
  XP250:   'Reach 250 total XP.',
  XP500:   'Reach 500 total XP.',
  Body3:   'Finish 3 Body Language lessons.',
  Voice3:  'Finish 3 Voice lessons.',
  Struct3: 'Finish 3 Structure lessons.',
  Rhet3:   'Finish 3 Rhetoric lessons.',
};

/* =================== CONTENT (longer lessons) =================== */
// step types: { type:'info', title?:string, text:string } | { type:'mcq', id, prompt, choices[], answerIndex, tip }
const CONTENT = {
  BodyLanguage: [
    { id: 'bl1', title: 'Stance & Posture', steps: [
      { type:'info', title:'Foundation', text:
        'Body language matters more than most people think: if your posture looks unsure, your message sounds unsure. Stand with feet shoulder-width apart so your weight is balanced, keep your knees soft (not locked), and gently open your chest by rolling the shoulders down and back. This posture reduces visible tension, keeps your breathing free, and signals calm confidence before you say a word.' },
      { type:'info', title:'Hands', text:
        'Your hands are part of the message. Keep them visible inside a natural “gesture box” between your chest and waist. Use open-palmed gestures when explaining, show numbers on your fingers when listing, and let your hands rest neutrally at your sides between points. Avoid pocketing, sleeve-pulling, pen-clicking, or constant fidgeting—each reads as nervous energy and steals attention from your words.' },
      { type:'mcq', id:'q_bl1_1', prompt:'Which stance best signals confidence?', choices:[
        'Feet together, hands in pockets','Feet shoulder-width, relaxed arms','Arms crossed tightly','Constant pacing'
      ], answerIndex:1, tip:'Stable base + open posture = credible presence.' },
    ]},
    { id: 'bl2', title: 'Eye Contact (Triangle Scan)', steps: [
      { type:'info', title:'Why it works', text:
        'Eye contact is a warmth and attention signal. In groups, a simple triangle scan—left, center, right—helps everyone feel included. Hold a spot for a phrase or sentence, then shift. This pacing reads as intentional and calm, not darting. When people feel seen, they listen longer and rate you as more trustworthy.' },
      { type:'info', title:'How to do it', text:
        'Before you speak, pick three anchor points across the room (or camera). Deliver a thought to one anchor, then move your gaze smoothly to the next for your next thought. Skip the habit of staring at your slides or your notes; your audience is the main visual. If a single person is dominating your attention, intentionally include other zones to rebalance the room.' },
      { type:'mcq', id:'q_bl2_1', prompt:'Best gaze pattern for a room?', choices:[
        'On slides','Down at notes','Triangle scan across the room','Over audience heads'
      ], answerIndex:2, tip:'Triangle scans keep the whole room engaged.' },
    ]},
    { id: 'bl3', title: 'Gesture Smart', steps: [
      { type:'info', title:'Match meaning', text:
        'Gestures land best when they match the meaning of your words. Show size with your hands when describing scale, separate your hands to contrast two ideas, and draw numbers when counting a list. This “iconic” gesturing helps listeners build a mental picture and speeds understanding.' },
      { type:'info', title:'Right size', text:
        'Aim for medium-sized gestures that sit comfortably between your chest and waist. Huge windmill arms distract; tiny wrist-only gestures vanish. Imagine your gestures as underlining the key word in each sentence—nothing flashy, just clear emphasis on the idea that matters.' },
      { type:'mcq', id:'q_bl3_1', prompt:'Best guideline for gestures?', choices:[
        'Hide hands','Huge gestures constantly','Match gestures to message inside a natural box','Point at people frequently'
      ], answerIndex:2, tip:'Purpose beats volume.' },
    ]},
    { id: 'bl4', title: 'Movement with Meaning', steps: [
      { type:'info', title:'Anchor vs move', text:
        'Movement resets attention—but only when it has purpose. Plant your feet while landing an important line; shift your position during transitions (“Now that we’ve covered the problem…”). This creates a visual chapter break and gives the audience a moment to catch up, which lowers cognitive load and keeps energy fresh.' },
      { type:'mcq', id:'q_bl4_1', prompt:'When is movement most effective?', choices:[
        'During key sentence','Only at the end','On transitions between points','Never move'
      ], answerIndex:2, tip:'Anchor key lines; move to mark transitions.' },
    ]},
    { id: 'bl5', title: 'Face & Micro-smile', steps: [
      { type:'info', title:'Warmth cue', text:
        'A slight micro-smile at the opening communicates safety and approachability; it’s not a grin, just a relaxed mouth and soft eyes. This tiny shift lowers audience threat detection and makes your voice sound friendlier. Use it at the start of a talk or after a tough point to bring the room back to you.' },
      { type:'mcq', id:'q_bl5_1', prompt:'Why use a micro-smile at openings?', choices:[
        'To look sarcastic','To signal warmth and lower threat','To speak louder','To avoid eye contact'
      ], answerIndex:1, tip:'Warmth + credibility build faster with an open expression.' },
    ]},
  ],
  Structure: [
    { id: 'st1', title: 'Hook–Bridge–Payoff', steps: [
      { type:'info', title:'Hook', text:
        'Audiences decide fast whether to lean in. Start with something that earns attention: a short story, a vivid question, or a surprising number. The hook is not fluff—it sets up the curiosity your talk will satisfy.' },
      { type:'info', title:'Bridge', text:
        'After the hook, connect it to the problem your audience cares about. One crisp line is enough: “That’s why today we’re tackling…” The bridge locks the relevance and points the room toward your solution.' },
      { type:'info', title:'Payoff', text:
        'Deliver your key idea and what it changes. Name a clear benefit or next step. If people leave with one sentence they can repeat, you’ve succeeded.' },
      { type:'mcq', id:'q_st1_1', prompt:'Best short-talk arc?', choices:[
        'Apology–Details–Appendix','Hook–Bridge–Payoff','Topic–Body–References','Quote–Data–Data'
      ], answerIndex:1, tip:'Hook attention → connect → deliver value.' },
    ]},
    { id: 'st2', title: 'Rule of Three', steps: [
      { type:'info', title:'Memory', text:
        'Triads are easy to follow and remember. Group your ideas into three buckets and label them clearly. The rhythm (“first… second… third…”) helps listeners track progress and gives your talk a satisfying shape.' },
      { type:'mcq', id:'q_st2_1', prompt:'Why use the “rule of three”?', choices:[
        'It looks fancy','It improves recall and rhythm','It shortens any talk','It avoids repetition'
      ], answerIndex:1, tip:'Triads feel complete.' },
    ]},
    { id: 'st3', title: 'Signposting', steps: [
      { type:'info', title:'Orientation', text:
        'Tell them where you are and where you’re going. Preview your points up front, use transitions between them, and recap briefly at the end. These signposts cut mental friction and make even complex topics feel organized.' },
      { type:'mcq', id:'q_st3_1', prompt:'Signposting mainly helps with…', choices:[
        'Eye contact','Breathing','Audience orientation','Volume'
      ], answerIndex:2, tip:'Clear structure keeps listeners with you.' },
    ]},
    { id: 'st4', title: 'Transitions', steps: [
      { type:'info', title:'Bridges', text:
        'Use deliberate phrases to move the audience smoothly: “First…”, “Next…”, “Let’s switch gears…”, “Now that we’ve seen X, we’ll explore Y.” Each bridge is a small promise that the path ahead is clear.' },
      { type:'mcq', id:'q_st4_1', prompt:'Which is a strong transition?', choices:[
        'Anyway…','So yeah…','Now that we’ve defined the problem, let’s explore options.','Umm…'
      ], answerIndex:2, tip:'Explicit links prevent whiplash.' },
    ]},
    { id: 'st5', title: 'Close with a Punch', steps: [
      { type:'info', title:'Finish strong', text:
        'End with the one thing you want remembered: a single sentence that captures value plus a call-to-action (“Try this this week”). People recall the last line best—make it count and land it slowly.' },
      { type:'mcq', id:'q_st5_1', prompt:'Best way to end?', choices:[
        'New topic','Soft “that’s it”','Crisp summary and/or call-to-action','Ask for time'
      ], answerIndex:2, tip:'Recency effect: last line lingers.' },
    ]},
  ],
  Rhetoric: [
    { id: 'rh1', title: 'Ethos / Pathos / Logos', steps: [
      { type:'info', title:'The trio', text:
        'Great talks balance credibility (Ethos), emotion (Pathos), and reasoning (Logos). If one is missing, the message struggles: pure logic sounds cold, pure emotion feels manipulative, and credibility alone can be boring. Blend them for impact.' },
      { type:'mcq', id:'q_rh1_1', prompt:'Appeal to emotion is…', choices:[
        'Ethos','Pathos','Logos','Kairos'
      ], answerIndex:1, tip:'Pathos moves hearts; Logos convinces; Ethos earns trust.' },
    ]},
    { id: 'rh2', title: 'Anaphora', steps: [
      { type:'info', title:'Repetition start', text:
        'Repeating the start of consecutive phrases focuses attention and builds momentum: “We will build… We will learn… We will share…”. Use it for emphasis near a close or when you want the room to feel the rhythm of your point.' },
      { type:'mcq', id:'q_rh2_1', prompt:'“We will… We will… We will…” is…', choices:[
        'Metaphor','Anaphora','Antithesis','Euphemism'
      ], answerIndex:1, tip:'Repetition at the start = anaphora.' },
    ]},
    { id: 'rh3', title: 'Antithesis', steps: [
      { type:'info', title:'Opposites', text:
        'Contrast makes choices sharp: “Not X, but Y.” Placing opposites side by side helps the audience encode the difference. It’s especially useful when you want to steer attention away from a common mistake toward a better alternative.' },
      { type:'mcq', id:'q_rh3_1', prompt:'Which line is antithesis?', choices:[
        'Time is a thief','Ask not what your country can do…','Better to light a candle than curse the darkness','The leaves danced'
      ], answerIndex:2, tip:'Opposition clarifies.' },
    ]},
    { id: 'rh4', title: 'Chiasmus', steps: [
      { type:'info', title:'Inversion', text:
        'Chiasmus flips structure: A–B then B–A. The mirror makes the idea memorable and punchy. You don’t need to be poetic—short and clean works: “We shape tools; then tools shape us.”' },
      { type:'mcq', id:'q_rh4_1', prompt:'Chiasmus means…', choices:[
        'Sound repetition','Inverted structure','Three items','Exaggeration'
      ], answerIndex:1, tip:'AB → BA.' },
    ]},
    { id: 'rh5', title: 'Metaphor vs Simile', steps: [
      { type:'info', title:'Compare vs equate', text:
        'Metaphor equates two things (“Time is a thief”); simile compares them using like/as (“Time is like a river”). Both compress meaning and help abstract ideas feel concrete—use sparingly to avoid cliché.' },
      { type:'mcq', id:'q_rh5_1', prompt:'“Ideas are seeds” is a…', choices:[
        'Metaphor','Simile','Alliteration','Hyperbole'
      ], answerIndex:0, tip:'Metaphor equates; simile compares.' },
    ]},
  ],
  Voice: [
    { id: 'vo1', title: 'Diaphragmatic Breathing', steps: [
      { type:'info', title:'Support', text:
        'Project from the breath, not the throat. Place a hand on your belly and inhale so the hand rises. This engages the diaphragm, steadies your tone, and prevents the “shaky voice” that comes from shallow chest breathing.' },
      { type:'mcq', id:'q_vo1_1', prompt:'Best breathing for a steady voice?', choices:[
        'Clavicular (high chest)','Holding breath','Diaphragmatic (belly)','Rapid shallow'
      ], answerIndex:2, tip:'Low, supportive breaths fuel stable sound.' },
    ]},
    { id: 'vo2', title: 'Pause for Emphasis', steps: [
      { type:'info', title:'Contrast', text:
        'Silence is a spotlight. Pause just before or just after a key word to raise its importance. The small gap adds contrast and gives listeners time to digest, making your message feel calm and deliberate.' },
      { type:'mcq', id:'q_vo2_1', prompt:'What makes a word stand out most?', choices:[
        'Speaking faster','Louder only','Pausing right before it','Looking away'
      ], answerIndex:2, tip:'Contrast makes it pop.' },
    ]},
    { id: 'vo3', title: 'Pitch · Pace · Volume', steps: [
      { type:'info', title:'Variety', text:
        'Monotone loses rooms. Nudge your pitch up for enthusiasm, slow your pace slightly on important lines, and modulate volume to avoid flatness. Variety keeps attention without sounding theatrical.' },
      { type:'mcq', id:'q_vo3_1', prompt:'For clarity on key lines you should…', choices:[
        'Speed up','Slow and articulate','Whisper','Shout'
      ], answerIndex:1, tip:'Slow + clear > fast + muddy.' },
    ]},
    { id: 'vo4', title: 'Articulation', steps: [
      { type:'info', title:'Consonants', text:
        'Clarity lives in consonants, especially word endings. Lightly over-articulate when speaking to a room or into a microphone; it feels odd to you but sounds crisp to listeners.' },
      { type:'mcq', id:'q_vo4_1', prompt:'Which improves intelligibility most?', choices:[
        'More volume only','Crisp consonants and clear endings','Lower pitch','Looking at slides'
      ], answerIndex:1, tip:'Consonant energy = clarity.' },
    ]},
    { id: 'vo5', title: 'Filler Words → Pause', steps: [
      { type:'info', title:'Replace filler', text:
        'When your brain is searching, your mouth fills the gap with “um/uh/like.” Train a micro-pause instead. It buys time without lowering credibility and makes you sound precise.' },
      { type:'mcq', id:'q_vo5_1', prompt:'Best fix for filler words?', choices:[
        'Talk nonstop','Avoid eye contact','Add micro-pauses instead','Speak very quietly'
      ], answerIndex:2, tip:'Silence beats filler.' },
    ]},
  ],
};
/* ========== GENERATOR FACTS (for smart lessons) ========== */
const FACTS = {
  BodyLanguage: [
    { title:'Open Posture',       text:'Open chest + relaxed shoulders reduce threat and raise credibility.' },
    { title:'Gesture Box',        text:'Keep gestures natural between chest and waist; match meaning.' },
    { title:'Purposeful Movement',text:'Move on transitions, anchor for key lines.' },
  ],
  Structure: [
    { title:'Clear Arc',   text:'Hook → Bridge → Payoff is a reliable short-talk frame.' },
    { title:'Signposting', text:'Preview → transitions → recap to orient the audience.' },
  ],
  Rhetoric: [
    { title:'Triad Appeals', text:'Balance Ethos (credibility), Pathos (emotion), Logos (logic).' },
    { title:'Anaphora',      text:'Repeat openings to build momentum and memory.' },
  ],
  Voice: [
    { title:'Breath Support',   text:'Low diaphragmatic breathing steadies tone.' },
    { title:'Strategic Pauses', text:'Silence before/after key words increases salience.' },
  ],
};

/* =================== PERSISTENCE KEYS =================== */
const K = {
  onboarded: 'loqui_onboarded',
  name: 'loqui_name',
  xp: 'loqui_xp',
  streak: 'loqui_streak',
  lastDay: 'loqui_last_day',
  mastery: 'loqui_mastery',
  completed: 'loqui_completed',
  badges: 'loqui_badges',
  todayDay: 'loqui_today_day',
  todayCount: 'loqui_today_count',
  generated: 'loqui_generated_lessons',
};

/* =================== HELPERS =================== */
// quizId → { skillKey, lessonId }
const buildQuizIndex = (generated) => {
  const idx = {};
  Object.keys(CONTENT).forEach(sk => {
    CONTENT[sk].forEach(les => les.steps.forEach(s => { if (s.type==='mcq') idx[s.id] = { skillKey: sk, lessonId: les.id }; }));
  });
  generated.forEach(g => g.lesson.steps.forEach(s => { if (s.type==='mcq') idx[s.id] = { skillKey: g.skillKey, lessonId: g.lesson.id }; }));
  return idx;
};

// on-device paraphrase for info slides (no network)
function explainDifferently(text) {
  const short = text.replace(/\s+/g,' ').trim();
  const bullets = [
    'Why it matters: ' + (short.slice(0, 80)) + (short.length>80?'…':''),
    'How to do it: Keep it simple and consistent in real talks.',
    'Watch out: Avoid the common opposite behavior (nerves, over-speed, or fidgeting).',
  ];
  const example = 'Example: Imagine explaining this to a friend in 30 seconds—what would you say?';
  return bullets.map(b => '• ' + b).join('\n') + '\n' + example;
}

/* =================== APP =================== */
export default function App() {
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState('boot'); // onboarding | splash | home | skill | lesson | settings | achievements
  const [name, setName] = useState('');

  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastDay, setLastDay] = useState(0);
  const [mastery, setMastery] = useState({}); // quizId -> SM-2 fields + stats
  const [completed, setCompleted] = useState({});
  const [badges, setBadges] = useState({});
  const [todayDay, setTodayDay] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [generated, setGenerated] = useState([]);

  const [skillKey, setSkillKey] = useState(null);
  const [lesson, setLesson] = useState(null);

  useEffect(() => { (async () => {
    try {
      const keys = [K.onboarded, K.name, K.xp, K.streak, K.lastDay, K.mastery, K.completed, K.badges, K.todayDay, K.todayCount, K.generated];
      const vals = await AsyncStorage.multiGet(keys);
      const map = Object.fromEntries(vals);
      const onboarded = map[K.onboarded] === '1';
      if (map[K.name]) setName(map[K.name]);
      if (map[K.xp]) setXP(parseInt(map[K.xp]));
      if (map[K.streak]) setStreak(parseInt(map[K.streak]));
      if (map[K.lastDay]) setLastDay(parseInt(map[K.lastDay]));
      if (map[K.mastery]) setMastery(JSON.parse(map[K.mastery]));
      if (map[K.completed]) setCompleted(JSON.parse(map[K.completed]));
      if (map[K.badges]) setBadges(JSON.parse(map[K.badges]));
      if (map[K.todayDay]) setTodayDay(parseInt(map[K.todayDay]));
      if (map[K.todayCount]) setTodayCount(parseInt(map[K.todayCount]));
      if (map[K.generated]) setGenerated(JSON.parse(map[K.generated]));
      setReady(true);
      setRoute(onboarded ? 'splash' : 'onboarding');
    } catch (e) { setReady(true); setRoute('onboarding'); }
  })(); }, []);

  const save = async (updates) => {
    const pairs = [];
    if ('name' in updates) { setName(updates.name); pairs.push([K.name, updates.name]); }
    if ('xp' in updates) { setXP(updates.xp); pairs.push([K.xp, String(updates.xp)]); }
    if ('streak' in updates) { setStreak(updates.streak); pairs.push([K.streak, String(updates.streak)]); }
    if ('lastDay' in updates) { setLastDay(updates.lastDay); pairs.push([K.lastDay, String(updates.lastDay)]); }
    if ('mastery' in updates) { setMastery(updates.mastery); pairs.push([K.mastery, JSON.stringify(updates.mastery)]); }
    if ('completed' in updates) { setCompleted(updates.completed); pairs.push([K.completed, JSON.stringify(updates.completed)]); }
    if ('badges' in updates) { setBadges(updates.badges); pairs.push([K.badges, JSON.stringify(updates.badges)]); }
    if ('todayDay' in updates) { setTodayDay(updates.todayDay); pairs.push([K.todayDay, String(updates.todayDay)]); }
    if ('todayCount' in updates) { setTodayCount(updates.todayCount); pairs.push([K.todayCount, String(updates.todayCount)]); }
    if ('generated' in updates) { setGenerated(updates.generated); pairs.push([K.generated, JSON.stringify(updates.generated)]); }
    if (pairs.length) await AsyncStorage.multiSet(pairs);
  };

  const markOnboarded = async (n) => {
    await AsyncStorage.multiSet([[K.onboarded, '1'], [K.name, n]]);
    setName(n); setRoute('splash');
  };

  const awardBadges = (params) => {
    const { newXP, newCompleted, newStreak, allCorrect, todayCountNow } = params;
    const counts = { BodyLanguage:0, Structure:0, Rhetoric:0, Voice:0 };
    Object.keys(CONTENT).forEach(sk => CONTENT[sk].forEach(les => { if (newCompleted[les.id]) counts[sk]++; }));
    generated.forEach(g => { if (newCompleted[g.lesson.id]) counts[g.skillKey] = (counts[g.skillKey]||0)+1; });

    const nb = { ...badges };
    if (!nb.Rookie && Object.values(newCompleted).some(Boolean)) nb.Rookie = true;
    if (!nb.XP100 && newXP >= 100) nb.XP100 = true;
    if (!nb.XP250 && newXP >= 250) nb.XP250 = true;
    if (!nb.XP500 && newXP >= 500) nb.XP500 = true;
    if (!nb.Perfect && allCorrect) nb.Perfect = true;
    if (!nb.TwoInADay && todayCountNow >= 2) nb.TwoInADay = true;
    if (!nb.Streak3 && newStreak >= 3) nb.Streak3 = true;
    if (!nb.Streak7 && newStreak >= 7) nb.Streak7 = true;
    if (!nb.Streak14 && newStreak >= 14) nb.Streak14 = true;
    if (!nb.Body3 && counts.BodyLanguage >= 3) nb.Body3 = true;
    if (!nb.Struct3 && counts.Structure   >= 3) nb.Struct3 = true;
    if (!nb.Rhet3 && counts.Rhetoric      >= 3) nb.Rhet3 = true;
    if (!nb.Voice3 && counts.Voice        >= 3) nb.Voice3 = true;

    save({ badges: nb });
  };

  const touchStreak = () => {
    const now = Date.now();
    const day = Math.floor(now / (24*3600*1000));
    let ns = streak;
    if (lastDay === 0) ns = 1; else if (day - lastDay === 1) ns = streak + 1; else if (day - lastDay > 1) ns = 1;
    save({ streak: ns, lastDay: day });
    return ns;
  };

  const getLessons = (sk) => {
    const base = CONTENT[sk] || [];
    const extra = generated.filter(g => g.skillKey === sk).map(g => g.lesson);
    return [...base, ...extra];
  };

  // adaptive: choose lessons with lowest mastery/soonest due (spaced repetition)
  const recommended = useMemo(() => {
    const items = [];
    Object.keys(SKILL).forEach(sk => {
      getLessons(sk).forEach(les => {
        const quizIds = les.steps.filter(s => s.type==='mcq').map(s=>s.id);
        const score = quizIds.reduce((acc,id)=>{
          const m = mastery[id] || { due:0, reps:0 };
          return acc + ((m.due||0) - Date.now()) + (m.reps*60000);
        }, 0);
        items.push({ sk, lesson: les, score });
      });
    });
    return items.sort((a,b)=>a.score-b.score).slice(0,3);
  }, [mastery, completed, generated]);

  // Weakest skill by accuracy (correct/shown). Fallback to least completed.
  const weakestSkill = () => {
    const idx = buildQuizIndex(generated);
    const tallies = {}; // skill -> {correct, shown, done}
    Object.keys(SKILL).forEach(sk => tallies[sk] = { correct:0, shown:0, done:0 });

    Object.entries(mastery).forEach(([qid, m]) => {
      const meta = idx[qid];
      if (meta) {
        tallies[meta.skillKey].correct += (m.correct || 0);
        tallies[meta.skillKey].shown   += (m.shown   || 0);
      }
    });
    Object.keys(SKILL).forEach(sk => {
      tallies[sk].done = getLessons(sk).filter(les => completed[les.id]).length;
    });

    const scored = Object.entries(tallies).map(([sk, t]) => {
      const acc = t.shown > 0 ? t.correct / t.shown : 1;
      return { sk, acc, done: t.done };
    });
    scored.sort((a,b) => (a.acc === b.acc ? a.done - b.done : a.acc - b.acc));
    return scored[0]?.sk || 'BodyLanguage';
  };

  const makeMCQ = (sk) => {
    if (sk==='BodyLanguage') return { type:'mcq', id:`q_${Date.now()}`, prompt:'When should you move most during a talk?', choices:['During key lines','Only at the end','On transitions','Never'], answerIndex:2, tip:'Anchor for key lines; move on transitions.' };
    if (sk==='Structure')    return { type:'mcq', id:`q_${Date.now()}`, prompt:'Which sequence suits a short talk?', choices:['Apology–Details–Appendix','Hook–Bridge–Payoff','Topic–Body–References','Data–Data–Data'], answerIndex:1, tip:'Hook → Bridge → Payoff.' };
    if (sk==='Rhetoric')     return { type:'mcq', id:`q_${Date.now()}`, prompt:'Repeating the opening word is…', choices:['Metaphor','Anaphora','Euphemism','Irony'], answerIndex:1, tip:'Anaphora = repeated openings.' };
    return { type:'mcq', id:`q_${Date.now()}`, prompt:'Best way to highlight a key word?', choices:['Speak faster','Pause around it','Look away','Shout it'], answerIndex:1, tip:'Contrast via pause makes it pop.' };
  };

  const generateSmartLesson = async () => {
    const sk = weakestSkill();
    const pool = FACTS[sk] || [];
    const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
    const f1 = pick(pool), f2 = pick(pool.filter(x=>x!==f1)) || pick(pool);
    const id = `gen_${sk}_${Date.now()}`;
    const mcq = makeMCQ(sk);
    const lesson = { id, title: `${SKILL[sk].label}: ${f1.title}`, steps: [
      { type:'info', title:f1.title, text:f1.text },
      { type:'info', title:f2.title, text:f2.text },
      mcq,
    ]};
    const g = [...generated, { skillKey: sk, lesson }];
    await save({ generated: g });
    setSkillKey(sk); setLesson(lesson); setRoute('lesson');
  };

  const signOut = async (resetAll) => {
    if (resetAll) {
      await AsyncStorage.multiRemove([K.onboarded, K.name, K.xp, K.streak, K.lastDay, K.mastery, K.completed, K.badges, K.todayDay, K.todayCount, K.generated]);
      setName(''); setXP(0); setStreak(0); setLastDay(0); setMastery({}); setCompleted({}); setBadges({}); setTodayDay(0); setTodayCount(0); setGenerated([]);
    } else {
      await AsyncStorage.multiRemove([K.onboarded, K.name]);
      setName('');
    }
    setRoute('onboarding');
  };

  if (!ready) return <Safe />;

  switch (route) {
    case 'onboarding':  return <Onboarding onDone={markOnboarded} />;
    case 'splash':      return <Splash name={name} onEnd={() => setRoute('home')} />;
    case 'home':        return (
      <Home
        name={name}
        xp={xp}
        streak={streak}
        badges={badges}
        recommended={recommended}
        onOpenSettings={() => setRoute('settings')}
        onOpenAchievements={() => setRoute('achievements')}
        onOpenSkill={(sk) => { setSkillKey(sk); setRoute('skill'); }}
        onOpenLesson={(sk, les) => { setSkillKey(sk); setLesson(les); setRoute('lesson'); }}
        onSmartLesson={generateSmartLesson}
      />
    );
    case 'achievements': return <AchievementsScreen badges={badges} onBack={() => setRoute('home')} />;
    case 'settings':     return (
      <SettingsScreen
        name={name}
        onBack={() => setRoute('home')}
        onRename={(newName)=> save({ name: newName })}
        onSignOut={() => Alert.alert('Sign out?', "You'll need to enter your name again.", [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign out', style: 'destructive', onPress: () => signOut(false) },
          { text: 'Reset all', onPress: () => signOut(true) },
        ])}
      />
    );
    case 'skill':       return (
      <SkillScreen
        getLessons={getLessons}
        skillKey={skillKey}
        completed={completed}
        onBack={() => setRoute('home')}
        onOpenLesson={(les) => { setLesson(les); setRoute('lesson'); }}
      />
    );
    case 'lesson':      return (
      <LessonPlayer
        skillKey={skillKey}
        lesson={lesson}
        mastery={mastery}
        onBack={() => setRoute('skill')}
        onComplete={(result) => {
          const ns = touchStreak();
          const day = Math.floor(Date.now() / (24*3600*1000));
          let tDay = todayDay; let tCount = todayCount;
          if (tDay === day) tCount = todayCount + 1; else { tDay = day; tCount = 1; }
          save({ todayDay: tDay, todayCount: tCount });

          const newXP = xp + result.gainedXP;
          const nm = { ...mastery };
          result.answered.forEach(a => {
            const m = nm[a.id] || { reps:0, interval:0, easiness:2.5, due:0, correct:0, shown:0 };
            const quality = a.correct ? 5 : 2;
            m.easiness = Math.max(1.3, m.easiness + (0.1 - (5-quality)*(0.08 + (5-quality)*0.02)));
            if (quality < 3) { m.reps = 0; m.interval = 0; }
            else { m.reps += 1; m.interval = m.reps===1?1: m.reps===2?3: Math.round(m.interval * m.easiness); }
            m.due = Date.now() + Math.max(1, m.interval) * 24*3600*1000;
            m.shown += 1; if (a.correct) m.correct += 1;
            nm[a.id] = m;
          });
          const nc = { ...completed, [lesson.id]: true };
          save({ xp: newXP, mastery: nm, completed: nc });
          awardBadges({ newXP, newCompleted: nc, newStreak: ns, allCorrect: !!result.allCorrect, todayCountNow: tCount });
          setRoute('skill');
        }}
      />
    );
    default:            return <Safe />;
  }
}
/* =================== SCREENS =================== */
const Safe = () => (<SafeAreaView style={{ flex: 1, backgroundColor: colors.bg0 }}><StatusBar barStyle="light-content" /></SafeAreaView>);

function Onboarding({ onDone }) {
  const [n, setN] = useState('');
  return (
    <SafeAreaView style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={{ alignItems: 'center', marginTop: 80 }}>
        <Text style={{ fontSize: 64 }}>👑</Text>
        <Text style={styles.bigTitle}>Loqui</Text>
        <Text style={styles.subTitle}>Learn public speaking the fun way</Text>
      </View>
      <View style={{ marginTop: 40, paddingHorizontal: 24 }}>
        <Text style={styles.label}>Your name</Text>
        <TextInput
          placeholder="e.g., Armaghan"
          placeholderTextColor={'rgba(255,255,255,0.5)'}
          value={n}
          onChangeText={setN}
          style={styles.input}
        />
        <Pressable onPress={() => { if (n.trim().length > 0) onDone(n.trim()); }} style={({ pressed }) => [styles.primaryBtn, { opacity: n.trim() ? 1 : 0.6, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
          <Text style={styles.primaryBtnText}>Create account</Text>
        </Pressable>
        <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10 }}>No password for now — local only.</Text>
      </View>
    </SafeAreaView>
  );
}

function Splash({ name, onEnd }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.delay(650),
      Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
    ]).start(onEnd);
  }, []);
  return (
    <SafeAreaView style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: fade }}>
        <Text style={{ fontSize: 22, color: colors.white, marginBottom: 6 }}>Welcome to</Text>
        <Text style={{ fontSize: 40, fontWeight: '800', color: colors.gold }}>Loqui</Text>
        <Text style={{ marginTop: 10, color: 'rgba(255,255,255,0.9)' }}>Hi {name || 'there'} 👋</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

function Home({ name, xp, streak, badges, recommended, onOpenSettings, onOpenAchievements, onOpenSkill, onOpenLesson, onSmartLesson }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(()=>{ Animated.timing(fade, { toValue:1, duration:400, useNativeDriver:true, easing:Easing.out(Easing.quad) }).start(); },[]);
  const unlockedCount = BADGE_ORDER.filter(([k]) => badges[k]).length;

  return (
    <SafeAreaView style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        <View style={{ flex: 1 }} />
        <Pressable onPress={onOpenSettings}><Text style={{ color: colors.gold }}>⚙️ Settings</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <Animated.View style={[styles.headerCard, { opacity: fade, transform:[{ translateY: fade.interpolate({ inputRange:[0,1], outputRange:[12,0] }) }]}] }>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.white, opacity: 0.9 }}>Hi {name || 'friend'} 👋</Text>
            <Text style={styles.headerTitle}>Build your voice</Text>
            <Text style={styles.headerSub}>Short, adaptive lessons based on real speaking psychology.</Text>
            <View style={styles.statsRow}>
              <Stat title="Streak" value={`${streak}🔥`} />
              <Stat title="XP" value={`${xp}`} />
              <Stat title="Goal" value={`20`} />
            </View>
          </View>

          <Pressable onPress={onOpenAchievements} style={styles.achButton}>
            <Text style={{ fontSize:18 }}>🏆</Text>
            <View style={{ marginLeft:8 }}>
              <Text style={{ color: colors.white, fontWeight:'800' }}>Achievements</Text>
              <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:12 }}>{unlockedCount}/{BADGE_ORDER.length} unlocked</Text>
            </View>
            <View style={{ flex:1 }} />
            <Text style={{ color:'rgba(255,255,255,0.6)' }}>›</Text>
          </Pressable>
        </Animated.View>

        <View style={{ paddingHorizontal:16 }}>
          <Pressable onPress={onSmartLesson} style={[styles.primaryBtn, { marginTop: 0, marginBottom: 8 }]}>
            <Text style={styles.primaryBtnText}>Start Smart Lesson</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Recommended</Text>
        <View style={{ paddingHorizontal: 16 }}>
          {recommended.map((r, idx) => (
            <Animated.View key={r.lesson.id} style={{ opacity: fade, transform:[{ translateY: fade.interpolate({ inputRange:[0,1], outputRange:[12+idx*2,0] }) }], }}>
              <Pressable onPress={() => onOpenLesson(r.sk, r.lesson)} style={styles.lessonRow}>
                <View style={styles.dot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonTitle}>{r.lesson.title}</Text>
                  <Text style={styles.lessonSub}>{SKILL[r.sk].label}</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.6)' }}>›</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Focus Skills</Text>
        <View style={styles.skillsGrid}>
          {Object.values(SKILL).map((sk, idx) => (
            <Animated.View key={sk.key} style={{ opacity: fade, transform:[{ translateY: fade.interpolate({ inputRange:[0,1], outputRange:[12+idx*2,0] }) }], }}>
              <Pressable onPress={() => onOpenSkill(sk.key)} style={styles.skillBtn}>
                <Text style={styles.skillEmoji}>{sk.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.skillLabel}>{sk.label}</Text>
                  <Text style={styles.skillHint}>Open lessons</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>›</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AchievementsScreen({ badges, onBack }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(()=>{ Animated.timing(fade, { toValue:1, duration:300, useNativeDriver:true }).start(); },[]);
  const [openKey, setOpenKey] = useState(null);
  return (
    <SafeAreaView style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Pressable onPress={onBack}><Text style={{ color: colors.gold }}>‹ Back</Text></Pressable>
        <Text style={{ color: colors.white, fontWeight:'700' }}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>
      <Animated.View style={{ opacity: fade }}>
        <FlatList
          data={BADGE_ORDER}
          keyExtractor={([k])=>k}
          contentContainerStyle={{ padding:16 }}
          renderItem={({ item })=>{
            const [key,label] = item; const unlocked = !!badges[key]; const open = openKey===key;
            return (
              <Pressable onPress={()=> setOpenKey(open?null:key)} style={[styles.achRow, { borderColor: unlocked?colors.gold:'rgba(255,255,255,0.12)' }]}>
                <Text style={{ fontSize:20 }}>{unlocked? '🏅':'🎖️'}</Text>
                <View style={{ marginLeft:10, flex:1 }}>
                  <Text style={{ color:'#fff', fontWeight:'800' }}>{label}</Text>
                  <Text style={{ color: unlocked? colors.gold : 'rgba(255,255,255,0.7)', fontSize:12 }}>{unlocked? 'Unlocked':'Locked'}</Text>
                  {open && (
                    <Text style={{ color:'rgba(255,255,255,0.9)', marginTop:6 }}>{BADGE_DESC[key]}</Text>
                  )}
                </View>
                <Text style={{ color:'rgba(255,255,255,0.6)' }}>{open? '˄' : '˅'}</Text>
              </Pressable>
            );
          }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

function SettingsScreen({ name, onBack, onRename, onSignOut }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(name || '');
  const saveName = () => {
    const v = temp.trim();
    if (!v) return;
    onRename(v);
    setEditing(false);
  };
  return (
    <SafeAreaView style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Pressable onPress={onBack}><Text style={{ color: colors.gold }}>‹ Back</Text></Pressable>
        <Text style={{ color: colors.white, fontWeight: '700' }}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ padding: 16, gap: 14 }}>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Signed in as</Text>
          {!editing ? (
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
              <Text style={{ color: colors.white, fontWeight: '700' }}>{name || 'Unknown'}</Text>
              <Pressable onPress={()=>{ setTemp(name||''); setEditing(true); }} style={[styles.primaryBtn, { paddingVertical: 8, paddingHorizontal: 12, marginTop:0 }]}>
                <Text style={styles.primaryBtnText}>Change name</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap:10 }}>
              <TextInput value={temp} onChangeText={setTemp} placeholder="Your name" placeholderTextColor={'rgba(255,255,255,0.5)'} style={styles.input} />
              <View style={{ flexDirection:'row', gap:10 }}>
                <Pressable onPress={saveName} style={[styles.primaryBtn, { flex:1 }]}><Text style={styles.primaryBtnText}>Save</Text></Pressable>
                <Pressable onPress={()=>{ setEditing(false); setTemp(name||''); }} style={[styles.ghostBtn, { flex:1 }]}><Text style={styles.ghostBtnText}>Cancel</Text></Pressable>
              </View>
            </View>
          )}
        </View>

        <Pressable onPress={onSignOut} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Sign out</Text>
        </Pressable>
        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Tip: Choose “Reset all” to wipe progress too.</Text>
      </View>
    </SafeAreaView>
  );
}

function SkillScreen({ getLessons, skillKey, completed, onBack, onOpenLesson }) {
  const sk = SKILL[skillKey];
  const lessons = getLessons(skillKey);
  return (
    <SafeAreaView style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Pressable onPress={onBack}><Text style={{ color: colors.gold }}>‹ Back</Text></Pressable>
        <Text style={{ color: colors.white, fontWeight: '700' }}>{sk.emoji} {sk.label}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={lessons}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpenLesson(item)} style={styles.lessonRow}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <Text style={styles.lessonSub}>{completed[item.id] ? 'Completed' : 'Start lesson'}</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>›</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function LessonPlayer({ skillKey, lesson, mastery, onBack, onComplete }) {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const [answered, setAnswered] = useState([]);
  const [alt, setAlt] = useState(false); // “Explain differently”
  const step = lesson.steps[i];
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start(); }, [i]);
  useEffect(() => { setSel(null); setShowTip(false); setAlt(false); }, [i]);

  const next = () => {
    if (step.type === 'info') { setI(i + 1); return; }
    if (step.type === 'mcq' && !showTip) { setShowTip(true); return; }
    const ni = i + 1;
    if (ni >= lesson.steps.length) {
      const gainedXP = answered.reduce((acc, a) => acc + (a.correct ? 12 : 5), 0);
      const allCorrect = answered.length > 0 && answered.every(a => a.correct);
      onComplete({ gainedXP, answered, allCorrect });
    } else { setI(ni); }
  };

  const choose = (idx) => {
    if (step.type !== 'mcq' || showTip) return;
    setSel(idx);
    const correct = idx === step.answerIndex;
    setAnswered(prev => prev.some(a => a.id === step.id) ? prev : [...prev, { id: step.id, correct }]);
  };

  const progress = (i+1)/lesson.steps.length;
  const isMCQ = step.type === 'mcq';
  const canCheck = !(isMCQ && !showTip && sel === null);

  return (
    <SafeAreaView style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Pressable onPress={onBack}><Text style={{ color: colors.gold }}>‹ Back</Text></Pressable>
        <Text style={{ color: colors.white, fontWeight: '700' }}>{SKILL[skillKey].emoji} {lesson.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress*100}%` }]} /></View>

      <Animated.View style={[styles.lessonBox, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
        <ScrollView contentContainerStyle={styles.lessonContent}>
          {!isMCQ ? (
            <>
              {step.title && <Text style={styles.cardTitle}>{step.title}</Text>}
              <Text style={styles.cardText}>{alt ? explainDifferently(step.text) : step.text}</Text>

              {/* Info actions */}
              <View style={styles.infoActionsRow}>
                {i>0 && (
                  <Pressable onPress={() => setI(i-1)} style={styles.ghostBtn}>
                    <Text style={styles.ghostBtnText}>Go back</Text>
                  </Pressable>
                )}
                <View style={{ flex:1 }} />
                <Pressable onPress={() => setAlt(a=>!a)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{alt? 'Show original' : 'Explain differently'}</Text>
                </Pressable>
                <Pressable onPress={next} style={[styles.primaryBtn, { marginTop: 0, marginLeft: 10 }]}>
                  <Text style={styles.primaryBtnText}>Got it</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Check your understanding</Text>
              <Text style={styles.cardText}>{step.prompt}</Text>
              <View style={{ height: 8 }} />
              {step.choices.map((ch, idx) => {
                const chosen = sel === idx;
                const correct = idx === step.answerIndex;
                const bg = chosen ? (showTip ? (correct ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)') : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.06)';
                const border = showTip && correct ? 'rgba(34,197,94,1)' : 'rgba(255,255,255,0.1)';
                return (
                  <Pressable key={idx} onPress={() => choose(idx)} disabled={showTip} style={[styles.choice, { backgroundColor: bg, borderColor: border }]}>
                    <Text style={styles.choiceText}>{ch}</Text>
                  </Pressable>
                );
              })}
              {showTip && <Tip text={step.tip} />}
            </>
          )}
        </ScrollView>
      </Animated.View>

      <Pressable onPress={next} disabled={!canCheck} style={[styles.primaryBtn, { margin: 16, opacity: canCheck ? 1 : 0.5 }]}>
        <Text style={styles.primaryBtnText}>{isMCQ && !showTip ? 'Check' : (i === lesson.steps.length - 1 ? 'Finish' : 'Next')}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

/* =================== UI BITS =================== */
const Stat = ({ title, value }) => (
  <View style={styles.statChip}><Text style={styles.statTitle}>{title}</Text><Text style={styles.statValue}>{value}</Text></View>
);
const Tip = ({ text }) => (
  <View style={styles.tip}><Text style={{ color: colors.gold, marginRight: 6 }}>💡</Text><Text style={{ color: colors.white, flex: 1 }}>{text}</Text></View>
);

/* =================== STYLES =================== */
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg0 },
  bigTitle: { color: colors.white, fontSize: 38, fontWeight: '900', marginTop: 10 },
  subTitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  label: { color: colors.white, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },

  primaryBtn: { backgroundColor: colors.gold, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: colors.navy, fontWeight: '800' },
  secondaryBtn: { backgroundColor: 'rgba(245,182,66,0.15)', borderWidth: 1, borderColor: 'rgba(245,182,66,0.6)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  secondaryBtnText: { color: colors.gold, fontWeight: '800' },
  ghostBtn: { backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ghostBtnText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },

  headerCard: { backgroundColor: 'rgba(255,255,255,0.06)', margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(245,182,66,0.25)', gap: 10 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.85)' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },

  achButton: { marginTop: 8, flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.12)', borderRadius:12, padding:12 },

  sectionTitle: { color: colors.white, fontWeight: '800', fontSize: 18, marginTop: 10, marginHorizontal: 16 },

  skillsGrid: { flexDirection: 'column', gap: 10, paddingHorizontal: 16, marginTop: 10 },
  skillBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, backgroundColor: 'rgba(255,255,255,0.06)', flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  skillEmoji: { fontSize: 22 },
  skillLabel: { color: colors.white, fontWeight: '800' },
  skillHint: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  lessonRow: { flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  dot: { width: 10, height: 10, borderRadius: 4, backgroundColor: colors.gold, marginRight: 10 },
  lessonTitle: { color: colors.white, fontWeight: '800' },
  lessonSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  // Fuller lesson layout
  progressTrack: { height: 6, borderRadius: 999, marginHorizontal: 16, marginTop: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.gold },

  lessonBox: { flex: 1, margin: 16, padding: 22, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, minHeight: '70%' },
  lessonContent: { paddingBottom: 24 },
  cardTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 10 },
  cardText: { color: colors.white, fontSize: 18, lineHeight: 26 },

  infoActionsRow: { flexDirection:'row', alignItems:'center', marginTop: 16 },

  choice: { padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  choiceText: { color: colors.white, fontSize: 16 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 12, borderRadius: 12, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.06)' },

  statChip: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 },
  statTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  statValue: { color: colors.gold, fontSize: 16, fontWeight: '700' },

  settingsRow: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  settingsLabel: { color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  dangerBtn: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.6)', borderRadius: 12, padding: 14, alignItems: 'center' },
  dangerBtnText: { color: '#ff6b6b', fontWeight: '800' },

  achRow: { flexDirection:'row', alignItems:'center', padding:14, backgroundColor:'rgba(255,255,255,0.06)', borderRadius:12, borderWidth:1, marginBottom:10 },
});
