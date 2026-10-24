import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfNEJvLhY14u9CC3Eed9RuvHaeUGt7UJM",
  authDomain: "whatsapp-saas-7ab44.firebaseapp.com",
  projectId: "whatsapp-saas-7ab44",
  storageBucket: "whatsapp-saas-7ab44.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testWrite() {
  console.log("Testing Firestore write via Client SDK...");
  try {
    const docRef = await addDoc(collection(db, "complaints"), {
      complaintId: "CMP-20261023-VERIFIED",
      fullName: "Saif Ansari",
      mobile: "+91 9876543210",
      email: "ansarisaifuddin732@gmail.com",
      category: "Software & Bug Reports",
      subject: "Verified IT Academics System Test",
      description: "Testing end-to-end complaint persistence and verification.",
      status: "Open",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✓ SUCCESS: Firestore Document Created with ID:", docRef.id);
  } catch (err) {
    console.log("Write with anonymous or unauth:", err.message);
    if (err.message.includes("permission-denied")) {
      console.log("Permission denied as expected. Trying with anonymous auth...");
      try {
        const userCred = await signInAnonymously(auth);
        console.log("Signed in anonymously as:", userCred.user.uid);
        const docRef2 = await addDoc(collection(db, "complaints"), {
          complaintId: "CMP-20261023-VERIFIED",
          fullName: "Saif Ansari",
          mobile: "+91 9876543210",
          email: "ansarisaifuddin732@gmail.com",
          category: "Software & Bug Reports",
          subject: "Verified IT Academics System Test",
          description: "Testing end-to-end complaint persistence and verification.",
          status: "Open",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log("✓ SUCCESS with auth: Document ID:", docRef2.id);
      } catch (authErr) {
        console.log("Anonymous auth status:", authErr.message);
      }
    }
  }
}

testWrite();
