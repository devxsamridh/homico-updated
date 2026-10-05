import { useEffect, useRef, useState } from "react";
import type { PlannedFloor, PlannedRoom, RoomType, Opening } from "@/lib/ai-planner.functions";
import { ftIn } from "@/lib/floorplan-layout";

const ROOM_COLORS: Record<RoomType, { fill: string; stroke: string; text: string }> = {
  living: { fill: "#FFF6EC", stroke: "#E6A15A", text: "#5A3512" },
  kitchen: { fill: "#FFFBE9", stroke: "#D9B84E", text: "#5C470B" },
  bedroom: { fill: "#F2F5FF", stroke: "#6E8CD1", text: "#1E2F58" },
  bathroom: { fill: "#EDFAF7", stroke: "#5AB2A3", text: "#17453F" },
  dining: { fill: "#FFF3EF", stroke: "#D77E68", text: "#5A2214" },
  balcony: { fill: "#F1FAEC", stroke: "#78B966", text: "#26491B" },
  parking: { fill: "#F2F2F2", stroke: "#9A9A9A", text: "#3F3F3F" },
  staircase: { fill: "#F6F0FE", stroke: "#9F7BC9", text: "#341D53" },
  pooja: { fill: "#FFF0F7", stroke: "#D96FA8", text: "#5A1A3C" },
  utility: { fill: "#F8F2E8", stroke: "#B39569", text: "#4A371B" },
  office: { fill: "#F0F7FC", stroke: "#6AA6D6", text: "#1B3C55" },
  store: { fill: "#F6F2EB", stroke: "#A79880", text: "#40372B" },
  garden: { fill: "#F2FAE9", stroke: "#7CBF54", text: "#2B4A16" },
  corridor: { fill: "#FBFBF7", stroke: "#C6C2B4", text: "#4F4D42" },
  other: { fill: "#F4F4F4", stroke: "#999", text: "#333" },
};

const WALL = "#111827";
const WALL_T = 0.85; // exterior wall thickness in feet
const PART_T = 0.5; // partition thickness

interface Props {
  floor: PlannedFloor;
  height?: number;
}

