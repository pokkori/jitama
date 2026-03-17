export interface QuizQuestion {
  kanji: string;
  correct: string;
  choices: string[];
  jlpt: "N5" | "N4" | "N3" | "N2" | "N1";
  meaning: string;
}

// N5 — Free
export const N5_QUESTIONS: QuizQuestion[] = [
  { kanji: "山", correct: "やま", choices: ["やま", "かわ", "みず", "はな"], jlpt: "N5", meaning: "mountain" },
  { kanji: "川", correct: "かわ", choices: ["やま", "かわ", "そら", "うみ"], jlpt: "N5", meaning: "river" },
  { kanji: "日", correct: "ひ", choices: ["ひ", "つき", "ほし", "そら"], jlpt: "N5", meaning: "sun/day" },
  { kanji: "月", correct: "つき", choices: ["ひ", "つき", "かぜ", "あめ"], jlpt: "N5", meaning: "moon/month" },
  { kanji: "火", correct: "ひ", choices: ["みず", "ひ", "かぜ", "つち"], jlpt: "N5", meaning: "fire" },
  { kanji: "水", correct: "みず", choices: ["みず", "ひ", "かぜ", "つち"], jlpt: "N5", meaning: "water" },
  { kanji: "木", correct: "き", choices: ["き", "はな", "くさ", "たけ"], jlpt: "N5", meaning: "tree" },
  { kanji: "金", correct: "きん", choices: ["きん", "ぎん", "どう", "てつ"], jlpt: "N5", meaning: "gold/money" },
  { kanji: "土", correct: "つち", choices: ["つち", "いし", "すな", "はな"], jlpt: "N5", meaning: "earth/soil" },
  { kanji: "人", correct: "ひと", choices: ["ひと", "おとこ", "おんな", "こども"], jlpt: "N5", meaning: "person" },
  { kanji: "子", correct: "こ", choices: ["こ", "おや", "ちち", "はは"], jlpt: "N5", meaning: "child" },
  { kanji: "大", correct: "おおきい", choices: ["おおきい", "ちいさい", "ながい", "みじかい"], jlpt: "N5", meaning: "big" },
  { kanji: "小", correct: "ちいさい", choices: ["おおきい", "ちいさい", "ながい", "みじかい"], jlpt: "N5", meaning: "small" },
  { kanji: "上", correct: "うえ", choices: ["うえ", "した", "みぎ", "ひだり"], jlpt: "N5", meaning: "above/up" },
  { kanji: "下", correct: "した", choices: ["うえ", "した", "みぎ", "ひだり"], jlpt: "N5", meaning: "below/down" },
  { kanji: "中", correct: "なか", choices: ["なか", "そと", "まえ", "うしろ"], jlpt: "N5", meaning: "inside/middle" },
  { kanji: "一", correct: "いち", choices: ["いち", "に", "さん", "し"], jlpt: "N5", meaning: "one" },
  { kanji: "二", correct: "に", choices: ["いち", "に", "さん", "し"], jlpt: "N5", meaning: "two" },
  { kanji: "三", correct: "さん", choices: ["いち", "に", "さん", "し"], jlpt: "N5", meaning: "three" },
  { kanji: "四", correct: "し", choices: ["ご", "ろく", "なな", "し"], jlpt: "N5", meaning: "four" },
  { kanji: "五", correct: "ご", choices: ["ご", "ろく", "なな", "はち"], jlpt: "N5", meaning: "five" },
  { kanji: "六", correct: "ろく", choices: ["ご", "ろく", "なな", "はち"], jlpt: "N5", meaning: "six" },
  { kanji: "七", correct: "なな", choices: ["ご", "ろく", "なな", "はち"], jlpt: "N5", meaning: "seven" },
  { kanji: "八", correct: "はち", choices: ["ろく", "なな", "はち", "きゅう"], jlpt: "N5", meaning: "eight" },
  { kanji: "九", correct: "きゅう", choices: ["はち", "きゅう", "じゅう", "ひゃく"], jlpt: "N5", meaning: "nine" },
  { kanji: "十", correct: "じゅう", choices: ["きゅう", "じゅう", "ひゃく", "せん"], jlpt: "N5", meaning: "ten" },
  { kanji: "百", correct: "ひゃく", choices: ["じゅう", "ひゃく", "せん", "まん"], jlpt: "N5", meaning: "hundred" },
  { kanji: "千", correct: "せん", choices: ["ひゃく", "せん", "まん", "おく"], jlpt: "N5", meaning: "thousand" },
  { kanji: "万", correct: "まん", choices: ["せん", "まん", "おく", "ちょう"], jlpt: "N5", meaning: "ten thousand" },
  { kanji: "本", correct: "ほん", choices: ["ほん", "ざっし", "しんぶん", "てがみ"], jlpt: "N5", meaning: "book/origin" },
];

