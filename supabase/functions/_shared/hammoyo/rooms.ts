export type HammoyoRoomStatus =
  | "draft"
  | "collecting"
  | "low_confidence"
  | "recommended"
  | "closed"
  | "expired"
  | "deleted";

export type RoomLike = {
  status?: string | null;
  expires_at?: string | null;
  closed_at?: string | null;
  deleted_at?: string | null;
};

export function canonicalRoomStatus(room: RoomLike, now = Date.now()): HammoyoRoomStatus {
  if (room.deleted_at || room.status === "deleted") return "deleted";
  if (room.closed_at || room.status === "closed") return "closed";
  if (room.status === "expired") return "expired";
  if (room.expires_at && new Date(room.expires_at).getTime() < now) return "expired";
  if (room.status === "draft") return "draft";
  if (room.status === "low_confidence") return "low_confidence";
  if (room.status === "recommended") return "recommended";
  return "collecting";
}

export function isJoinableRoom(room: RoomLike) {
  return isWritableRoom(room);
}

export function isWritableRoom(room: RoomLike) {
  return ["collecting", "low_confidence", "recommended"].includes(canonicalRoomStatus(room));
}