export function FloorPlanCanvas({ floor, height = 560 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const PAD = 7; // feet of margin for dimension lines
  const vbW = floor.widthFt + PAD * 2;
  const vbH = floor.lengthFt + PAD * 2;

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [floor]);

  // non-passive wheel listener so we can preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      setZoom((z) => Math.max(0.5, Math.min(6, z * Math.exp(-dy * 0.0015))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const W = floor.widthFt;
  const L = floor.lengthFt;

  return (
    <div className="relative w-full rounded-xl border border-border bg-[#FCFCFA] overflow-hidden select-none">
      <div className="absolute top-3 right-3 z-10 flex gap-1 bg-background/90 backdrop-blur rounded-lg border border-border p-1 shadow-sm">
        <button
          className="h-8 w-8 rounded-md hover:bg-muted text-lg font-semibold"
          onClick={() => setZoom((z) => Math.min(6, z * 1.2))}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className="h-8 w-8 rounded-md hover:bg-muted text-lg font-semibold"
          onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          className="h-8 px-2 rounded-md hover:bg-muted text-xs font-semibold"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        >
          Reset
        </button>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ height, cursor: dragRef.current ? "grabbing" : "grab", touchAction: "none" }}
        className="w-full"
      >
        <svg
          viewBox={`${-PAD} ${-PAD} ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* exterior wall poché: thick black band around the footprint */}
          <rect
            x={-WALL_T / 2}
            y={-WALL_T / 2}
            width={W + WALL_T}
            height={L + WALL_T}
            fill="none"
            stroke={WALL}
            strokeWidth={WALL_T}
          />

          {/* room fills */}
          {floor.rooms.map((r, i) => (
            <RoomFill key={`f${i}`} room={r} />
          ))}

          {/* interior partitions drawn as thick lines on every room edge */}
          {floor.rooms.map((r, i) => (
            <rect
              key={`p${i}`}
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              fill="none"
              stroke={WALL}
              strokeWidth={PART_T}
            />
          ))}

          {/* openings cut through the walls */}
          {floor.rooms.map((r, i) =>
            (r.openings ?? []).map((op, j) => (
              <OpeningShape key={`o${i}-${j}`} room={r} opening={op} W={W} L={L} />
            )),
          )}

          {/* furniture */}
          {floor.rooms.map((r, i) => (
            <Furniture key={`fu${i}`} room={r} />
          ))}

          {/* labels above everything */}
          {floor.rooms.map((r, i) => (
            <RoomLabel key={`l${i}`} room={r} />
          ))}


          {/* dimension lines */}
          <DimLine x1={0} y1={-PAD + 2.2} x2={W} y2={-PAD + 2.2} label={ftIn(W)} horizontal />
          <DimLine x1={-PAD + 2.2} y1={0} x2={-PAD + 2.2} y2={L} label={ftIn(L)} />

          {/* compass */}
          <g transform={`translate(${W + 3.2}, ${-3.2})`}>
            <circle r={1.7} fill="#fff" stroke={WALL} strokeWidth={0.12} />
            <path d="M 0 -1.25 L 0.42 0 L 0 1.25 L -0.42 0 Z" fill="#E11D48" />
            <text y={-2.1} textAnchor="middle" fontSize={1.1} fill={WALL} fontWeight={700}>
              N
            </text>
          </g>

          {/* title */}
          <text
            x={W / 2}
            y={L + PAD - 1.4}
            textAnchor="middle"
            fontSize={2.2}
            letterSpacing={0.3}
            fontWeight={700}
            fill={WALL}
          >
            {floor.floor.toUpperCase()}
          </text>
        </svg>
      </div>
      <p className="text-[11px] text-muted-foreground px-3 py-2 border-t border-border bg-background/60">
        Drag to pan · Scroll or pinch to zoom · Dimensions in feet
      </p>
    </div>
  );
}

function RoomFill({ room }: { room: PlannedRoom }) {
  const c = ROOM_COLORS[room.type] ?? ROOM_COLORS.other;
  return <rect x={room.x} y={room.y} width={room.w} height={room.h} fill={c.fill} stroke={c.stroke} strokeWidth={0.08} />;
}

function RoomLabel({ room }: { room: PlannedRoom }) {
  const c = ROOM_COLORS[room.type] ?? ROOM_COLORS.other;
  const cx = room.x + room.w / 2;
  const cy = room.y + room.h / 2;
  const vertical = room.h > room.w * 1.6;
  const along = vertical ? room.h : room.w;
  const fitByName = (along * 0.86 * 1.45) / Math.max(6, room.name.length);
  const fs = Math.max(0.62, Math.min(1.5, Math.min(room.w, room.h) / 6.5, fitByName));

  if (room.w < 3 || room.h < 3) return null;
  
  const maxLen = along * 0.86;
  const nameEst = room.name.length * fs * 0.62;
  const nameLen = nameEst > maxLen ? maxLen : undefined;
  const dimText = `${ftIn(room.w)} × ${ftIn(room.h)}`;
  const dimEst = dimText.length * fs * 0.75 * 0.55;
  const dimLen = dimEst > maxLen ? maxLen : undefined;

  return (
    <g transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined} style={{ pointerEvents: "none" }}>
      <text
        x={cx}
        y={cy - fs * 0.15}
        textAnchor="middle"
        fontSize={fs}
        fontWeight={700}
        fill={c.text}
        textLength={nameLen}
        lengthAdjust="spacingAndGlyphs"
      >
        {room.name.toUpperCase()}
      </text>
      <text
        x={cx}
        y={cy + fs * 1.1}
        textAnchor="middle"
        fontSize={fs * 0.75}
        fill={c.text}
        opacity={0.8}
        textLength={dimLen}
        lengthAdjust="spacingAndGlyphs"
      >
        {dimText}
      </text>
    </g>
  );

}

function DimLine({
  x1,
  y1,
  x2,
  y2,
  label,
  horizontal = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  horizontal?: boolean;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const tick = 0.6;
  return (
    <g stroke="#7C3AED" strokeWidth={0.08} fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {horizontal ? (
        <>
          <line x1={x1} y1={y1 - tick} x2={x1} y2={y1 + tick} />
          <line x1={x2} y1={y2 - tick} x2={x2} y2={y2 + tick} />
        </>
      ) : (
        <>
          <line x1={x1 - tick} y1={y1} x2={x1 + tick} y2={y1} />
          <line x1={x2 - tick} y1={y2} x2={x2 + tick} y2={y2} />
        </>
      )}
      <g transform={horizontal ? undefined : `rotate(-90 ${mx} ${my})`}>
        <rect
          x={mx - 2.6}
          y={my - 1.1}
          width={5.2}
          height={2.2}
          fill="#FCFCFA"
          stroke="none"
        />
        <text x={mx} y={my + 0.55} textAnchor="middle" fontSize={1.5} fill="#7C3AED" stroke="none" fontWeight={600}>
          {label}
        </text>
      </g>
    </g>
  );
}

function OpeningShape({
  room,
  opening,
  W,
  L,
}: {
  room: PlannedRoom;
  opening: Opening;
  W: number;
  L: number;
}) {
  const horiz = opening.wall === "top" || opening.wall === "bottom";
  const span = horiz ? room.w : room.h;
  const off = Math.max(0, Math.min(opening.offset, span - opening.width));
  const w = Math.max(1.5, Math.min(opening.width, span - off));

  const isExterior =
    (opening.wall === "top" && room.y <= 0.15) ||
    (opening.wall === "bottom" && Math.abs(room.y + room.h - L) <= 0.15) ||
    (opening.wall === "left" && room.x <= 0.15) ||
    (opening.wall === "right" && Math.abs(room.x + room.w - W) <= 0.15);
  const thickness = isExterior ? WALL_T + 0.2 : PART_T + 0.2;

  let x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0;
  switch (opening.wall) {
    case "top":
      x1 = room.x + off;
      x2 = x1 + w;
      y1 = y2 = room.y;
      break;
    case "bottom":
      x1 = room.x + off;
      x2 = x1 + w;
      y1 = y2 = room.y + room.h;
      break;
    case "left":
      y1 = room.y + off;
      y2 = y1 + w;
      x1 = x2 = room.x;
      break;
    case "right":
      y1 = room.y + off;
      y2 = y1 + w;
      x1 = x2 = room.x + room.w;
      break;
  }

  const gap = <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFFFFF" strokeWidth={thickness} strokeLinecap="butt" />;

  if (opening.type === "door") {
    // hinge at (x1,y1); leaf swings into the room
    const inward =
      opening.wall === "top" ? { dx: 0, dy: 1 } : opening.wall === "bottom" ? { dx: 0, dy: -1 } : opening.wall === "left" ? { dx: 1, dy: 0 } : { dx: -1, dy: 0 };
    const ex = x1 + (horiz ? w : 0) * 0 + inward.dx * w;
    const ey = y1 + inward.dy * w;
    const leafX = horiz ? x1 + w : x1;
    const leafY = horiz ? y1 : y1 + w;
    return (
      <g>
        {gap}
        {/* door leaf */}
        <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={WALL} strokeWidth={0.12} />
        {/* swing arc from open leaf to closed position */}
        <path d={`M ${ex} ${ey} A ${w} ${w} 0 0 ${horiz ? (inward.dy > 0 ? 0 : 1) : inward.dx > 0 ? 1 : 0} ${leafX} ${leafY}`} fill="none" stroke={WALL} strokeWidth={0.08} strokeDasharray="0.4 0.3" />
      </g>
    );
  }

  // window: frame lines across the opening
  const dx = horiz ? 0 : thickness / 2.6;
  const dy = horiz ? thickness / 2.6 : 0;
  return (
    <g>
      {gap}
      <line x1={x1 - dx} y1={y1 - dy} x2={x2 - dx} y2={y2 - dy} stroke={WALL} strokeWidth={0.1} />
      <line x1={x1 + dx} y1={y1 + dy} x2={x2 + dx} y2={y2 + dy} stroke={WALL} strokeWidth={0.1} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2563EB" strokeWidth={0.09} />
    </g>
  );
}

export const FLOOR_PLAN_ROOM_COLORS = ROOM_COLORS;

/* ---------------------------- furniture symbols ---------------------------- */

function Furniture({ room }: { room: PlannedRoom }) {
  const s = { fill: "none", stroke: "#4B5563", strokeWidth: 0.09 } as const;
  const { x, y, w, h } = room;
  if (w < 4 || h < 4) return null;
  const landscape = w >= h;

  switch (room.type) {
    case "bedroom": {
      const bw = Math.min(6.2, w - 1.6);
      const bh = Math.min(6.6, h - 1.6);
      const bx = x + (w - bw) / 2;
      const by = y + 0.8;
      return (
        <g style={{ pointerEvents: "none" }}>
          <rect x={bx} y={by} width={bw} height={bh} rx={0.2} {...s} />
          <rect x={bx} y={by} width={bw} height={bh * 0.26} {...s} />
          <line x1={bx + bw / 2} y1={by} x2={bx + bw / 2} y2={by + bh * 0.26} {...s} />
          {/* side tables */}
          <rect x={bx - 1.4} y={by} width={1.2} height={1.2} {...s} />
          <rect x={bx + bw + 0.2} y={by} width={1.2} height={1.2} {...s} />
          {/* wardrobe along bottom wall */}
          {h > 11 && <rect x={x + 0.6} y={y + h - 2.4} width={Math.min(6, w - 1.2)} height={1.8} {...s} />}
        </g>
      );
    }
    case "living": {
      const sw = landscape ? Math.min(7, w - 2) : Math.min(2.6, w - 2);
      const sh = landscape ? 2.6 : Math.min(7, h - 2);
      return (
        <g style={{ pointerEvents: "none" }}>
          <rect x={x + 0.9} y={y + 0.9} width={sw} height={sh} rx={0.3} {...s} />
          <rect x={x + 0.9} y={y + 0.9} width={landscape ? sw : 0.7} height={landscape ? 0.7 : sh} {...s} />
          {/* coffee table */}
          <rect
            x={x + (landscape ? 2 : 4.2)}
            y={y + (landscape ? 4.4 : 2)}
            width={landscape ? 3.6 : 2.4}
            height={landscape ? 2 : 3.6}
            rx={0.2}
            {...s}
          />
          {/* tv unit */}
          <rect x={x + w - 1.6} y={y + h / 2 - 2} width={1} height={4} {...s} />
        </g>
      );
    }
    case "dining": {
      const tw = Math.min(5.2, w - 2.4);
      const th = Math.min(3.4, h - 2.4);
      const tx = x + (w - tw) / 2;
      const ty = y + (h - th) / 2;
      return (
        <g style={{ pointerEvents: "none" }}>
          <rect x={tx} y={ty} width={tw} height={th} rx={0.3} {...s} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={tx + 0.4 + i * (tw / 3)} y={ty - 1.2} width={1.1} height={0.9} {...s} />
              <rect x={tx + 0.4 + i * (tw / 3)} y={ty + th + 0.3} width={1.1} height={0.9} {...s} />
            </g>
          ))}
        </g>
      );
    }
    case "kitchen": {
      return (
        <g style={{ pointerEvents: "none" }}>
          {/* counter L-shape */}
          <rect x={x + 0.4} y={y + 0.4} width={w - 0.8} height={2} {...s} />
          <rect x={x + 0.4} y={y + 0.4} width={2} height={Math.min(h - 0.8, h * 0.7)} {...s} />
          {/* sink */}
          <rect x={x + w - 3.2} y={y + 0.8} width={1.8} height={1.2} rx={0.15} {...s} />
          {/* hob */}
          <circle cx={x + 1.4} cy={y + 3.2} r={0.35} {...s} />
          <circle cx={x + 1.4} cy={y + 4.4} r={0.35} {...s} />
        </g>
      );
    }
    case "bathroom": {
      return (
        <g style={{ pointerEvents: "none" }}>
          {/* wc */}
          <rect x={x + 0.5} y={y + 0.6} width={1.3} height={2} rx={0.5} {...s} />
          {/* basin */}
          <rect x={x + w - 2.1} y={y + 0.6} width={1.6} height={1.2} rx={0.4} {...s} />
          {/* shower area */}
          <rect x={x + 0.5} y={y + h - 3.2} width={Math.max(2.2, w - 1)} height={2.7} {...s} />
          <line x1={x + 0.5} y1={y + h - 3.2} x2={x + Math.max(2.7, w - 0.5)} y2={y + h - 0.5} {...s} />
        </g>
      );
    }
    case "parking": {
      const cw = Math.min(6, w - 1.6);
      const ch = Math.min(13, h - 2);
      const cx = x + (w - cw) / 2;
      const cy = y + (h - ch) / 2;
      return (
        <g style={{ pointerEvents: "none" }}>
          <rect x={cx} y={cy} width={cw} height={ch} rx={1.2} {...s} />
          <rect x={cx + 0.6} y={cy + ch * 0.18} width={cw - 1.2} height={ch * 0.26} rx={0.6} {...s} />
          <rect x={cx + 0.6} y={cy + ch * 0.56} width={cw - 1.2} height={ch * 0.24} rx={0.5} {...s} />
        </g>
      );
    }
    case "staircase": {
      const steps = 9;
      const dir = h >= w;
      return (
        <g style={{ pointerEvents: "none" }}>
          {Array.from({ length: steps }).map((_, i) =>
            dir ? (
              <line key={i} x1={x + 0.4} y1={y + 0.6 + (i * (h - 1.2)) / steps} x2={x + w - 0.4} y2={y + 0.6 + (i * (h - 1.2)) / steps} {...s} />
            ) : (
              <line key={i} x1={x + 0.6 + (i * (w - 1.2)) / steps} y1={y + 0.4} x2={x + 0.6 + (i * (w - 1.2)) / steps} y2={y + h - 0.4} {...s} />
            ),
          )}
          <path
            d={dir ? `M ${x + w / 2} ${y + h - 1} L ${x + w / 2} ${y + 1}` : `M ${x + 1} ${y + h / 2} L ${x + w - 1} ${y + h / 2}`}
            stroke="#4B5563"
            strokeWidth={0.1}
            fill="none"
            markerEnd=""
          />
        </g>
      );
    }
    case "office": {
      return (
        <g style={{ pointerEvents: "none" }}>
          <rect x={x + 0.8} y={y + 0.8} width={Math.min(5, w - 1.6)} height={2.2} {...s} />
          <rect x={x + 2} y={y + 3.4} width={1.6} height={1.4} rx={0.3} {...s} />
        </g>
      );
    }
    case "pooja":
      return (
        <g style={{ pointerEvents: "none" }}>
          <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={1.4} {...s} />
        </g>
      );
    case "utility":
      return (
        <g style={{ pointerEvents: "none" }}>
          <rect x={x + 0.5} y={y + 0.5} width={2} height={2} {...s} />
          <circle cx={x + 1.5} cy={y + 1.5} r={0.6} {...s} />
        </g>
      );
    default:
      return null;
  }
}
