// AI Architect — SVG Rendering Engine v4
// 모던 미니멀 스타일 (형님 참고 이미지 기반)
// 벽체: 차콜 그레이 사각형 / 바닥: 나무결+타일 / 치수선: 검정 tick mark / 문: 1/4 arc

import { FloorPlan, Room, Wall, Opening } from "../types/floorplan";

const SCALE = 0.1; // mm → SVG pixels (1:10)
const PADDING = 80;
const FONT = "'Noto Sans KR', 'Malgun Gothic', Arial, sans-serif";

// 색상 팔레트 (참고 이미지 기반)
const COLORS = {
  exteriorWall: "#4A4A4A",
  interiorWall: "#6A6A6A",
  woodFloor: "#C4A574",
  woodGrain: "#B8956A",
  tileFloor: "#E8E8E8",
  tileGrid: "#D0D0D0",
  balcony: "#F0F0F0",
  entrance: "#D8C8B8",
  dimLine: "#2A2A2A",
  dimText: "#2A2A2A",
  labelText: "#2A2A2A",
  areaText: "#555555",
  doorArc: "#3A3A3A",
  windowLine: "#4A4A4A",
  background: "#F8F8F8",
  siteBoundary: "#AAAAAA",
};

function mm(v: number): number { return v * SCALE; }

function generateDefs(): string {
  return `
  <defs>
    <!-- 나무결 패턴 (거실/침실) -->
    <pattern id="wood" width="40" height="8" patternUnits="userSpaceOnUse">
      <rect width="40" height="8" fill="${COLORS.woodFloor}"/>
      <line x1="0" y1="2" x2="40" y2="2" stroke="${COLORS.woodGrain}" stroke-width="0.4" opacity="0.4"/>
      <line x1="0" y1="5" x2="40" y2="5" stroke="${COLORS.woodGrain}" stroke-width="0.25" opacity="0.3"/>
      <line x1="0" y1="7.5" x2="40" y2="7.5" stroke="${COLORS.woodGrain}" stroke-width="0.15" opacity="0.2"/>
    </pattern>

    <!-- 타일 패턴 (욕실) -->
    <pattern id="tile" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="${COLORS.tileFloor}"/>
      <line x1="0" y1="0" x2="12" y2="0" stroke="${COLORS.tileGrid}" stroke-width="0.5"/>
      <line x1="0" y1="0" x2="0" y2="12" stroke="${COLORS.tileGrid}" stroke-width="0.5"/>
    </pattern>

    <!-- 현관 패턴 -->
    <pattern id="entrance" width="15" height="15" patternUnits="userSpaceOnUse">
      <rect width="15" height="15" fill="${COLORS.entrance}"/>
      <rect x="0.3" y="0.3" width="7" height="7" fill="#DDD0C0" rx="0.2"/>
      <rect x="7.7" y="0.3" width="7" height="7" fill="#D5C5B0" rx="0.2"/>
      <rect x="0.3" y="7.7" width="7" height="7" fill="#D5C5B0" rx="0.2"/>
      <rect x="7.7" y="7.7" width="7" height="7" fill="#DDD0C0" rx="0.2"/>
    </pattern>

    <!-- tick marks rendered inline -->
  </defs>`;
}

type FloorPattern = "wood" | "tile" | "entrance" | "balcony" | "plain";

const ROOM_PATTERN: Record<string, FloorPattern> = {
  living_room: "wood",
  bedroom: "wood",
  kitchen: "wood",
  bathroom: "tile",
  entrance: "entrance",
  hallway: "wood",
  storage: "plain",
  study: "wood",
  utility: "tile",
  dressing_room: "wood",
  balcony: "balcony",
};

function getFloorFill(roomType: string): string {
  const pat = ROOM_PATTERN[roomType] || "plain";
  switch (pat) {
    case "wood": return `fill="url(#wood)"`;
    case "tile": return `fill="url(#tile)"`;
    case "entrance": return `fill="url(#entrance)"`;
    case "balcony": return `fill="${COLORS.balcony}"`;
    default: return `fill="#E8E0D8"`;
  }
}

