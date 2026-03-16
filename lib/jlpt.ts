// JLPT kanji lists for mode filtering
// Used in game mode selection to highlight/filter JLPT-relevant characters

export type JlptLevel = "N5" | "N4" | "N3_N1" | "all";

export interface JlptMode {
  key: JlptLevel;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  color: string;
}

export const JLPT_MODES: JlptMode[] = [
  {
    key: "all",
    label: "通常モード",
    labelEn: "Normal Mode",
    description: "ランダム漢字でプレイ",
    descriptionEn: "Random kanji — all levels",
    emoji: "🎮",
    color: "from-purple-600 to-indigo-600",
  },
  {
    key: "N5",
    label: "JLPT N5",
    labelEn: "JLPT N5",
    description: "N5漢字のみ（入門）",
    descriptionEn: "Beginner — 100 basic kanji",
    emoji: "🌱",
    color: "from-green-600 to-emerald-600",
  },
  {
    key: "N4",
    label: "JLPT N4",
    labelEn: "JLPT N4",
    description: "N4漢字のみ（初級）",
    descriptionEn: "Elementary — everyday kanji",
    emoji: "📗",
    color: "from-teal-600 to-cyan-600",
  },
  {
    key: "N3_N1",
    label: "JLPT N1〜N3",
    labelEn: "JLPT N1–N3",
    description: "N1〜N3（上級者向け）",
    descriptionEn: "Advanced — mastery level",
    emoji: "🏆",
    color: "from-orange-600 to-red-600",
  },
];

// Full N5 kanji list (80 characters used in JLPT N5)
export const JLPT_N5 = [
  "日", "一", "国", "人", "年", "大", "十", "二", "本", "中",
  "長", "出", "三", "時", "行", "見", "月", "分", "後", "前",
  "生", "五", "間", "上", "東", "四", "今", "金", "九", "入",
  "学", "高", "円", "子", "外", "八", "六", "下", "来", "気",
  "小", "七", "山", "話", "女", "北", "午", "百", "書", "先",
  "名", "川", "千", "水", "半", "男", "西", "電", "語", "土",
  "空", "田", "白", "天", "花", "右", "左", "友", "母", "父",
  "社", "店", "新", "聞", "食", "車", "何", "南", "万", "毎",
  "明", "体", "目", "休", "週", "算", "耳", "口", "糸", "犬",
  "手", "足", "力", "木", "火", "王", "玉", "貝", "竹", "虫", "石",
];

// N4 kanji list (subset commonly tested)
export const JLPT_N4 = [
  "会", "同", "事", "自", "社", "発", "者", "地", "業", "方",
  "新", "場", "員", "立", "開", "手", "力", "問", "代", "明",
  "動", "京", "目", "通", "言", "理", "体", "田", "主", "題",
  "家", "度", "以", "海", "以", "強", "近", "週", "持", "重",
  "起", "考", "売", "使", "始", "注", "走", "終", "転", "送",
  "図", "族", "答", "帰", "親", "文", "切", "特", "急", "押",
  "引", "飲", "歌", "貸", "借", "置", "待", "急", "薬", "病",
];

// N1-N3 kanji list (advanced subset)
export const JLPT_N3_N1 = [
  "晶", "品", "森", "林", "明", "際", "環", "境", "観", "察",
  "経", "済", "政", "治", "国", "際", "文", "化", "歴", "史",
  "科", "学", "技", "術", "医", "療", "教", "育", "社", "会",
  "産", "業", "農", "業", "工", "業", "商", "業", "貿", "易",
  "法", "律", "憲", "条", "規", "則", "制", "度", "機", "関",
];

/**
 * Returns the JLPT label for a given kanji character.
 * Used to display JLPT badge in game UI.
 */
export function getJlptLabel(char: string): string | null {
  if (JLPT_N5.includes(char)) return "N5";
  if (JLPT_N4.includes(char)) return "N4";
  if (JLPT_N3_N1.includes(char)) return "N1-N3";
  return null;
}

/**
 * Given a mode key, returns the set of kanji chars that belong to that level.
 * Returns null for "all" mode (no filtering).
 */
export function getJlptKanjiSet(mode: JlptLevel): Set<string> | null {
  if (mode === "all") return null;
  if (mode === "N5") return new Set(JLPT_N5);
  if (mode === "N4") return new Set(JLPT_N4);
  if (mode === "N3_N1") return new Set(JLPT_N3_N1);
  return null;
}
