import mongoose from "mongoose";
import { connectDB, closeDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Vendor } from "../src/models/Vendor.js";
import { Booking } from "../src/models/Booking.js";
import { Material } from "../src/models/Material.js";

async function explainHotQueries() {
  const args = process.argv.slice(2);
  const bulkIndex = args.indexOf("--bulk");
  const isBulk = bulkIndex !== -1;
  const bulkCount = isBulk ? parseInt(args[bulkIndex + 1], 10) || 500 : 0;

  let targetUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/homico";
  if (isBulk) {
    targetUri = "mongodb://127.0.0.1:27017/homico_explain_tmp";
  }

  await connectDB(targetUri);
  console.log(`🔍 Connected to ${targetUri} for query execution plan inspection`);

  if (isBulk) {
    console.log(`⏳ Inserting ${bulkCount} synthetic bookings into temporary collection...`);
    const tempBookings = [];
    const dummyUserId = new mongoose.Types.ObjectId();
    const dummyServiceId = new mongoose.Types.ObjectId();
    for (let i = 0; i < bulkCount; i++) {
      tempBookings.push({
        user: dummyUserId,
        service: dummyServiceId,
        full_name: `Synthetic User ${i}`,
        phone: "+919999999999",
        address: "Synthetic Address",
        scheduled_date: new Date(),
        time_slot: "09:00 - 11:00",
        estimated_price: 100,
        status: i % 2 === 0 ? "pending" : "confirmed",
        created_at: new Date(Date.now() - i * 1000),
      });
    }
    await Booking.insertMany(tempBookings);
    await Booking.syncIndexes();
  }

  console.log("\n=======================================================");
  console.log("   MONGOOSE QUERY EXPLAIN (executionStats) RESULTS     ");
  console.log("=======================================================\n");

  const results = [];

  function extractStageAndIndex(stageObj) {
    let curr = stageObj;
    const stages = [];
    let indexName = "None";
    while (curr) {
      stages.push(curr.stage);
      if (curr.indexName) indexName = curr.indexName;
      curr = curr.inputStage;
    }
    return {
      stage: stages.slice(0, 3).join(" -> "),
      indexName,
    };
  }

  // 1. User login lookup by email
  const userExplain = await User.find({ email: "customer@homico.test" })
    .explain("executionStats");
  const userStats = userExplain.executionStats;
  const userInfo = extractStageAndIndex(userStats.executionStages);
  results.push({
    Target: "User.find({ email }) [Login]",
    Stage: userInfo.stage,
    Index: userInfo.indexName,
    DocsExamined: userStats.totalDocsExamined,
    Returned: userStats.nReturned,
  });

  // 2. Customer dashboard bookings sorted by created_at desc
  const sampleUser = await User.findOne({ email: "customer@homico.test" });
  if (sampleUser) {
    const bookingExplain = await Booking.find({ user: sampleUser._id })
      .sort({ created_at: -1 })
      .explain("executionStats");
    const bStats = bookingExplain.executionStats;
    const bInfo = extractStageAndIndex(bStats.executionStages);
    results.push({
      Target: "Booking.find({ user }).sort({ created_at: -1 })",
      Stage: bInfo.stage,
      Index: bInfo.indexName,
      DocsExamined: bStats.totalDocsExamined,
      Returned: bStats.nReturned,
    });
  }

  // 3. Admin bookings queue by status
  const adminBookingExplain = await Booking.find({ status: "pending" })
    .sort({ created_at: -1 })
    .explain("executionStats");
  const abStats = adminBookingExplain.executionStats;
  const abInfo = extractStageAndIndex(abStats.executionStages);
  results.push({
    Target: "Booking.find({ status }).sort({ created_at: -1 })",
    Stage: abInfo.stage,
    Index: abInfo.indexName,
    DocsExamined: abStats.totalDocsExamined,
    Returned: abStats.nReturned,
  });

  // 4. Vendor directory filter by verified and city
  const vendorExplain = await Vendor.find({ is_verified: true, city: "Bengaluru" })
    .explain("executionStats");
  const vStats = vendorExplain.executionStats;
  const vInfo = extractStageAndIndex(vStats.executionStages);
  results.push({
    Target: "Vendor.find({ is_verified, city })",
    Stage: vInfo.stage,
    Index: vInfo.indexName,
    DocsExamined: vStats.totalDocsExamined,
    Returned: vStats.nReturned,
  });

  // 5. Materials catalog filter by category & active
  const matExplain = await Material.find({ category: "Construction", is_active: true })
    .explain("executionStats");
  const mStats = matExplain.executionStats;
  const mInfo = extractStageAndIndex(mStats.executionStages);
  results.push({
    Target: "Material.find({ category, is_active })",
    Stage: mInfo.stage,
    Index: mInfo.indexName,
    DocsExamined: mStats.totalDocsExamined,
    Returned: mStats.nReturned,
  });

  console.table(results);

  if (isBulk) {
    console.log("🧹 Dropping temporary database 'homico_explain_tmp'...");
    await mongoose.connection.dropDatabase();
  }

  await closeDB();
}

explainHotQueries().catch((err) => {
  console.error("Explain failed:", err);
  process.exit(1);
});