function renderRoom(room: Room, ox: number, oy: number): string {
  const x = mm(room.x) + ox;
  const y = mm(room.y) + oy;
  const w = mm(room.width);
  const h = mm(room.height);
  const areaSqm = Math.round((room.width / 1000) * (room.height / 1000));

  let s = "";
  // 바닥재
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${getFloorFill(room.type)}/>`;
  // 라벨 (심플: 공간명 + 면적)
  s += `<text x="${x + w/2}" y="${y + h/2 - 4}" text-anchor="middle" font-family="${FONT}" font-size="13" fill="${COLORS.labelText}" font-weight="500">${room.name}</text>`;
  s += `<text x="${x + w/2}" y="${y + h/2 + 12}" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${COLORS.areaText}">${areaSqm}m²</text>`;
  return s;
}

function renderWalls(plan: FloorPlan, ox: number, oy: number): string {
  let s = "";
  const bx = mm(plan.building.x) + ox - mm(plan.building.x);
  const by = mm(plan.building.y) + oy - mm(plan.building.y);

  // 외벽을 두꺼운 사각형으로 렌더링
  for (const wall of plan.walls) {
    const x1 = mm(wall.start.x) + ox;
    const y1 = mm(wall.start.y) + oy;
    const x2 = mm(wall.end.x) + ox;
    const y2 = mm(wall.end.y) + oy;
    const t = mm(wall.thickness);
    const color = wall.isExterior ? COLORS.exteriorWall : COLORS.interiorWall;
    const actualT = wall.isExterior ? Math.max(t, 4) : Math.max(t * 0.5, 2);

    const isH = Math.abs(y1 - y2) < 1;
    if (isH) {
      s += `<rect x="${Math.min(x1,x2)}" y="${Math.min(y1,y2) - actualT/2}" width="${Math.abs(x2-x1) + actualT}" height="${actualT}" fill="${color}"/>`;
    } else {
      s += `<rect x="${Math.min(x1,x2) - actualT/2}" y="${Math.min(y1,y2)}" width="${actualT}" height="${Math.abs(y2-y1) + actualT}" fill="${color}"/>`;
    }
  }
  return s;
}