// N4 — Premium
export const N4_QUESTIONS: QuizQuestion[] = [
  { kanji: "兄", correct: "あに", choices: ["あに", "おとうと", "いもうと", "あね"], jlpt: "N4", meaning: "older brother" },
  { kanji: "姉", correct: "あね", choices: ["あに", "おとうと", "いもうと", "あね"], jlpt: "N4", meaning: "older sister" },
  { kanji: "弟", correct: "おとうと", choices: ["あに", "おとうと", "いもうと", "あね"], jlpt: "N4", meaning: "younger brother" },
  { kanji: "妹", correct: "いもうと", choices: ["あに", "おとうと", "いもうと", "あね"], jlpt: "N4", meaning: "younger sister" },
  { kanji: "春", correct: "はる", choices: ["はる", "なつ", "あき", "ふゆ"], jlpt: "N4", meaning: "spring" },
  { kanji: "夏", correct: "なつ", choices: ["はる", "なつ", "あき", "ふゆ"], jlpt: "N4", meaning: "summer" },
  { kanji: "秋", correct: "あき", choices: ["はる", "なつ", "あき", "ふゆ"], jlpt: "N4", meaning: "autumn" },
  { kanji: "冬", correct: "ふゆ", choices: ["はる", "なつ", "あき", "ふゆ"], jlpt: "N4", meaning: "winter" },
  { kanji: "朝", correct: "あさ", choices: ["あさ", "ひる", "ゆうがた", "よる"], jlpt: "N4", meaning: "morning" },
  { kanji: "昼", correct: "ひる", choices: ["あさ", "ひる", "ゆうがた", "よる"], jlpt: "N4", meaning: "noon/daytime" },
  { kanji: "夜", correct: "よる", choices: ["あさ", "ひる", "ゆうがた", "よる"], jlpt: "N4", meaning: "night" },
  { kanji: "東", correct: "ひがし", choices: ["ひがし", "にし", "みなみ", "きた"], jlpt: "N4", meaning: "east" },
  { kanji: "西", correct: "にし", choices: ["ひがし", "にし", "みなみ", "きた"], jlpt: "N4", meaning: "west" },
  { kanji: "南", correct: "みなみ", choices: ["ひがし", "にし", "みなみ", "きた"], jlpt: "N4", meaning: "south" },
  { kanji: "北", correct: "きた", choices: ["ひがし", "にし", "みなみ", "きた"], jlpt: "N4", meaning: "north" },
  { kanji: "空", correct: "そら", choices: ["そら", "うみ", "やま", "かわ"], jlpt: "N4", meaning: "sky" },
  { kanji: "海", correct: "うみ", choices: ["そら", "うみ", "やま", "かわ"], jlpt: "N4", meaning: "sea/ocean" },
  { kanji: "花", correct: "はな", choices: ["はな", "き", "くさ", "は"], jlpt: "N4", meaning: "flower" },
  { kanji: "草", correct: "くさ", choices: ["はな", "き", "くさ", "は"], jlpt: "N4", meaning: "grass/plant" },
  { kanji: "鳥", correct: "とり", choices: ["とり", "さかな", "むし", "いぬ"], jlpt: "N4", meaning: "bird" },
];

// N3 — Premium
export const N3_QUESTIONS: QuizQuestion[] = [
  { kanji: "薔薇", correct: "ばら", choices: ["ばら", "はなび", "さくら", "きく"], jlpt: "N3", meaning: "rose" },
  { kanji: "山葵", correct: "わさび", choices: ["わさび", "しょうが", "にんにく", "とうがらし"], jlpt: "N3", meaning: "wasabi" },
  { kanji: "海豚", correct: "いるか", choices: ["いるか", "くじら", "さめ", "えい"], jlpt: "N3", meaning: "dolphin" },
  { kanji: "向日葵", correct: "ひまわり", choices: ["ひまわり", "たんぽぽ", "あじさい", "すみれ"], jlpt: "N3", meaning: "sunflower" },
  { kanji: "蒲公英", correct: "たんぽぽ", choices: ["たんぽぽ", "ひまわり", "あじさい", "れんげ"], jlpt: "N3", meaning: "dandelion" },
  { kanji: "紫陽花", correct: "あじさい", choices: ["あじさい", "ひまわり", "たんぽぽ", "すみれ"], jlpt: "N3", meaning: "hydrangea" },
  { kanji: "河豚", correct: "ふぐ", choices: ["ふぐ", "かつお", "まぐろ", "いわし"], jlpt: "N3", meaning: "pufferfish" },
  { kanji: "蛍", correct: "ほたる", choices: ["ほたる", "とんぼ", "ちょうちょ", "かぶとむし"], jlpt: "N3", meaning: "firefly" },
  { kanji: "螺旋", correct: "らせん", choices: ["らせん", "えんけい", "さんかく", "しかく"], jlpt: "N3", meaning: "spiral" },
  { kanji: "牡蠣", correct: "かき", choices: ["かき", "はまぐり", "あさり", "しじみ"], jlpt: "N3", meaning: "oyster" },
  { kanji: "紅葉", correct: "もみじ", choices: ["もみじ", "さくら", "うめ", "かえで"], jlpt: "N3", meaning: "autumn leaves" },
  { kanji: "梅雨", correct: "つゆ", choices: ["つゆ", "ゆき", "あられ", "みぞれ"], jlpt: "N3", meaning: "rainy season" },
  { kanji: "師走", correct: "しわす", choices: ["しわす", "むつき", "きさらぎ", "やよい"], jlpt: "N3", meaning: "December" },
  { kanji: "弥生", correct: "やよい", choices: ["やよい", "むつき", "きさらぎ", "うづき"], jlpt: "N3", meaning: "March" },
  { kanji: "木綿", correct: "もめん", choices: ["もめん", "きぬ", "あさ", "てん"], jlpt: "N3", meaning: "cotton" },
];

