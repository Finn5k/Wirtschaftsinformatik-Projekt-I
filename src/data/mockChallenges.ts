export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  xpReward: number;
  type: "weekly" | "event" | "community";
  status: "ACTIVE" | "UPCOMING" | "COMPLETED";
}

export const mockChallenges: Challenge[] = [
  {
    id: "weekly-3-sessions",
    title: "3 Sessions diese Woche",
    description:
      "Checke bei drei Sessions ein und sammle einen Bonus für deine Aktivität.",
    progress: 1,
    goal: 3,
    xpReward: 150,
    type: "weekly",
    status: "ACTIVE",
  },
  {
    id: "runner-starter",
    title: "Runner Starter",
    description:
      "Nimm an zwei Lauf-Sessions teil und verbessere deinen Ausdauer-Rang.",
    progress: 0,
    goal: 2,
    xpReward: 100,
    type: "community",
    status: "ACTIVE",
  },
  {
    id: "campus-sports-day",
    title: "Campus Sports Day",
    description:
      "Offizielles Community-Event mit mehreren Sportarten und Bonus-XP.",
    progress: 0,
    goal: 1,
    xpReward: 250,
    type: "event",
    status: "UPCOMING",
  },
];