// AI Architect — Floor Planning Engine v2
// 자연어 파싱 + 룰 기반 동적 배치
// Phase 1: 단독주택 1층 직사각형 대지

import { FloorPlan, Room, Wall, Opening, RoomType, RoomSpec } from "../types/floorplan";

const EXTERIOR_WALL = 200; // mm
const INTERIOR_WALL = 120; // mm
const SETBACK = 1500;      // mm (이격거리)
const MAX_COVERAGE = 0.6;  // 건폐율 60%

interface PlanRequest {
  landWidth: number;    // meters
  landHeight: number;   // meters
  direction: string;
  requirements: string;
  rooms?: RoomSpec[];   // v2: 직접 입력된 방 배열
}

// 자연어에서 요구사항 파싱
interface ParsedRequirements {
  roomCount: number;
  bathroomCount: number;
  hasStudy: boolean;
  hasDressingRoom: boolean;
  hasBalcony: boolean;
  hasStorage: boolean;
  openKitchen: boolean;
  largeMainBedroom: boolean;
  largeLiving: boolean;
}

function parseRequirements(text: string): ParsedRequirements {
  const t = text.toLowerCase().replace(/\s+/g, ' ');
  
  // 방 수 파싱
  let roomCount = 2;
  const roomMatch = t.match(/방\s*(\d+)\s*개/) || t.match(/침실\s*(\d+)/) || t.match(/(\d+)\s*개.*방/);
  if (roomMatch) roomCount = parseInt(roomMatch[1]);
  
  // 욕실 수 파싱
  let bathroomCount = 1;
  const bathMatch = t.match(/욕실\s*(\d+)\s*개/) || t.match(/화장실\s*(\d+)/) || t.match(/(\d+)\s*개.*욕실/);
  if (bathMatch) bathroomCount = parseInt(bathMatch[1]);
  
  return {
    roomCount: Math.max(1, Math.min(roomCount, 6)),
    bathroomCount: Math.max(1, Math.min(bathroomCount, 3)),
    hasStudy: /서재|공부방|작업실/.test(t),
    hasDressingRoom: /드레스룸|드레스 룸|옷방/.test(t),
    hasBalcony: /발코니|베란다/.test(t),
    hasStorage: /수납|창고|팬트리/.test(t),
    openKitchen: /오픈형|오픈 키친|오픈키친|개방형/.test(t),
    largeMainBedroom: /안방.*크|안방.*넓|큰.*안방|안방.*넉넉|마스터/.test(t),
    largeLiving: /거실.*넓|거실.*크|넓은.*거실|넓게|큰.*거실/.test(t),
  };
}

