// Real product photos for raw materials.
// 30 key products use locally-generated AI photos in /public/materials/products/.
// Remaining items fall back to closest-matching local photo or Unsplash.

const L = (file: string) => `/materials/products/${file}`;
const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

// Local AI-generated product photos (30 key SKUs)
const IMG = {
  // Building / Concrete
  cement: L("prod-cement.jpg"),
  concreteMix: L("prod-cement.jpg"),
  mortar: L("prod-cement.jpg"),
  // Steel & Structural
  steel: L("prod-tmt-bar.jpg"),
  bindingWire: L("prod-tmt-bar.jpg"),
  mesh: L("prod-tmt-bar.jpg"),
  scaffold: L("prod-tmt-bar.jpg"),
  shutter: L("prod-plywood.jpg"),
  lintel: L("prod-aac-block.jpg"),
  // Bricks / Sand / Aggregate
  bricks: L("prod-red-brick.jpg"),
  aacBlock: L("prod-aac-block.jpg"),
  riverSand: L("prod-river-sand.jpg"),
  mSand: L("prod-river-sand.jpg"),
  aggregate: L("prod-aggregate.jpg"),
  paving: L("prod-aggregate.jpg"),
  // Wood / Doors / Windows
  plywood: L("prod-plywood.jpg"),
  laminate: L("prod-plywood.jpg"),
  woodDoor: L("prod-flush-door.jpg"),
  window: L("prod-upvc-window.jpg"),
  glass: L("prod-upvc-window.jpg"),
  grill: L("prod-tmt-bar.jpg"),
  gate: L("prod-tmt-bar.jpg"),
  railing: L("prod-tmt-bar.jpg"),
  // Hardware
  hinge: L("prod-lock.jpg"),
  lock: L("prod-lock.jpg"),
  nails: L("prod-nails.jpg"),
  screws: L("prod-nails.jpg"),
  helmet: U("photo-1581094794329-c8112a89af12"),
  // Electricals
  wire: L("prod-wire.jpg"),
  switchBoard: L("prod-switch.jpg"),
  socket: L("prod-switch.jpg"),
  mcb: L("prod-switch.jpg"),
  conduit: L("prod-pvc-pipe.jpg"),
  earthing: L("prod-tmt-bar.jpg"),
  // Lighting / Fans
  bulb: L("prod-led-bulb.jpg"),
  tubeLight: L("prod-led-bulb.jpg"),
  ceilingFan: L("prod-ceiling-fan.jpg"),
  // Plumbing
  pipePvc: L("prod-pvc-pipe.jpg"),
  pipeCpvc: L("prod-pvc-pipe.jpg"),
  valve: L("prod-faucet.jpg"),
  trap: L("prod-faucet.jpg"),
  // Bathroom / Sanitary
  faucet: L("prod-faucet.jpg"),
  shower: L("prod-shower.jpg"),
  toilet: L("prod-wc.jpg"),
  basin: L("prod-wash-basin.jpg"),
  mirror: L("prod-wash-basin.jpg"),
  towel: L("prod-faucet.jpg"),
  soapDish: L("prod-faucet.jpg"),
  // Kitchen
  sink: L("prod-kitchen-sink.jpg"),
  countertop: L("prod-granite.jpg"),
  cabinet: L("prod-plywood.jpg"),
  chimney: L("prod-chimney.jpg"),
  // Tiles / Stone
  tiles: L("prod-vitrified-tile.jpg"),
  marble: L("prod-marble.jpg"),
  granite: L("prod-granite.jpg"),
  // Paints & Finishes
  paint: L("prod-paint.jpg"),
  primer: L("prod-paint.jpg"),
  putty: L("prod-putty.jpg"),
  woodPolish: L("prod-paint.jpg"),
  // Waterproofing / Roofing
  waterproof: L("prod-waterproof-chemical.jpg"),
  termite: L("prod-waterproof-chemical.jpg"),
  sealant: L("prod-waterproof-chemical.jpg"),
  adhesive: L("prod-waterproof-chemical.jpg"),
  bitumen: L("prod-waterproof-chemical.jpg"),
  insulation: L("prod-plywood.jpg"),
  // Water systems
  waterTank: L("prod-water-tank.jpg"),
  geyser: L("prod-geyser.jpg"),
  pump: L("prod-geyser.jpg"),
};

