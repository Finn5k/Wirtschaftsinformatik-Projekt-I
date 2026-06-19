export interface Activity {
  id: string;
  title: string;
  sportType: string;
  xp: number;
  dateLabel: string;
  imageUrl: string;
}

export const mockActivities: Activity[] = [
  {
    id: "activity-1",
    title: "Morning Run",
    sportType: "Laufen",
    xp: 80,
    dateLabel: "Heute",
    imageUrl:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "activity-2",
    title: "Afterwork Fußball",
    sportType: "Fußball",
    xp: 60,
    dateLabel: "Gestern",
    imageUrl:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "activity-3",
    title: "Sunset Ride",
    sportType: "Radfahren",
    xp: 120,
    dateLabel: "12. Mai",
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=300&q=80",
  },
];