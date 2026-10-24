async function testFirestoreRest() {
  const projectId = "whatsapp-saas-7ab44";
  const apiKey = "AIzaSyBfNEJvLhY14u9CC3Eed9RuvHaeUGt7UJM";
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/complaints?key=${apiKey}`;

  const payload = {
    fields: {
      complaintId: { stringValue: "CMP-20261023-TEST1" },
      fullName: { stringValue: "Rahul Kumar" },
      mobile: { stringValue: "9876543210" },
      category: { stringValue: "Software & Bug Reports" },
      subject: { stringValue: "Testing live Firestore REST connection" },
      description: { stringValue: "This is an automated test verifying direct Firestore write." },
      status: { stringValue: "Open" },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("REST status:", res.status);
    console.log("REST response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

testFirestoreRest();
