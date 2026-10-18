import bcrypt from "bcryptjs";
import { connectDB, closeDB } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import { User } from "../src/models/User.js";
import { Vendor } from "../src/models/Vendor.js";
import { ServiceCategory } from "../src/models/ServiceCategory.js";
import { ServiceItem } from "../src/models/ServiceItem.js";
import { Booking } from "../src/models/Booking.js";
import { Quotation } from "../src/models/Quotation.js";
import { Material } from "../src/models/Material.js";
import { MaterialOrder } from "../src/models/MaterialOrder.js";
import { Project } from "../src/models/Project.js";

if (env.NODE_ENV === "production") {
  console.error("❌ Refusing to seed in production environment!");
  process.exit(1);
}

async function seed() {
  await connectDB();
  console.log("🌱 Connected to MongoDB for seeding...");

  // Drop only Homico collections
  const collections = [
    User,
    Vendor,
    ServiceCategory,
    ServiceItem,
    Booking,
    Quotation,
    Material,
    MaterialOrder,
    Project,
  ];

  for (const model of collections) {
    await model.deleteMany({});
    await model.syncIndexes();
  }
  console.log(" Cleaned existing collections & synced indexes.");

  const passwordHash = await bcrypt.hash(env.SEED_PASSWORD, 10);

  // 1. Users
  console.log("Seeding users...");
  const adminUser = await User.create({
    full_name: "Homico Administrator",
    username: "admin_user",
    email: "admin@homico.test",
    phone: "+919876543210",
    password_hash: passwordHash,
    role: "admin",
    is_active: true,
  });

  const customerUser = await User.create({
    full_name: "Demo Customer",
    username: "demo_customer",
    email: "customer@homico.test",
    phone: "+919876543211",
    password_hash: passwordHash,
    role: "customer",
    is_active: true,
  });

  const customerUser2 = await User.create({
    full_name: "Second Customer",
    username: "second_customer",
    email: "customer2@homico.test",
    phone: "+919876543212",
    password_hash: passwordHash,
    role: "customer",
    is_active: true,
  });

  const vendorUser1 = await User.create({
    full_name: "QuickFix Operations",
    username: "vendor_quickfix",
    email: "vendor1@homico.test",
    phone: "+919876543213",
    password_hash: passwordHash,
    role: "vendor",
    is_active: true,
  });

  const vendorUser2 = await User.create({
    full_name: "BuildRight Contractors",
    username: "vendor_buildright",
    email: "vendor2@homico.test",
    phone: "+919876543214",
    password_hash: passwordHash,
    role: "vendor",
    is_active: true,
  });

  const vendorUser3 = await User.create({
    full_name: "Unverified Services",
    username: "vendor_unverified",
    email: "vendor3@homico.test",
    phone: "+919876543215",
    password_hash: passwordHash,
    role: "vendor",
    is_active: true,
  });

  // 2. Service Categories
  console.log("Seeding service categories & items...");
  const catPlumbing = await ServiceCategory.create({
    name: "Plumbing",
    slug: "plumbing",
    description: "Expert leak repairs, pipe fitting, and bathroom fixture installation",
    is_active: true,
  });

  const catElectrical = await ServiceCategory.create({
    name: "Electrical",
    slug: "electrical",
    description: "Wiring, switchboard installations, fault detection, and appliances",
    is_active: true,
  });

  const catAc = await ServiceCategory.create({
    name: "AC Repair",
    slug: "ac-repair",
    description: "Air conditioner servicing, gas refilling, and cooling diagnostics",
    is_active: true,
  });

  const catHouseHelp = await ServiceCategory.create({
    name: "House Help",
    slug: "house-help",
    description: "Deep home cleaning, sanitation, and household assistance",
    is_active: true,
  });

  const catArchitecture = await ServiceCategory.create({
    name: "Architecture & Planning",
    slug: "architecture-planning",
    description: "Floor plans, structural engineering blueprints, and 3D elevations",
    is_active: true,
  });

  const catConstruction = await ServiceCategory.create({
    name: "Construction",
    slug: "construction",
    description: "Full turnkey civil contracting, masonry, and structural renovation",
    is_active: true,
  });

  // 3. Service Items (every inspection_fee = 89)
  const items = [
    // Plumbing
    {
      category: catPlumbing._id,
      title: "Tap & Shower Leakage Repair",
      slug: "tap-shower-leakage-repair",
      description: "Fix leaking taps, shower heads, and replace washers or cartridges",
      is_hourly: false,
      hourly_rate: 0,
      inspection_fee: 89,
      is_active: true,
    },
    {
      category: catPlumbing._id,
      title: "Drain Unclogging Service",
      slug: "drain-unclogging-service",
      description: "Clear clogged sink, basin, or bathroom drainage pipes",
      is_hourly: true,
      hourly_rate: 299,
      inspection_fee: 89,
      is_active: true,
    },
    {
      category: catPlumbing._id,
      title: "Water Tank Pipeline Setup",
      slug: "water-tank-pipeline-setup",
      description: "Installation or replacement of overhead tank connection pipes",
      is_hourly: true,
      hourly_rate: 399,
      inspection_fee: 89,
      is_active: true,
    },
    // Electrical
    {
      category: catElectrical._id,
      title: "Switchboard Repair & Installation",
      slug: "switchboard-repair-installation",
      description: "Repair burnt switches, loose wiring, and install modular boards",
      is_hourly: false,
      hourly_rate: 0,
      inspection_fee: 89,
      is_active: true,
    },
    {
      category: catElectrical._id,
      title: "Ceiling Fan Installation & Repair",
      slug: "ceiling-fan-installation-repair",
      description: "Install, replace regulator, or balance rattling fans",
      is_hourly: false,
      hourly_rate: 0,
      inspection_fee: 89,
      is_active: true,
    },
    {
      category: catElectrical._id,
      title: "Complete House Rewiring",
      slug: "complete-house-rewiring",
      description: "Full internal conduit wire replacement and load balancing",
      is_hourly: true,
      hourly_rate: 450,
      inspection_fee: 89,
      is_active: true,
    },
    // AC Repair
    {
      category: catAc._id,
      title: "Split AC Servicing & Cleaning",
      slug: "split-ac-servicing-cleaning",
      description: "Deep foam jet coil wash, filter cleaning, and drain tray flush",
      is_hourly: false,
      hourly_rate: 0,
      inspection_fee: 89,
      is_active: true,
    },
    {
      category: catAc._id,
      title: "AC Gas Leakage Check & Refill",
      slug: "ac-gas-leakage-check-refill",
      description: "Pressure testing, nitrogen flush, and refrigerant top-up",
      is_hourly: false,
      hourly_rate: 0,
      inspection_fee: 89,
      is_active: true,
    },
    // House Help
    {
      category: catHouseHelp._id,
      title: "Full Home Deep Cleaning",
      slug: "full-home-deep-cleaning",
      description: "Comprehensive dusting, floor scrubbing, kitchen degreasing, bathroom wash",
      is_hourly: true,
      hourly_rate: 350,
      inspection_fee: 89,
      is_active: true,
    },
    // Architecture
    {
      category: catArchitecture._id,
      title: "2D Floor Plan & Municipal Approval",
      slug: "2d-floor-plan-municipal-approval",
      description: "Compliant architectural drafting for sanction and permit approvals",
      is_hourly: false,
      hourly_rate: 0,
      inspection_fee: 89,
      is_active: true,
    },
    // Construction
    {
      category: catConstruction._id,
      title: "Brickwork & Partition Masonry",
      slug: "brickwork-partition-masonry",
      description: "Erecting interior red-brick or fly-ash block walls",
      is_hourly: true,
      hourly_rate: 550,
      inspection_fee: 89,
      is_active: true,
    },
  ];

  const createdItems = await ServiceItem.insertMany(items);

  // 4. Vendors
  console.log("Seeding vendor profiles...");
  const vendor1 = await Vendor.create({
    user: vendorUser1._id,
    business_name: "QuickFix Home Services",
    description: "Certified plumbing and electrical maintenance technicians across Bengaluru",
    phone: "+919876543213",
    email: "vendor1@homico.test",
    service_categories: [catPlumbing._id, catElectrical._id, catAc._id],
    city: "Bengaluru",
    pincode: "560001",
    is_verified: true,
    is_available: true,
  });

  const vendor2 = await Vendor.create({
    user: vendorUser2._id,
    business_name: "BuildRight Constructions",
    description: "Premier architecture and turnkey civil construction contracting company",
    phone: "+919876543214",
    email: "vendor2@homico.test",
    service_categories: [catArchitecture._id, catConstruction._id],
    city: "Bengaluru",
    pincode: "560034",
    is_verified: true,
    is_available: true,
  });

  const vendor3 = await Vendor.create({
    user: vendorUser3._id,
    business_name: "Unverified Local Helpers",
    description: "Unverified contractor profile for testing directory filtering",
    phone: "+919876543215",
    email: "vendor3@homico.test",
    service_categories: [catHouseHelp._id],
    city: "Mysuru",
    pincode: "570001",
    is_verified: false,
    is_available: false,
  });

  // 5. Materials (>= 12 items)
  console.log("Seeding materials catalog...");
  const rawMaterials = [
    {
      name: "UltraTech Super Cement (50kg Bag)",
      category: "Construction",
      description: "High performance PPC cement for high-strength foundation and masonry",
      price: 395,
      unit: "bag",
      stock: 500,
      vendor: vendor2._id,
      is_active: true,
    },
    {
      name: "Tata Tiscon 550D TMT Rebars (12mm)",
      category: "Construction",
      description: "Earthquake resistant thermo-mechanically treated reinforcement steel",
      price: 68,
      unit: "kg",
      stock: 2500,
      vendor: vendor2._id,
      is_active: true,
    },
    {
      name: "Standard Red Clay Kiln Bricks",
      category: "Construction",
      description: "Hand-moulded solid construction bricks with high compressive strength",
      price: 9.5,
      unit: "piece",
      stock: 8000,
      vendor: null,
      is_active: true,
    },
    {
      name: "River Sand (Washed)",
      category: "Construction",
      description: "Clean river bed sand for plastering and concrete mixtures",
      price: 1800,
      unit: "tonne",
      stock: 40,
      vendor: null,
      is_active: true,
    },
    {
      name: "M-Sand (Manufactured Sand)",
      category: "Construction",
      description: "Engineered crushed stone sand optimized for mortar and RCC casting",
      price: 1100,
      unit: "tonne",
      stock: 60,
      vendor: vendor2._id,
      is_active: true,
    },
    {
      name: "Blue Metal Coarse Aggregate (20mm)",
      category: "Construction",
      description: "Crushed granite stones for all structural concrete mixes",
      price: 950,
      unit: "tonne",
      stock: 50,
      vendor: vendor2._id,
      is_active: true,
    },
    {
      name: "Finolex 1-inch CPVC Water Pipe (3m)",
      category: "Plumbing",
      description: "Heat and pressure resistant potable hot and cold water distribution pipe",
      price: 340,
      unit: "piece",
      stock: 120,
      vendor: null,
      is_active: true,
    },
    {
      name: "Supreme PVC Drainage Pipe (110mm x 3m)",
      category: "Plumbing",
      description: "Heavy-duty ring-fit sewage and stormwater drainage pipe",
      price: 620,
      unit: "piece",
      stock: 80,
      vendor: null,
      is_active: true,
    },
    {
      name: "Polycab FR 2.5 sq mm Copper Wire (90m Coil)",
      category: "Electrical",
      description: "Flame retardant electrolytic grade multi-strand flexible copper wire",
      price: 2450,
      unit: "piece",
      stock: 35,
      vendor: null,
      is_active: true,
    },
    {
      name: "Schneider Electric 16A Modular Socket",
      category: "Electrical",
      description: "Heavy duty socket with child safety shutter and indicator",
      price: 185,
      unit: "piece",
      stock: 200,
      vendor: null,
      is_active: true,
    },
    {
      name: "Asian Paints Apex Ultima Exterior Emulsion (20L)",
      category: "Finishing",
      description: "High durability exterior wall paint with anti-algal protection",
      price: 5200,
      unit: "piece",
      stock: 25,
      vendor: null,
      is_active: true,
    },
    {
      name: "CenturyPly Marine Grade BWP Plywood (8x4 ft, 16mm)",
      category: "Finishing",
      description: "Boiling water proof structural plywood treated for termites and borers",
      price: 2850,
      unit: "piece",
      stock: 45,
      vendor: null,
      is_active: true,
    },
  ];

  const createdMaterials = await Material.insertMany(rawMaterials);

  // 6. Sample Projects
  console.log("Seeding sample projects...");
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 45);

  const demoProject = await Project.create({
    owner: customerUser._id,
    name: "Indiranagar Home Renovation",
    description: "Complete living room and kitchen plumbing renovation and repainting",
    site_address: "142, 12th Main Road, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    start_date: today,
    estimated_end_date: nextMonth,
    budget: 250000,
    status: "in_progress",
  });

  // 7. Sample Bookings for customer@homico.test
  console.log("Seeding sample transactional bookings & quotations...");
  const plumbingItem = createdItems.find((i) => i.slug === "tap-shower-leakage-repair");
  const electricalItem = createdItems.find((i) => i.slug === "switchboard-repair-installation");
  const acItem = createdItems.find((i) => i.slug === "split-ac-servicing-cleaning");
  const houseHelpItem = createdItems.find((i) => i.slug === "full-home-deep-cleaning");

  // Booking 1: pending
  await Booking.create({
    user: customerUser._id,
    service: plumbingItem._id,
    vendor: null,
    project: demoProject._id,
    full_name: "Demo Customer",
    phone: "+919876543211",
    address: "142, 12th Main Road, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    scheduled_date: today,
    time_slot: "09:00 - 11:00",
    problem: "Kitchen sink tap constantly dripping",
    estimated_price: plumbingItem.inspection_fee,
    status: "pending",
  });

  // Booking 2: vendor_assigned (QuickFix)
  await Booking.create({
    user: customerUser._id,
    service: electricalItem._id,
    vendor: vendor1._id,
    project: null,
    full_name: "Demo Customer",
    phone: "+919876543211",
    address: "142, 12th Main Road, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    scheduled_date: today,
    time_slot: "11:00 - 13:00",
    problem: "Master bedroom switchboard sparking",
    estimated_price: electricalItem.inspection_fee,
    status: "vendor_assigned",
  });

  // Booking 3: quotation_sent with an active sent Quotation (ready for customer decision)
  const booking3 = await Booking.create({
    user: customerUser._id,
    service: acItem._id,
    vendor: vendor1._id,
    project: null,
    full_name: "Demo Customer",
    phone: "+919876543211",
    address: "142, 12th Main Road, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    scheduled_date: today,
    time_slot: "14:00 - 16:00",
    problem: "AC not cooling and making rattling sound",
    estimated_price: acItem.inspection_fee,
    status: "quotation_sent",
  });

  const validUntil = new Date();
  validUntil.setDate(today.getDate() + 7);

  await Quotation.create({
    booking: booking3._id,
    vendor: vendor1._id,
    labor_cost: 650,
    material_cost: 1200,
    total_amount: 1850,
    description: "Replace faulty capacitor and complete deep coil jet cleaning",
    status: "sent",
    valid_until: validUntil,
  });

  // Booking 4: completed
  await Booking.create({
    user: customerUser._id,
    service: houseHelpItem._id,
    vendor: vendor1._id,
    project: null,
    full_name: "Demo Customer",
    phone: "+919876543211",
    address: "142, 12th Main Road, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    scheduled_date: today,
    time_slot: "16:00 - 18:00",
    problem: "Pre-festival full house deep cleaning",
    estimated_price: houseHelpItem.hourly_rate,
    status: "completed",
  });

  // Booking 5: for customer2@ (IDOR test target)
  await Booking.create({
    user: customerUser2._id,
    service: plumbingItem._id,
    vendor: null,
    project: null,
    full_name: "Second Customer",
    phone: "+919876543212",
    address: "55, Koramangala 4th Block",
    city: "Bengaluru",
    pincode: "560034",
    scheduled_date: today,
    time_slot: "09:00 - 11:00",
    problem: "Bathroom shower low water pressure",
    estimated_price: plumbingItem.inspection_fee,
    status: "pending",
  });

  // 8. Sample Material Order
  console.log("Seeding sample delivered material order...");
  const cementMat = createdMaterials[0];
  const steelMat = createdMaterials[1];

  await MaterialOrder.create({
    user: customerUser._id,
    project: demoProject._id,
    items: [
      {
        material: cementMat._id,
        vendor: cementMat.vendor,
        name: cementMat.name,
        unit: cementMat.unit,
        unit_price: cementMat.price,
        quantity: 10,
        subtotal: cementMat.price * 10,
      },
      {
        material: steelMat._id,
        vendor: steelMat.vendor,
        name: steelMat.name,
        unit: steelMat.unit,
        unit_price: steelMat.price,
        quantity: 50,
        subtotal: steelMat.price * 50,
      },
    ],
    delivery_address: "142, 12th Main Road, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    total_amount: cementMat.price * 10 + steelMat.price * 50,
    status: "delivered",
  });

  console.log("\n========================================================");
  console.log("🎉 SEED COMPLETED SUCCESSFULLY! DEMO CREDENTIALS TABLE:");
  console.log("========================================================");
  console.table([
    { Role: "admin", Email: "admin@homico.test", Password: env.SEED_PASSWORD },
    { Role: "customer", Email: "customer@homico.test", Password: env.SEED_PASSWORD },
    { Role: "customer (IDOR)", Email: "customer2@homico.test", Password: env.SEED_PASSWORD },
    { Role: "vendor (QuickFix)", Email: "vendor1@homico.test", Password: env.SEED_PASSWORD },
    { Role: "vendor (BuildRight)", Email: "vendor2@homico.test", Password: env.SEED_PASSWORD },
    { Role: "vendor (Unverified)", Email: "vendor3@homico.test", Password: env.SEED_PASSWORD },
  ]);
  console.log("========================================================\n");

  await closeDB();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