// 동적으로 방 배치 생성
function layoutRooms(
  innerW: number, innerH: number, innerX: number, innerY: number,
  parsed: ParsedRequirements
): Room[] {
  const rooms: Room[] = [];
  const gap = INTERIOR_WALL;
  
  // === 영역 분할 전략 ===
  // 상단: 침실들
  // 중단: 거실 + 주방
  // 하단: 현관 + 화장실 + (서재/수납)
  
  const totalRooms = parsed.roomCount + (parsed.hasStudy ? 1 : 0);
  
  // 비율 결정
  const topRatio = totalRooms >= 3 ? 0.30 : 0.28;
  const midRatio = parsed.largeLiving ? 0.48 : 0.42;
  const botRatio = 1 - topRatio - midRatio;
  
  const topH = Math.floor((innerH - gap * 2) * topRatio);
  const midH = Math.floor((innerH - gap * 2) * midRatio);
  const botH = innerH - topH - midH - gap * 2;
  
  const topY = innerY;
  const midY = innerY + topH + gap;
  const botY = midY + midH + gap;
  
  // === 상단: 침실 배치 ===
  const bedroomsInTop = Math.min(parsed.roomCount, 3);
  const topCols = bedroomsInTop + (parsed.hasStudy && bedroomsInTop < 3 ? 1 : 0);
  
  for (let i = 0; i < topCols; i++) {
    const colW = Math.floor((innerW - gap * (topCols - 1)) / topCols);
    const x = innerX + i * (colW + gap);
    const w = i === topCols - 1 ? innerW - i * (colW + gap) : colW; // 마지막은 나머지
    
    if (i === 0 && parsed.largeMainBedroom) {
      // 안방 (넓게)
      const mainW = Math.floor(innerW * 0.45);
      rooms.push({
        id: `bedroom_${i+1}`, name: "안방", type: "bedroom",
        x: innerX, y: topY, width: mainW, height: topH,
      });
      // 나머지 침실들을 나머지 공간에
      const remainW = innerW - mainW - gap;
      const remainCols = topCols - 1;
      for (let j = 1; j < topCols; j++) {
        const rw = Math.floor((remainW - gap * (remainCols - 1)) / remainCols);
        const isStudy = parsed.hasStudy && j === topCols - 1;
        rooms.push({
          id: isStudy ? "study" : `bedroom_${j+1}`,
          name: isStudy ? "서재" : `침실 ${j}`,
          type: isStudy ? "study" : "bedroom",
          x: innerX + mainW + gap + (j - 1) * (rw + gap),
          y: topY,
          width: j === topCols - 1 ? innerW - (innerX + mainW + gap + (j-1) * (rw + gap)) + innerX : rw,
          height: topH,
        });
      }
      break; // 이미 모든 상단 방 처리 완료
    }
    
    const isStudy = parsed.hasStudy && i === topCols - 1 && i >= parsed.roomCount;
    rooms.push({
      id: isStudy ? "study" : `bedroom_${i+1}`,
      name: isStudy ? "서재" : (i === 0 ? "안방" : `침실 ${i}`),
      type: isStudy ? "study" : "bedroom",
      x, y: topY, width: w, height: topH,
    });
  }
  
  // 추가 침실 (4개 이상이면 하단에 배치)
  const extraBedrooms = parsed.roomCount - bedroomsInTop;
  
  // === 중단: 거실 + 주방 ===
  if (parsed.openKitchen) {
    // 오픈형: 거실+주방 하나의 큰 공간
    rooms.push({
      id: "living", name: "거실+주방", type: "living_room",
      x: innerX, y: midY, width: innerW, height: midH,
    });
  } else {
    // 분리형: 거실(좌) + 주방(우)
    const livingRatio = parsed.largeLiving ? 0.6 : 0.55;
    const livingW = Math.floor((innerW - gap) * livingRatio);
    const kitchenW = innerW - livingW - gap;
    
    rooms.push({
      id: "living", name: "거실", type: "living_room",
      x: innerX, y: midY, width: livingW, height: midH,
    });
    rooms.push({
      id: "kitchen", name: "주방/식당", type: "kitchen",
      x: innerX + livingW + gap, y: midY, width: kitchenW, height: midH,
    });
  }
  
  // === 하단: 현관 + 화장실 + 기타 ===
  const bottomSlots: { name: string; type: RoomType; id: string; widthRatio: number }[] = [];
  
  // 현관 (필수)
  bottomSlots.push({ name: "현관", type: "entrance", id: "entrance", widthRatio: 0.2 });
  
  // 화장실
  for (let i = 0; i < parsed.bathroomCount; i++) {
    bottomSlots.push({ 
      name: i === 0 ? "화장실" : `화장실 ${i+1}`, 
      type: "bathroom", id: `bathroom_${i+1}`, widthRatio: 0.18 
    });
  }
  
  // 추가 침실 (있으면)
  for (let i = 0; i < extraBedrooms; i++) {
    const idx = bedroomsInTop + i + 1;
    bottomSlots.push({ name: `침실 ${idx}`, type: "bedroom", id: `bedroom_${idx}`, widthRatio: 0.25 });
  }
  
  // 수납
  if (parsed.hasStorage) {
    bottomSlots.push({ name: "수납", type: "storage", id: "storage", widthRatio: 0.15 });
  }
  
  // 드레스룸
  if (parsed.hasDressingRoom) {
    bottomSlots.push({ name: "드레스룸", type: "dressing_room", id: "dressing", widthRatio: 0.2 });
  }
  
  // 발코니
  if (parsed.hasBalcony) {
    bottomSlots.push({ name: "발코니", type: "balcony", id: "balcony", widthRatio: 0.2 });
  }
  
  // 남은 공간은 복도로
  const totalRatio = bottomSlots.reduce((s, r) => s + r.widthRatio, 0);
  if (totalRatio < 0.9) {
    bottomSlots.push({ name: "복도", type: "hallway", id: "hallway", widthRatio: 1 - totalRatio });
  }
  
  // 비율 정규화
  const sumRatio = bottomSlots.reduce((s, r) => s + r.widthRatio, 0);
  let curX = innerX;
  for (let i = 0; i < bottomSlots.length; i++) {
    const slot = bottomSlots[i];
    const w = i === bottomSlots.length - 1 
      ? innerW - (curX - innerX) 
      : Math.floor((innerW - gap * (bottomSlots.length - 1)) * (slot.widthRatio / sumRatio));
    
    rooms.push({
      id: slot.id, name: slot.name, type: slot.type,
      x: curX, y: botY, width: w, height: botH,
    });
    curX += w + gap;
  }
  
  return rooms;
}

