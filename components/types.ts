export interface Room {
  players: string[];
  status: "waiting" | "playing" | "finished";
  createdAt: number;
}