function renderOpenings(plan: FloorPlan, ox: number, oy: number): string {
  let s = "";
  for (const opening of plan.openings) {
    const wall = plan.walls[opening.wallIndex];
    if (!wall) continue;

    const isH = Math.abs(wall.start.y - wall.end.y) < 1;
    const wMinX = mm(Math.min(wall.start.x, wall.end.x)) + ox;
    const wMinY = mm(Math.min(wall.start.y, wall.end.y)) + oy;
    const pos = mm(opening.position);
    const w = mm(opening.width);
    const wallT = wall.isExterior ? Math.max(mm(wall.thickness), 4) : Math.max(mm(wall.thickness) * 0.5, 2);

    if (opening.type === "door") {
      // 문: 벽 지우기 + 1/4 원호
      if (isH) {
        const dx = wMinX + pos;
        const dy = wMinY;
        s += `<rect x="${dx}" y="${dy - wallT/2 - 1}" width="${w}" height="${wallT + 2}" fill="${COLORS.background}"/>`;
        // 문짝 선
        s += `<line x1="${dx}" y1="${dy}" x2="${dx}" y2="${dy - w * 0.7}" stroke="${COLORS.doorArc}" stroke-width="1.5"/>`;
        // 호
        s += `<path d="M ${dx} ${dy - w * 0.7} A ${w * 0.7} ${w * 0.7} 0 0 1 ${dx + w * 0.7} ${dy}" fill="none" stroke="${COLORS.doorArc}" stroke-width="0.8" stroke-dasharray="2,1"/>`;
      } else {
        const dx = wMinX;
        const dy = wMinY + pos;
        s += `<rect x="${dx - wallT/2 - 1}" y="${dy}" width="${wallT + 2}" height="${w}" fill="${COLORS.background}"/>`;
        s += `<line x1="${dx}" y1="${dy}" x2="${dx + w * 0.7}" y2="${dy}" stroke="${COLORS.doorArc}" stroke-width="1.5"/>`;
        s += `<path d="M ${dx + w * 0.7} ${dy} A ${w * 0.7} ${w * 0.7} 0 0 1 ${dx} ${dy + w * 0.7}" fill="none" stroke="${COLORS.doorArc}" stroke-width="0.8" stroke-dasharray="2,1"/>`;
      }
    } else {
      // 창문: 이중선
      if (isH) {
        const wx = wMinX + pos;
        const wy = wMinY;
        s += `<rect x="${wx}" y="${wy - wallT/2 - 1}" width="${w}" height="${wallT + 2}" fill="${COLORS.background}"/>`;
        s += `<line x1="${wx}" y1="${wy - 2}" x2="${wx + w}" y2="${wy - 2}" stroke="${COLORS.windowLine}" stroke-width="2"/>`;
        s += `<line x1="${wx}" y1="${wy + 2}" x2="${wx + w}" y2="${wy + 2}" stroke="${COLORS.windowLine}" stroke-width="2"/>`;
        // 중앙 분할
        s += `<line x1="${wx + w/2}" y1="${wy - 3}" x2="${wx + w/2}" y2="${wy + 3}" stroke="${COLORS.windowLine}" stroke-width="0.5"/>`;
      } else {
        const wx = wMinX;
        const wy = wMinY + pos;
        s += `<rect x="${wx - wallT/2 - 1}" y="${wy}" width="${wallT + 2}" height="${w}" fill="${COLORS.background}"/>`;
        s += `<line x1="${wx - 2}" y1="${wy}" x2="${wx - 2}" y2="${wy + w}" stroke="${COLORS.windowLine}" stroke-width="2"/>`;
        s += `<line x1="${wx + 2}" y1="${wy}" x2="${wx + 2}" y2="${wy + w}" stroke="${COLORS.windowLine}" stroke-width="2"/>`;
        s += `<line x1="${wx - 3}" y1="${wy + w/2}" x2="${wx + 3}" y2="${wy + w/2}" stroke="${COLORS.windowLine}" stroke-width="0.5"/>`;
      }
    }
  }
  return s;
}

// 치수선 (검정 + tick mark 스타일)
function dimH(x1: number, y: number, x2: number, label: string, offset: number): string {
  const dy = y + offset;
  let s = "";
  // 연장선
  s += `<line x1="${x1}" y1="${y}" x2="${x1}" y2="${dy + 4}" stroke="${COLORS.dimLine}" stroke-width="0.3"/>`;
  s += `<line x1="${x2}" y1="${y}" x2="${x2}" y2="${dy + 4}" stroke="${COLORS.dimLine}" stroke-width="0.3"/>`;
  // 치수선
  s += `<line x1="${x1}" y1="${dy}" x2="${x2}" y2="${dy}" stroke="${COLORS.dimLine}" stroke-width="0.6"/>`;
  // tick marks
  s += `<line x1="${x1}" y1="${dy - 4}" x2="${x1}" y2="${dy + 4}" stroke="${COLORS.dimLine}" stroke-width="0.8"/>`;
  s += `<line x1="${x2}" y1="${dy - 4}" x2="${x2}" y2="${dy + 4}" stroke="${COLORS.dimLine}" stroke-width="0.8"/>`;
  // 텍스트
  s += `<text x="${(x1+x2)/2}" y="${dy - 3}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="${COLORS.dimText}">${label}</text>`;
  return s;
}