// N2/N1 — Premium
export const N2N1_QUESTIONS: QuizQuestion[] = [
  { kanji: "茨城", correct: "いばらき", choices: ["いばらき", "いばらぎ", "おおさか", "さいたま"], jlpt: "N2", meaning: "Ibaraki Prefecture" },
  { kanji: "栃木", correct: "とちぎ", choices: ["とちぎ", "とちき", "こうき", "こちぎ"], jlpt: "N2", meaning: "Tochigi Prefecture" },
  { kanji: "埼玉", correct: "さいたま", choices: ["さいたま", "さきたま", "さいだま", "さいやま"], jlpt: "N2", meaning: "Saitama Prefecture" },
  { kanji: "岐阜", correct: "ぎふ", choices: ["ぎふ", "きふ", "きぶ", "ぎぶ"], jlpt: "N2", meaning: "Gifu Prefecture" },
  { kanji: "滋賀", correct: "しが", choices: ["しが", "じが", "しか", "じか"], jlpt: "N2", meaning: "Shiga Prefecture" },
  { kanji: "愛媛", correct: "えひめ", choices: ["えひめ", "あいひめ", "えいめ", "あいめ"], jlpt: "N2", meaning: "Ehime Prefecture" },
  { kanji: "鳥取", correct: "とっとり", choices: ["とっとり", "とりとり", "とうとり", "とりどり"], jlpt: "N2", meaning: "Tottori Prefecture" },
  { kanji: "鹿児島", correct: "かごしま", choices: ["かごしま", "しかごしま", "かじしま", "かごじま"], jlpt: "N2", meaning: "Kagoshima Prefecture" },
  { kanji: "神奈川", correct: "かながわ", choices: ["かながわ", "かみながわ", "しんながわ", "かみなかわ"], jlpt: "N2", meaning: "Kanagawa Prefecture" },
  { kanji: "大晦日", correct: "おおみそか", choices: ["おおみそか", "おおみそき", "だいみそか", "おおもそか"], jlpt: "N2", meaning: "New Year's Eve" },
  { kanji: "七夕", correct: "たなばた", choices: ["たなばた", "しちせき", "ながれぼし", "はなび"], jlpt: "N1", meaning: "Star Festival" },
  { kanji: "雪崩", correct: "なだれ", choices: ["なだれ", "ゆきくずれ", "せっぽう", "ゆきだれ"], jlpt: "N1", meaning: "avalanche" },
  { kanji: "吹雪", correct: "ふぶき", choices: ["ふぶき", "おおゆき", "ゆきあらし", "あらゆき"], jlpt: "N1", meaning: "blizzard" },
  { kanji: "時雨", correct: "しぐれ", choices: ["しぐれ", "こさめ", "おとしあめ", "あきあめ"], jlpt: "N1", meaning: "autumn drizzle" },
  { kanji: "五月雨", correct: "さみだれ", choices: ["さみだれ", "ごがつあめ", "つゆあめ", "さつきあめ"], jlpt: "N1", meaning: "early summer rain" },
];

export const ALL_QUIZ_QUESTIONS = [
  ...N5_QUESTIONS,
  ...N4_QUESTIONS,
  ...N3_QUESTIONS,
  ...N2N1_QUESTIONS,
];

/** Shuffle array (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Get quiz questions by JLPT level */
export function getQuizQuestions(level: "N5" | "N4" | "N3" | "N2N1" | "all", count = 10): QuizQuestion[] {
  let pool: QuizQuestion[];
  if (level === "N5") pool = N5_QUESTIONS;
  else if (level === "N4") pool = N4_QUESTIONS;
  else if (level === "N3") pool = N3_QUESTIONS;
  else if (level === "N2N1") pool = N2N1_QUESTIONS;
  else pool = ALL_QUIZ_QUESTIONS;
  return shuffle(pool).slice(0, count);
}
