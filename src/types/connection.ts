export type ConnectionState =
  "disconnected" | "connecting" | "connected" | "reconnecting" | "offline";

export interface ConnectionStatus {
  state: ConnectionState;
  source: "mock" | "home-assistant";
  /** ISO 8601 – hvornår tilstanden indtraf. */
  since: string;
}
