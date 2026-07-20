import type { BabyEventId, MemberId } from "./ids";

export type BabyEventType = "feeding" | "diaper";

/** Babyhændelse – kan bagudregisteres (FEATURE_REQUIREMENTS §14). */
export interface BabyEvent {
  id: BabyEventId;
  type: BabyEventType;
  /** ISO 8601 – tidspunktet hændelsen skete (ikke hvornår den blev registreret). */
  at: string;
  note: string | null;
  recordedBy: MemberId | null;
}
