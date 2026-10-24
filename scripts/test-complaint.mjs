const BASE = process.env.BASE_URL || "http://localhost:3000";

async function warmUp() {
  // First hit compiles the route in dev mode, which can take a while.
  console.log("0) Warming up routes (first compile can take ~30s)...");
  for (const p of ["/api/complaints?limit=1", "/"]) {
    try {
      const r = await fetch(`${BASE}${p}`);
      console.log(`   GET ${p} -> ${r.status}`);
    } catch (e) {
      console.log(`   GET ${p} failed: ${e.message}`);
    }
  }
}

async function testComplaint() {
  await warmUp();
  const payload = {
    fullName: "Saif Ansari",
    mobile: "9876543210",
    email: "ansarisaifuddin732@gmail.com",
    category: "Software & Bug Reports",
    subject: "Platform Code Sandbox crashing on submission",
    description:
      "Whenever I submit my Python lab assignment, the sandbox times out and returns a 504 Gateway Error.",
    address: "IT Academics Lab 3, Workstation 14",
  };

  console.log(`1) Submitting complaint to ${BASE}/api/complaints ...`);
  const res = await fetch(`${BASE}/api/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log("   status:", res.status);
  console.log("   body:", JSON.stringify(data, null, 2));

  if (!data.success || !data.complaintId) {
    console.log("FAILED: complaint was not created.");
    return;
  }

  console.log(`\n2) Looking the complaint up by ID ${data.complaintId} ...`);
  const getRes = await fetch(`${BASE}/api/complaints/${data.complaintId}`);
  const getData = await getRes.json();
  console.log("   status:", getRes.status);
  console.log("   status field:", getData?.complaint?.status);
  console.log("   notificationStatus:", JSON.stringify(getData?.complaint?.notificationStatus));

  console.log("\n3) Listing complaints (admin list endpoint) ...");
  const listRes = await fetch(`${BASE}/api/complaints?limit=5`);
  const listData = await listRes.json();
  console.log("   status:", listRes.status);
  console.log("   stats:", JSON.stringify(listData.stats));
  console.log("   newest:", listData.complaints?.[0]?.complaintId);
}

testComplaint().catch((e) => console.error("Test crashed:", e));
