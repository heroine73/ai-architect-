// AI Architect — Generate API Route
// POST /api/generate

import { GenerateRequest, GenerateResponse, RoomSpec } from "../types/floorplan";
import { generateFloorPlan } from "../services/floor-planner";
import { renderFloorPlanToSVG } from "../services/svg-renderer";

export function handleGenerate(body: GenerateRequest): GenerateResponse {
  // 입력 검증
  if (!body.landWidth || !body.landHeight) {
    return { success: false, error: "대지 가로(landWidth)와 세로(landHeight)는 필수입니다." };
  }

  if (body.landWidth < 5 || body.landHeight < 5) {
    return { success: false, error: "대지 크기는 최소 5m × 5m 이상이어야 합니다." };
  }

  if (body.landWidth > 100 || body.landHeight > 100) {
    return { success: false, error: "Phase 1에서는 100m × 100m 이하만 지원합니다." };
  }

  try {
    // 평면도 생성
    const floorPlan = generateFloorPlan({
      landWidth: body.landWidth,
      landHeight: body.landHeight,
      direction: body.direction || "south",
      requirements: body.requirements || "",
      rooms: body.rooms,
    });

    // SVG 렌더링
    const svg = renderFloorPlanToSVG(floorPlan);

    return {
      success: true,
      floorPlan,
      svg,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `도면 생성 중 오류 발생: ${err.message}`,
    };
  }
}
