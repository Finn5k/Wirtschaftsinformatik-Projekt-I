import {
  mockChallenges,
  type Challenge,
} from "../data/mockChallenges";

export function getChallenges(): Challenge[] {
  return mockChallenges;
}

export function getActiveChallenges(): Challenge[] {
  return mockChallenges.filter((challenge) => challenge.status === "ACTIVE");
}

export function getUpcomingChallenges(): Challenge[] {
  return mockChallenges.filter((challenge) => challenge.status === "UPCOMING");
}