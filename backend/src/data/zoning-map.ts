// 용도지역별 건폐율·용적률 매핑 테이블
// 국토의 계획 및 이용에 관한 법률 시행령 제84조·제85조 기준
// 건폐율(bcr)은 상한값, 용적률(far)은 범위(Min~Max)
// 실제 적용값은 해당 지자체 조례에서 범위 내 결정

export interface ZoningInfo {
  bcr: number;      // 건폐율 상한 (%)
  farMin: number;   // 용적률 하한 (%)
  farMax: number;   // 용적률 상한 (%)
}

export const ZONING_MAP: Record<string, ZoningInfo> = {
  // 주거지역
  '제1종전용주거지역': { bcr: 50, farMin: 50, farMax: 100 },
  '제2종전용주거지역': { bcr: 50, farMin: 100, farMax: 150 },
  '제1종일반주거지역': { bcr: 60, farMin: 100, farMax: 200 },
  '제2종일반주거지역': { bcr: 60, farMin: 150, farMax: 250 },
  '제3종일반주거지역': { bcr: 50, farMin: 200, farMax: 300 },
  '준주거지역':       { bcr: 70, farMin: 200, farMax: 500 },

  // 상업지역
  '중심상업지역': { bcr: 90, farMin: 400, farMax: 1500 },
  '일반상업지역': { bcr: 80, farMin: 300, farMax: 1300 },
  '근린상업지역': { bcr: 70, farMin: 200, farMax: 900 },
  '유통상업지역': { bcr: 80, farMin: 200, farMax: 1100 },

  // 공업지역
  '전용공업지역': { bcr: 70, farMin: 150, farMax: 300 },
  '일반공업지역': { bcr: 70, farMin: 200, farMax: 350 },
  '준공업지역':   { bcr: 70, farMin: 200, farMax: 400 },

  // 녹지지역
  '보전녹지지역': { bcr: 20, farMin: 50, farMax: 80 },
  '생산녹지지역': { bcr: 20, farMin: 50, farMax: 100 },
  '자연녹지지역': { bcr: 20, farMin: 50, farMax: 100 },

  // 관리지역
  '계획관리지역': { bcr: 40, farMin: 50, farMax: 100 },
  '생산관리지역': { bcr: 20, farMin: 50, farMax: 80 },
  '보전관리지역': { bcr: 20, farMin: 50, farMax: 80 },

  // 농림·자연환경
  '농림지역':         { bcr: 20, farMin: 50, farMax: 80 },
  '자연환경보전지역': { bcr: 20, farMin: 50, farMax: 80 },
};

/**
 * 용도지역명으로 건폐율/용적률 조회
 * @returns ZoningInfo 또는 null (매핑 없음)
 */
export function getZoningInfo(zoning: string): ZoningInfo | null {
  // 정확한 매칭 먼저
  if (ZONING_MAP[zoning]) return ZONING_MAP[zoning];

  // 부분 매칭 (축약된 이름 지원: "제1종일반주거" → "제1종일반주거지역")
  for (const [key, value] of Object.entries(ZONING_MAP)) {
    if (key.includes(zoning) || zoning.includes(key.replace('지역', ''))) {
      return value;
    }
  }

  return null;
}
