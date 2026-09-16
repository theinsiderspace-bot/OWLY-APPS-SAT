import { UserProfile } from "../types";
import { safeStorage } from "../utils/storage";
import { INITIAL_PEER_STUDY_ROOMS, PeerStudyRoom, PeerStudent } from "../data/peerStudyRoomsData";

const ACTIVE_ROOM_KEY = "sat_active_peer_study_room_id";
const PERSONAL_STATUS_KEY = "sat_peer_room_personal_status";

export interface CategoryStudentCounts {
  total: number;
  math: number;
  readingWriting: number;
  strategy: number;
  byRoomId: Record<string, number>;
}

export function getSavedActiveRoomId(): string | null {
  return safeStorage.get<string | null>(ACTIVE_ROOM_KEY, null);
}

export function saveActiveRoomId(roomId: string | null): void {
  safeStorage.set(ACTIVE_ROOM_KEY, roomId);
}

export function getSavedPersonalStatus(): string {
  return safeStorage.get<string>(PERSONAL_STATUS_KEY, "Reviewing core concepts & drilling questions");
}

export function savePersonalStatus(status: string): void {
  safeStorage.set(PERSONAL_STATUS_KEY, status);
}

/**
 * Calculates current real-time counts across categories and individual rooms.
 */
export function calculateCategoryCounts(
  rooms: PeerStudyRoom[],
  activeRoomId: string | null
): CategoryStudentCounts {
  let total = 0;
  let math = 0;
  let readingWriting = 0;
  let strategy = 0;
  const byRoomId: Record<string, number> = {};

  for (const room of rooms) {
    let count = room.baseActiveCount;
    // If user is currently in this room, increment count by 1
    if (activeRoomId === room.id) {
      count += 1;
    }
    byRoomId[room.id] = count;
    total += count;

    if (room.sectionCategory === "Math") {
      math += count;
    } else if (room.sectionCategory === "Reading & Writing") {
      readingWriting += count;
    } else {
      strategy += count;
    }
  }

  return {
    total,
    math,
    readingWriting,
    strategy,
    byRoomId,
  };
}

/**
 * Converts a UserProfile into a PeerStudent object for room presence.
 */
export function createPeerStudentFromProfile(
  profile: UserProfile,
  status: string,
  timeMinutes: number = 1
): PeerStudent {
  return {
    id: `current-user-${profile.id}`,
    name: `${profile.name} (You)`,
    avatarColor: profile.avatarColor || "bg-cyan-600",
    role: profile.role === "admin" ? "admin" : profile.role === "tutor" ? "tutor" : "student",
    tier: profile.tier || "pro",
    targetScore: profile.targetScore || 1520,
    domainScoreTarget: profile.mathTarget || 780,
    currentStatus: status,
    activityType: "drill",
    timeInRoomMinutes: timeMinutes,
    streakDays: profile.studyDaysPerWeek ? profile.studyDaysPerWeek.length * 2 : 7,
    cheersCount: 0,
    lastActive: "Active now",
  };
}
