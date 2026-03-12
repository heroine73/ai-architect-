// AI Architect — FloorPlan Type Definitions
// 모든 좌표/치수는 mm 단위 (API 입력은 m)

export interface Point {
  x: number;
  y: number;
}

export type RoomType =
  | "living_room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "entrance"
  | "hallway"
  | "storage"
  | "balcony"
  | "utility"
  | "study"
  | "dressing_room";

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  x: number;       // mm
  y: number;       // mm
  width: number;   // mm
  height: number;  // mm
}

export interface Wall {
  start: Point;
  end: Point;
  thickness: number; // mm (외벽 200, 내벽 120)
  isExterior: boolean;
}

export type OpeningType = "door" | "window";

export interface Opening {
  type: OpeningType;
  wallIndex: number;
  position: number;  // 벽 시작점으로부터 거리 (mm)
  width: number;     // mm
}

export interface FloorPlan {
  metadata: {
    projectName: string;
    landWidth: number;   // mm
    landHeight: number;  // mm
    direction: string;
    buildingArea: number; // ㎡
    coverageRatio: number; // %
    scale: string;
  };
  boundary: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  building: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rooms: Room[];
  walls: Wall[];
  openings: Opening[];
}

export interface RoomSpec {
  name: string;
  width: number;   // meters (프론트엔드에서 입력한 값)
  height: number;  // meters
}

export interface GenerateRequest {
  landWidth: number;    // meters
  landHeight: number;   // meters
  direction?: string;   // "south" | "north" | "east" | "west"
  requirements?: string; // 자연어 요구사항
  floors?: number;      // Phase 1: 1층만
  roomCount?: number;
  rooms?: RoomSpec[];   // v2: 프론트엔드에서 직접 보내는 방 배열
}

export interface GenerateResponse {
  success: boolean;
  floorPlan?: FloorPlan;
  svg?: string;
  error?: string;
}
