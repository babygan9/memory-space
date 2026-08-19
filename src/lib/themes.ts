export type ThemeType = "normal" | "birthday" | "christmas" | "halloween";

export interface ThemeConfig {
  name: string;
  displayName: string;
  startDate?: { month: number; day: number };
  endDate?: { month: number; day: number };
  bgGradient: string;
  accentColor: string;
}

export const themes: Record<ThemeType, ThemeConfig> = {
  normal: {
    name: "normal",
    displayName: "Valentine",
    startDate: { month: 2, day: 1 },
    endDate: { month: 2, day: 28 },
    bgGradient: "from-rose-200/50 via-pink-100/40 to-red-100/40",
    accentColor: "#E86088",
  },
  birthday: {
    name: "birthday",
    displayName: "Birthday",
    startDate: { month: 1, day: 1 },
    endDate: { month: 12, day: 31 },
    bgGradient: "from-pink-200/50 via-yellow-200/40 to-orange-100/40",
    accentColor: "#F0D060",
  },
  christmas: {
    name: "christmas",
    displayName: "Christmas",
    startDate: { month: 12, day: 1 },
    endDate: { month: 12, day: 31 },
    bgGradient: "from-red-100/50 via-green-100/40 to-red-50/30",
    accentColor: "#E86060",
  },
  halloween: {
    name: "halloween",
    displayName: "Halloween",  
    startDate: { month: 10, day: 25 },
    endDate: { month: 11, day: 5 },
    bgGradient: "from-orange-200/50 via-purple-100/40 to-orange-100/30",
    accentColor: "#E8A060",
  },
};

function isDateInRange(
  date: Date,
  start?: { month: number; day: number },
  end?: { month: number; day: number }
): boolean {
  if (!start || !end) return false;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const current = month * 100 + day;
  const startVal = start.month * 100 + start.day;
  const endVal = end.month * 100 + end.day;
  if (startVal <= endVal) {
    return current >= startVal && current <= endVal;
  } else {
    return current >= startVal || current <= endVal;
  }
}

export function getAutoTheme(): ThemeType {
  const now = new Date();
  if (isDateInRange(now, themes.christmas.startDate, themes.christmas.endDate)) {
    return "christmas";
  }
  if (isDateInRange(now, themes.halloween.startDate, themes.halloween.endDate)) {
    return "halloween";
  }
  return "normal";
}