// 내벽 생성 (인접한 방들 사이)
function generateInteriorWalls(rooms: Room[]): Wall[] {
  const walls: Wall[] = [];
  // 단순화: 각 방의 4변을 내벽으로 추가 (겹치는 것은 렌더러에서 처리)
  for (const room of rooms) {
    // 상단
    walls.push({ start: { x: room.x, y: room.y }, end: { x: room.x + room.width, y: room.y }, thickness: INTERIOR_WALL, isExterior: false });
    // 하단
    walls.push({ start: { x: room.x, y: room.y + room.height }, end: { x: room.x + room.width, y: room.y + room.height }, thickness: INTERIOR_WALL, isExterior: false });
    // 좌측
    walls.push({ start: { x: room.x, y: room.y }, end: { x: room.x, y: room.y + room.height }, thickness: INTERIOR_WALL, isExterior: false });
    // 우측
    walls.push({ start: { x: room.x + room.width, y: room.y }, end: { x: room.x + room.width, y: room.y + room.height }, thickness: INTERIOR_WALL, isExterior: false });
  }
  return walls;
}

// 문/창문 자동 배치
function generateOpenings(rooms: Room[], bldgW: number, bldgH: number): Opening[] {
  const openings: Opening[] = [];
  
  // 현관문 (하단 외벽)
  openings.push({ type: "door", wallIndex: 2, position: Math.floor(bldgW / 2 - 500), width: 1000 });
  
  // 각 방에 문 배치 (내벽 중 하나에)
  // 침실 → 상단 외벽에 창문
  for (const room of rooms) {
    if (room.type === "bedroom") {
      // 침실에 창문 (상단 외벽)
      const winPos = room.x + Math.floor(room.width * 0.3);
      openings.push({ type: "window", wallIndex: 0, position: Math.min(winPos, bldgW - 1500), width: 1200 });
    }
    if (room.type === "living_room") {
      // 거실에 큰 창문 (좌측 외벽 또는 하단 근처)
      openings.push({ type: "window", wallIndex: 3, position: Math.floor(bldgH * 0.3), width: 2000 });
    }
  }
  
  return openings;
}

// === v2: 방 이름 → RoomType 추론 ===
function inferRoomType(name: string): RoomType {
  const n = (name || "").toLowerCase();
  if (n.includes("거실") || n.includes("living")) return "living_room";
  if (n.includes("주방") || n.includes("부엌") || n.includes("kitchen") || n.includes("식당")) return "kitchen";
  if (n.includes("욕실") || n.includes("화장실") || n.includes("bath") || n.includes("toilet")) return "bathroom";
  if (n.includes("현관") || n.includes("entrance")) return "entrance";
  if (n.includes("복도") || n.includes("홀") || n.includes("hall")) return "hallway";
  if (n.includes("수납") || n.includes("창고") || n.includes("팬트리") || n.includes("storage")) return "storage";
  if (n.includes("발코니") || n.includes("베란다") || n.includes("balcony")) return "balcony";
  if (n.includes("서재") || n.includes("공부") || n.includes("작업") || n.includes("study")) return "study";
  if (n.includes("드레스") || n.includes("옷방")) return "dressing_room";
  if (n.includes("다용도") || n.includes("세탁") || n.includes("utility")) return "utility";
  // 안방, 방, 침실 등은 bedroom
  return "bedroom";
}

