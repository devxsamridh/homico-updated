/**
 * Deterministic floor-plan geometry engine.
 *
 * The AI model is good at programme (which rooms, sizes, costs) but bad at
 * geometry — it produces overlapping / floating rectangles. So we always build
 * the actual rectangles here with a squarified-treemap slicing algorithm which
 * guarantees: every room is inside the footprint, no two rooms overlap, and the
 * rooms tile the floor exactly (no gaps).
 */

export type RoomType =
  | "living"
  | "kitchen"
  | "bedroom"
  | "bathroom"
  | "dining"
  | "balcony"
  | "parking"
  | "staircase"
  | "pooja"
  | "utility"
  | "office"
  | "store"
  | "garden"
  | "corridor"
  | "other";

export interface Opening {
  type: "door" | "window";
  wall: "top" | "bottom" | "left" | "right";
  offset: number;
  width: number;
}

export interface PlannedRoom {
  name: string;
  type: RoomType;
  x: number;
  y: number;
  w: number;
  h: number;
  notes?: string;
  openings?: Opening[];
}

export interface PlannedFloor {
  floor: string;
  widthFt: number;
  lengthFt: number;
  rooms: PlannedRoom[];
}

export interface RoomSpec {
  name: string;
  type: RoomType;
  weight: number; // relative area
  minW?: number;
  minH?: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ------------------------- squarified treemap ------------------------- */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function worstRatio(row: number[], length: number, scale: number) {
  const sum = row.reduce((a, b) => a + b, 0) * scale;
  const max = Math.max(...row) * scale;
  const min = Math.min(...row) * scale;
  if (sum === 0 || length === 0) return Infinity;
  return Math.max((length * length * max) / (sum * sum), (sum * sum) / (length * length * min));
}

function squarify(values: number[], rect: Rect): Rect[] {
  const out: Rect[] = [];
  let free = { ...rect };
  let remaining = values.slice();
  let indexOffset = 0;
  const result: Array<{ i: number; r: Rect }> = [];

  while (remaining.length > 0) {
    const freeArea = free.w * free.h;
    const total = remaining.reduce((a, b) => a + b, 0);
    const scale = total > 0 ? freeArea / total : 0;
    const shortSide = Math.min(free.w, free.h);

    const row: number[] = [];
    while (remaining.length > 0) {
      const candidate = [...row, remaining[0]!];
      if (row.length === 0 || worstRatio(candidate, shortSide, scale) <= worstRatio(row, shortSide, scale)) {
        row.push(remaining.shift()!);
      } else break;
    }

    const rowArea = row.reduce((a, b) => a + b, 0) * scale;
    if (free.w >= free.h) {
      const bandW = free.h > 0 ? rowArea / free.h : 0;
      let y = free.y;
      row.forEach((v) => {
        const h = rowArea > 0 ? (v * scale * free.h) / rowArea : 0;
        result.push({ i: indexOffset++, r: { x: free.x, y, w: bandW, h } });
        y += h;
      });
      free = { x: free.x + bandW, y: free.y, w: free.w - bandW, h: free.h };
    } else {
      const bandH = free.w > 0 ? rowArea / free.w : 0;
      let x = free.x;
      row.forEach((v) => {
        const w = rowArea > 0 ? (v * scale * free.w) / rowArea : 0;
        result.push({ i: indexOffset++, r: { x, y: free.y, w, h: bandH } });
        x += w;
      });
      free = { x: free.x, y: free.y + bandH, w: free.w, h: free.h - bandH };
    }
    if (free.w <= 0.01 || free.h <= 0.01) break;
  }

  result.sort((a, b) => a.i - b.i).forEach((e) => out.push(e.r));
  return out;
}

/* ------------------------- adjacency & openings ------------------------- */

function sharedSegment(a: PlannedRoom, b: PlannedRoom) {
  const EPS = 0.15;
  // b to the right of a
  if (Math.abs(a.x + a.w - b.x) < EPS) {
    const s = Math.max(a.y, b.y);
    const e = Math.min(a.y + a.h, b.y + b.h);
    if (e - s > 3) return { wall: "right" as const, start: s, end: e };
  }
  if (Math.abs(b.x + b.w - a.x) < EPS) {
    const s = Math.max(a.y, b.y);
    const e = Math.min(a.y + a.h, b.y + b.h);
    if (e - s > 3) return { wall: "left" as const, start: s, end: e };
  }
  if (Math.abs(a.y + a.h - b.y) < EPS) {
    const s = Math.max(a.x, b.x);
    const e = Math.min(a.x + a.w, b.x + b.w);
    if (e - s > 3) return { wall: "bottom" as const, start: s, end: e };
  }
  if (Math.abs(b.y + b.h - a.y) < EPS) {
    const s = Math.max(a.x, b.x);
    const e = Math.min(a.x + a.w, b.x + b.w);
    if (e - s > 3) return { wall: "top" as const, start: s, end: e };
  }
  return null;
}

const OPEN_TYPES: RoomType[] = ["living", "dining", "corridor", "balcony", "parking", "garden"];

function addOpenings(rooms: PlannedRoom[], W: number, L: number) {
  const EPS = 0.15;
  for (const room of rooms) {
    const ops: Opening[] = [];

    // --- door: prefer a neighbour that is a circulation/open space ---
    let best: { wall: Opening["wall"]; start: number; end: number; score: number } | null = null;
    for (const other of rooms) {
      if (other === room) continue;
      const seg = sharedSegment(room, other);
      if (!seg) continue;
      const score = (OPEN_TYPES.includes(other.type) ? 1000 : 0) + other.w * other.h;
      if (!best || score > best.score) best = { ...seg, score };
    }
    if (best && !OPEN_TYPES.includes(room.type)) {
      const wallStart = best.wall === "top" || best.wall === "bottom" ? room.x : room.y;
      const mid = (best.start + best.end) / 2 - wallStart;
      ops.push({ type: "door", wall: best.wall, offset: Math.max(0.8, mid - 1.5), width: 3 });
    } else if (!best) {
      // isolated (shouldn't happen) — door on the longest exterior wall
      ops.push({ type: "door", wall: "bottom", offset: Math.max(0.8, room.w / 2 - 1.5), width: 3 });
    }

    // --- windows on exterior walls ---
    const wantsWindow =
      room.type === "bedroom" ||
      room.type === "living" ||
      room.type === "dining" ||
      room.type === "kitchen" ||
      room.type === "office" ||
      room.type === "bathroom" ||
      room.type === "pooja";
    if (wantsWindow) {
      const exterior: Array<{ wall: Opening["wall"]; len: number }> = [];
      if (Math.abs(room.y) < EPS) exterior.push({ wall: "top", len: room.w });
      if (Math.abs(room.y + room.h - L) < EPS) exterior.push({ wall: "bottom", len: room.w });
      if (Math.abs(room.x) < EPS) exterior.push({ wall: "left", len: room.h });
      if (Math.abs(room.x + room.w - W) < EPS) exterior.push({ wall: "right", len: room.h });
      exterior.sort((a, b) => b.len - a.len);
      const winW = room.type === "bathroom" ? 2.5 : Math.min(5, Math.max(3, exterior[0] ? exterior[0].len * 0.45 : 3));
      exterior.slice(0, room.type === "bathroom" ? 1 : 2).forEach((ex) => {
        const w = Math.min(winW, ex.len - 2);
        if (w < 2) return;
        ops.push({ type: "window", wall: ex.wall, offset: (ex.len - w) / 2, width: r1(w) });
      });
    }

    room.openings = ops;
  }
}

/* ------------------------- programme per floor ------------------------- */

export interface ProgrammeInput {
  plotLength: number;
  plotWidth: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchen: number;
  diningRoom: number;
  balcony: number;
  parking: number;
  poojaRoom: number;
  homeOffice: number;
  storeRoom: number;
  utilityRoom: number;
}

function floorSpecs(input: ProgrammeInput, floorIndex: number): RoomSpec[] {
  const isGround = floorIndex === 0;
  const specs: RoomSpec[] = [];
  const multi = input.floors > 1;

  // bedrooms distribution
  const bedTotal = input.bedrooms;
  let bedsHere = bedTotal;
  if (multi) {
    const perUpper = Math.ceil(bedTotal / Math.max(1, input.floors - (bedTotal > 1 ? 1 : 0)));
    bedsHere = isGround ? Math.max(bedTotal > 2 ? 1 : 0, 0) : Math.min(perUpper, bedTotal);
    if (!isGround) {
      const groundBeds = bedTotal > 2 ? 1 : 0;
      const upperFloors = input.floors - 1;
      const remaining = bedTotal - groundBeds;
      const base = Math.floor(remaining / upperFloors);
      const extra = (floorIndex - 1) < remaining % upperFloors ? 1 : 0;
      bedsHere = base + extra;
    }
  }

  const bathsHere = Math.max(1, Math.round(input.bathrooms / input.floors));

  if (isGround) {
    if (input.parking > 0) specs.push({ name: "Parking", type: "parking", weight: 180, minW: 10, minH: 16 });
    if (input.livingRooms > 0) specs.push({ name: "Living Room", type: "living", weight: 230, minW: 12, minH: 12 });
    if (input.diningRoom > 0) specs.push({ name: "Dining Area", type: "dining", weight: 130, minW: 9, minH: 10 });
    if (input.kitchen > 0) specs.push({ name: "Kitchen", type: "kitchen", weight: 120, minW: 8, minH: 10 });
    if (input.poojaRoom > 0) specs.push({ name: "Pooja Room", type: "pooja", weight: 30, minW: 5, minH: 5 });
    if (input.utilityRoom > 0) specs.push({ name: "Utility", type: "utility", weight: 45, minW: 6, minH: 6 });
    if (input.storeRoom > 0) specs.push({ name: "Store", type: "store", weight: 40, minW: 5, minH: 6 });
    if (input.homeOffice > 0) specs.push({ name: "Home Office", type: "office", weight: 90, minW: 9, minH: 9 });
  } else {
    specs.push({ name: "Family Lounge", type: "living", weight: 150, minW: 11, minH: 11 });
    if (input.balcony > 0) specs.push({ name: "Balcony", type: "balcony", weight: 50, minW: 5, minH: 7 });
  }

  const groundBedCount = multi ? (bedTotal > 2 ? 1 : 0) : bedTotal;
  const masterFloor = groundBedCount > 0 ? 0 : 1;
  const bedNumberBase = floorIndex === 0 ? 0 : groundBedCount + (floorIndex - 1) * bedsHere;
  for (let i = 0; i < bedsHere; i++) {
    specs.push({
      name: i === 0 && floorIndex === masterFloor ? "Master Bedroom" : `Bedroom ${bedNumberBase + i + 1}`,

      type: "bedroom",
      weight: i === 0 ? 165 : 135,
      minW: 10,
      minH: 10,
    });
  }
  for (let i = 0; i < bathsHere; i++) {
    specs.push({ name: bathsHere > 1 ? `Bathroom ${i + 1}` : "Bathroom", type: "bathroom", weight: 42, minW: 5, minH: 7 });
  }
  if (isGround && input.balcony > 0 && input.floors === 1) {
    specs.push({ name: "Balcony", type: "balcony", weight: 50, minW: 5, minH: 7 });
  }
  if (multi) specs.push({ name: "Staircase", type: "staircase", weight: 58, minW: 6, minH: 9 });

  // circulation
  specs.push({ name: "Passage", type: "corridor", weight: 55, minW: 3.5, minH: 6 });

  return specs;
}

export function buildFloor(name: string, input: ProgrammeInput, floorIndex: number): PlannedFloor {
  const setback = input.plotWidth >= 30 ? 4 : 2;
  const W = Math.max(18, r1(input.plotWidth - setback));
  const L = Math.max(18, r1(input.plotLength - setback));

  const specs = floorSpecs(input, floorIndex);
  // Sort large -> small for better squarify aspect ratios, but keep parking first
  const ordered = [...specs].sort((a, b) => b.weight - a.weight);

  const rects = squarify(
    ordered.map((s) => s.weight),
    { x: 0, y: 0, w: W, h: L },
  );

  const rooms: PlannedRoom[] = ordered.map((s, i) => {
    const r = rects[i] ?? { x: 0, y: 0, w: 0, h: 0 };
    return {
      name: s.name,
      type: s.type,
      x: r1(r.x),
      y: r1(r.y),
      w: r1(r.w),
      h: r1(r.h),
    };
  }).filter((r) => r.w > 1 && r.h > 1);

  addOpenings(rooms, W, L);
  return { floor: name, widthFt: W, lengthFt: L, rooms };
}

export function buildLayout(input: ProgrammeInput): PlannedFloor[] {
  const names = ["Ground Floor", "First Floor", "Second Floor", "Third Floor", "Fourth Floor"];
  const out: PlannedFloor[] = [];
  for (let i = 0; i < input.floors; i++) out.push(buildFloor(names[i] ?? `Floor ${i + 1}`, input, i));
  return out;
}

/** feet decimal -> 12'-6" */
export function ftIn(v: number) {
  const ft = Math.floor(v);
  const inch = Math.round((v - ft) * 12);
  if (inch === 12) return `${ft + 1}'-0"`;
  return `${ft}'-${inch}"`;
}