function dimV(x: number, y1: number, y2: number, label: string, offset: number): string {
  const dx = x + offset;
  let s = "";
  s += `<line x1="${x}" y1="${y1}" x2="${dx + 4}" y2="${y1}" stroke="${COLORS.dimLine}" stroke-width="0.3"/>`;
  s += `<line x1="${x}" y1="${y2}" x2="${dx + 4}" y2="${y2}" stroke="${COLORS.dimLine}" stroke-width="0.3"/>`;
  s += `<line x1="${dx}" y1="${y1}" x2="${dx}" y2="${y2}" stroke="${COLORS.dimLine}" stroke-width="0.6"/>`;
  // tick marks
  s += `<line x1="${dx - 4}" y1="${y1}" x2="${dx + 4}" y2="${y1}" stroke="${COLORS.dimLine}" stroke-width="0.8"/>`;
  s += `<line x1="${dx - 4}" y1="${y2}" x2="${dx + 4}" y2="${y2}" stroke="${COLORS.dimLine}" stroke-width="0.8"/>`;
  const mid = (y1 + y2) / 2;
  s += `<text x="${dx + 3}" y="${mid + 3}" text-anchor="start" font-family="Arial, sans-serif" font-size="9" fill="${COLORS.dimText}" transform="rotate(-90, ${dx + 3}, ${mid + 3})">${label}</text>`;
  return s;
}

export function renderFloorPlanToSVG(plan: FloorPlan): string {
  const landW = mm(plan.boundary.width);
  const landH = mm(plan.boundary.height);
  const bldgW = mm(plan.building.width);
  const bldgH = mm(plan.building.height);

  const svgW = landW + PADDING * 2 + 80;
  const svgH = landH + PADDING * 2 + 100;

  const landX = PADDING;
  const landY = PADDING + 50;
  const bldgX = mm(plan.building.x) + landX;
  const bldgY = mm(plan.building.y) + landY;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">`;
  svg += generateDefs();

  // 배경
  svg += `<rect width="${svgW}" height="${svgH}" fill="${COLORS.background}"/>`;

  // 타이틀
  svg += `<text x="${svgW/2}" y="28" text-anchor="middle" font-family="${FONT}" font-size="15" fill="${COLORS.labelText}" font-weight="700">${plan.metadata.projectName}</text>`;
  svg += `<text x="${svgW/2}" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="${COLORS.areaText}">${(plan.metadata.landWidth/1000).toFixed(0)}m x ${(plan.metadata.landHeight/1000).toFixed(0)}m | ${plan.metadata.buildingArea}m² | ${plan.metadata.coverageRatio}% | ${plan.metadata.scale}</text>`;

  // 대지 경계
  svg += `<rect x="${landX}" y="${landY}" width="${landW}" height="${landH}" fill="none" stroke="${COLORS.siteBoundary}" stroke-width="1" stroke-dasharray="6,3"/>`;

  // 방 (바닥재)
  for (const room of plan.rooms) {
    svg += renderRoom(room, bldgX, bldgY);
  }

  // 벽체
  svg += renderWalls(plan, bldgX, bldgY);

  // 문/창문
  svg += renderOpenings(plan, bldgX, bldgY);

  // 치수선 — 건물 외곽 (mm 단위)
  svg += dimH(bldgX, bldgY + bldgH, bldgX + bldgW, `${plan.building.width}`, 25);
  svg += dimV(bldgX + bldgW, bldgY, bldgY + bldgH, `${plan.building.height}`, 25);

  // 치수선 — 대지 (mm 단위)
  svg += dimH(landX, landY + landH, landX + landW, `${plan.boundary.width}`, 50);
  svg += dimV(landX + landW, landY, landY + landH, `${plan.boundary.height}`, 50);

  // 각 방 내부 치수 (가로)
  for (const room of plan.rooms) {
    const rx = mm(room.x) + bldgX;
    const ry = mm(room.y) + bldgY;
    const rw = mm(room.width);
    const rh = mm(room.height);
    // 방 하단에 가로 치수
    svg += dimH(rx, ry + rh, rx + rw, `${room.width}`, 6);
  }

  svg += `</svg>`;
  return svg;
}
