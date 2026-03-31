import { Flashcard } from "../../types";

/**
 * SuperMemo-2 (SM-2) algorithm implementation.
 * @param card The flashcard being reviewed
 * @param quality The quality of the response (0 to 5)
 * 0: "Again" (Blackout) -> 1
 * 1: "Hard" -> 2
 * 3: "Good" -> 4
 * 5: "Easy" -> 5
 * @returns The updated flashcard with the new schedule
 */
export const updateFlashcardSRS = (card: Flashcard, quality: number): Flashcard => {
  let { interval, easeFactor, consecutiveCorrect } = card;

  // If quality is 3 or more, the card was answered correctly
  if (quality >= 3) {
    if (consecutiveCorrect === 0) {
      interval = 1;
    } else if (consecutiveCorrect === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    consecutiveCorrect += 1;
  } else {
    // If quality is less than 3, we treat it as an incorrect response
    consecutiveCorrect = 0;
    interval = 1;
  }

  // Update ease factor based on SM-2 formula
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...card,
    interval,
    easeFactor,
    consecutiveCorrect,
    nextReview: nextReviewDate.toISOString(),
  };
};
