import fs from "fs";
import path from "path";
import { Complaint, ComplaintSummaryStats } from "@/types/complaint";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "complaints.json");

function ensureDirectory() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    // Seed with realistic IT Academics complaints matching user's screenshot
    const seedData: Complaint[] = [
      {
        id: "seed-1",
        complaintId: "CMP-20261023-001",
        fullName: "Rahul Kumar",
        mobile: "9876543201",
        email: "rahul@itacademy.com",
        category: "Software & Bug Reports",
        subject: "Platform Code Sandbox crashing on submission",
        description: "Whenever I submit my Python lab assignment, the sandbox times out and returns a 504 Gateway Error.",
        address: "IT Academics Lab 3, Workstation 14",
        status: "Open",
        adminNote: "Assigned to DevOps engineering team for runtime evaluation.",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: "seed-2",
        complaintId: "CMP-20261020-002",
        fullName: "Priya Sharma",
        mobile: "9876543202",
        email: "priya.s@itacademy.com",
        category: "Hardware & Workstation Issues",
        subject: "Dual Monitor HDMI display flickering",
        description: "The secondary monitor in Lab 2 randomly turns black during training workshops.",
        address: "Lab 2, Desk 08",
        status: "In Progress",
        adminNote: "Replacement HDMI 2.1 cable requested from inventory.",
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "seed-3",
        complaintId: "CMP-20261018-003",
        fullName: "Amit Singh",
        mobile: "9876543203",
        email: "amit.tech@itacademy.com",
        category: "Account & Access Permissions",
        subject: "GitLab repository access permission denied",
        description: "Unable to push commit to sprint repository. Need maintainer access granted.",
        address: "Remote Workstation",
        status: "Resolved",
        adminNote: "Added student to IT Academics batch repository with contributor role.",
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      },
    ];
    fs.writeFileSync(filePath, JSON.stringify(seedData, null, 2), "utf8");
  }
}

export function getAllStoredComplaints(): Complaint[] {
  ensureDirectory();
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

export function saveStoredComplaint(complaint: Complaint): void {
  ensureDirectory();
  const all = getAllStoredComplaints();
  // Check if already exists
  const existingIdx = all.findIndex((c) => c.complaintId === complaint.complaintId || c.id === complaint.id);
  if (existingIdx >= 0) {
    all[existingIdx] = complaint;
  } else {
    all.unshift(complaint);
  }
  fs.writeFileSync(filePath, JSON.stringify(all, null, 2), "utf8");
}

export function updateStoredComplaint(id: string, updates: Partial<Complaint>): Complaint | null {
  ensureDirectory();
  const all = getAllStoredComplaints();
  const idx = all.findIndex((c) => c.id === id || c.complaintId === id);
  if (idx === -1) return null;

  all[idx] = {
    ...all[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(filePath, JSON.stringify(all, null, 2), "utf8");
  return all[idx];
}

export function getStoredComplaintById(id: string): Complaint | null {
  ensureDirectory();
  const all = getAllStoredComplaints();
  return all.find((c) => c.id === id || c.complaintId === id) || null;
}

export function deleteStoredComplaint(id: string): boolean {
  ensureDirectory();
  const all = getAllStoredComplaints();
  const filtered = all.filter((c) => c.id !== id && c.complaintId !== id);
  if (filtered.length !== all.length) {
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), "utf8");
    return true;
  }
  return false;
}

export function getStoredStats(): ComplaintSummaryStats {
  const all = getAllStoredComplaints();
  const stats: ComplaintSummaryStats = {
    total: all.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  };

  all.forEach((c) => {
    if (c.status === "Open") stats.open++;
    else if (c.status === "In Progress") stats.inProgress++;
    else if (c.status === "Resolved") stats.resolved++;
    else if (c.status === "Rejected") stats.rejected++;
  });

  return stats;
}