// === v2: rooms 배열 직접 배치 (행 기반 그리드) ===
function layoutFromRoomSpecs(
  innerW: number, innerH: number, innerX: number, innerY: number,
  roomSpecs: RoomSpec[]
): Room[] {
  const rooms: Room[] = [];
  const gap = INTERIOR_WALL;

  let curX = innerX;
  let curY = innerY;
  let rowMaxH = 0;

  for (let i = 0; i < roomSpecs.length; i++) {
    const spec = roomSpecs[i];
    let rw = (spec.width || 3) * 1000; // m → mm
    let rh = (spec.height || 3) * 1000;

    // 줄바꿈: 현재 행에 안 들어가면 다음 행
    if (curX + rw > innerX + innerW && curX !== innerX) {
      curX = innerX;
      curY += rowMaxH + gap;
      rowMaxH = 0;
    }

    // 건물 영역 초과 방지 (클램핑)
    const finalW = Math.min(rw, innerW);
    const remainH = innerH - (curY - innerY);
    const finalH = Math.min(rh, Math.max(remainH, 1000));

    rooms.push({
      id: `room-${i}`,
      name: spec.name || `방 ${i + 1}`,
      type: inferRoomType(spec.name),
      x: curX,
      y: curY,
      width: finalW,
      height: finalH,
    });

    curX += finalW + gap;
    rowMaxH = Math.max(rowMaxH, finalH);
  }

  return rooms;
}

export function generateFloorPlan(req: PlanRequest): FloorPlan {
  const landW = req.landWidth * 1000;   // mm
  const landH = req.landHeight * 1000;  // mm

  // 건축 가능 영역 (세트백 적용)
  const buildableW = landW - SETBACK * 2;
  const buildableH = landH - SETBACK * 2;

  // 건폐율 적용
  const maxBuildingArea = (landW * landH) * MAX_COVERAGE;
  let bldgW = Math.min(buildableW, Math.sqrt(maxBuildingArea * (buildableW / buildableH)));
  let bldgH = Math.min(buildableH, maxBuildingArea / bldgW);

  // 정수화 (100mm 단위)
  bldgW = Math.floor(bldgW / 100) * 100;
  bldgH = Math.floor(bldgH / 100) * 100;

  const bldgX = (landW - bldgW) / 2;
  const bldgY = (landH - bldgH) / 2;

  // 내부 사용 가능 영역 (외벽 제외)
  const innerW = bldgW - EXTERIOR_WALL * 2;
  const innerH = bldgH - EXTERIOR_WALL * 2;
  const innerX = EXTERIOR_WALL;
  const innerY = EXTERIOR_WALL;

  // v2: rooms 배열이 있으면 직접 배치, 없으면 기존 자연어 파싱
  let rooms: Room[];
  if (req.rooms && req.rooms.length > 0) {
    rooms = layoutFromRoomSpecs(innerW, innerH, innerX, innerY, req.rooms);
  } else {
    const parsed = parseRequirements(req.requirements);
    rooms = layoutRooms(innerW, innerH, innerX, innerY, parsed);
  }

  // 외벽
  const walls: Wall[] = [
    { start: { x: 0, y: 0 }, end: { x: bldgW, y: 0 }, thickness: EXTERIOR_WALL, isExterior: true },
    { start: { x: bldgW, y: 0 }, end: { x: bldgW, y: bldgH }, thickness: EXTERIOR_WALL, isExterior: true },
    { start: { x: bldgW, y: bldgH }, end: { x: 0, y: bldgH }, thickness: EXTERIOR_WALL, isExterior: true },
    { start: { x: 0, y: bldgH }, end: { x: 0, y: 0 }, thickness: EXTERIOR_WALL, isExterior: true },
  ];

  // 내벽
  const interiorWalls = generateInteriorWalls(rooms);
  walls.push(...interiorWalls);

  // 문/창문
  const openings = generateOpenings(rooms, bldgW, bldgH);

  const buildingAreaSqm = (bldgW / 1000) * (bldgH / 1000);
  const landAreaSqm = (landW / 1000) * (landH / 1000);
  const coverageRatio = (buildingAreaSqm / landAreaSqm) * 100;

  return {
    metadata: {
      projectName: "AI Architect — 단독주택 평면도",
      landWidth: landW,
      landHeight: landH,
      direction: req.direction || "south",
      buildingArea: Math.round(buildingAreaSqm * 10) / 10,
      coverageRatio: Math.round(coverageRatio * 10) / 10,
      scale: "1:100",
    },
    boundary: { x: 0, y: 0, width: landW, height: landH },
    building: { x: bldgX, y: bldgY, width: bldgW, height: bldgH },
    rooms,
    walls,
    openings,
  };
}