const BY_NAME: { match: RegExp; img: string }[] = [
  // foundation / structural
  { match: /ready[-\s]?mix|m25|m20|concrete\s*(mix)?$/i, img: IMG.concreteMix },
  { match: /cement|opc|ppc|plastering\s*cement/i, img: IMG.cement },
  { match: /tmt|steel\s*bar|rebar|fe500/i, img: IMG.steel },
  { match: /binding\s*wire/i, img: IMG.bindingWire },
  { match: /wire\s*mesh|crack[-\s]?control/i, img: IMG.mesh },
  { match: /scaffold|prop/i, img: IMG.scaffold },
  { match: /shuttering|formwork/i, img: IMG.shutter },
  { match: /lintel|precast/i, img: IMG.lintel },
  // masonry
  { match: /aac\s*block|fly\s*ash|concrete\s*solid\s*block|solid\s*block/i, img: IMG.aacBlock },
  { match: /brick/i, img: IMG.bricks },
  { match: /mortar\s*mix/i, img: IMG.mortar },
  // sand / aggregate
  { match: /m[-\s]?sand|manufactured\s*sand/i, img: IMG.mSand },
  { match: /plaster\s*sand|fine\s*sand/i, img: IMG.mSand },
  { match: /river\s*sand|sand/i, img: IMG.riverSand },
  { match: /aggregate|gravel|crushed\s*stone/i, img: IMG.aggregate },
  // chemicals / finishes
  { match: /anti[-\s]?termite/i, img: IMG.termite },
  { match: /waterproof/i, img: IMG.waterproof },
  { match: /silicone|sealant/i, img: IMG.sealant },
  { match: /adhesive|bonding/i, img: IMG.adhesive },
  { match: /putty/i, img: IMG.putty },
  { match: /primer/i, img: IMG.primer },
  { match: /wood\s*polish|melamine/i, img: IMG.woodPolish },
  { match: /paint|emulsion|enamel/i, img: IMG.paint },
  // tiles / stone
  { match: /italian\s*marble|marble/i, img: IMG.marble },
  { match: /granite\s*(slab|countertop|skirting|sink)?/i, img: IMG.granite },
  { match: /vitrified|ceramic|backsplash|tile/i, img: IMG.tiles },
  { match: /grout/i, img: IMG.tiles },
  { match: /paving|interlocking/i, img: IMG.paving },
  // wood / laminate / cabinet
  { match: /laminate/i, img: IMG.laminate },
  { match: /hdhmr|plywood|ply\b|bwp|kitchen\s*cabinet|cabinet|shutter\s*32/i, img: IMG.plywood },
  { match: /teak|wood(en)?\s*(door|frame)|door\s*frame|flush\s*door/i, img: IMG.woodDoor },
  // doors / windows / hardware
  { match: /upvc\s*window|aluminium\s*sliding|window\s*frame|glass\s*window|window\s*panel/i, img: IMG.window },
  { match: /grill/i, img: IMG.grill },
  { match: /hinge/i, img: IMG.hinge },
  { match: /lock/i, img: IMG.lock },
  { match: /pvc\s*bathroom\s*door/i, img: IMG.woodDoor },
  { match: /float\s*glass|toughened\s*glass|glass/i, img: IMG.glass },
  { match: /gate/i, img: IMG.gate },
  { match: /railing/i, img: IMG.railing },
  // plumbing
  { match: /chimney/i, img: IMG.chimney },
  { match: /faucet|tap/i, img: IMG.faucet },
  { match: /shower/i, img: IMG.shower },
  { match: /commode|wc|toilet/i, img: IMG.toilet },
  { match: /wash\s*basin|basin/i, img: IMG.basin },
  { match: /mirror/i, img: IMG.mirror },
  { match: /towel/i, img: IMG.towel },
  { match: /soap/i, img: IMG.soapDish },
  { match: /valve/i, img: IMG.valve },
  { match: /bottle\s*trap|trap/i, img: IMG.trap },
  { match: /geyser/i, img: IMG.geyser },
  { match: /pump|motor/i, img: IMG.pump },
  { match: /water\s*tank|overhead\s*tank|underground/i, img: IMG.waterTank },
  { match: /sink/i, img: IMG.sink },
  { match: /countertop/i, img: IMG.countertop },
  { match: /cpvc|upvc|pvc.*pipe|drainage|water\s*pipe|pipe/i, img: IMG.pipePvc },
  // electrical
  { match: /ceiling\s*fan|fan/i, img: IMG.ceilingFan },
  { match: /led\s*bulb|bulb/i, img: IMG.bulb },
  { match: /tube\s*light/i, img: IMG.tubeLight },
  { match: /mcb|breaker|distribution\s*board/i, img: IMG.mcb },
  { match: /switch\s*box|switch|socket/i, img: IMG.switchBoard },
  { match: /conduit/i, img: IMG.conduit },
  { match: /earth/i, img: IMG.earthing },
  { match: /wire/i, img: IMG.wire },
  // misc
  { match: /helmet/i, img: IMG.helmet },
  { match: /nail/i, img: IMG.nails },
  { match: /screw|fastener|anchor/i, img: IMG.screws },
  { match: /bitumen/i, img: IMG.bitumen },
  { match: /insulation/i, img: IMG.insulation },
  { match: /clay\s*roof|roof\s*tile/i, img: IMG.tiles },
  { match: /compound\s*wall/i, img: IMG.aacBlock },
];

const BY_CATEGORY: Record<string, string> = {
  foundation: IMG.cement,
  structural: IMG.steel,
  masonry: IMG.bricks,
  "doors-windows": IMG.woodDoor,
  electrical: IMG.switchBoard,
  plumbing: IMG.pipePvc,
  plastering: IMG.cement,
  flooring: IMG.tiles,
  roofing: IMG.tiles,
  painting: IMG.paint,
  kitchen: IMG.cabinet,
  bathroom: IMG.tiles,
  finishing: IMG.steel,
  cement: IMG.cement,
  steel: IMG.steel,
  bricks: IMG.bricks,
  sand: IMG.riverSand,
  aggregate: IMG.aggregate,
  plywood: IMG.plywood,
  tiles: IMG.tiles,
  paint: IMG.paint,
};

export function getMaterialImage(name: string, category: string, fallback: string | null): string {
  for (const { match, img } of BY_NAME) {
    if (match.test(name)) return img;
  }
  if (BY_CATEGORY[category.toLowerCase()]) return BY_CATEGORY[category.toLowerCase()];
  return fallback ?? IMG.cement;
}
