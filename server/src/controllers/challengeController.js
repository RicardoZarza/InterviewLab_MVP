import { listChallengeSummaries } from '../data/challenges.js';

export function listChallenges(_request, response) {
  response.json({ challenges: listChallengeSummaries() });
}