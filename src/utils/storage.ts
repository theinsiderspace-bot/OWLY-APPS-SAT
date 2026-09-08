import { SATQuestion } from "../types";
import { generateFull10000QuestionBank } from "../data/questionGeneratorEngine";

/**
 * Safe LocalStorage Utility
 * Guards against browser QuotaExceededError, corrupted JSON, disabled cookies/storage,
 * and sandboxed iframe DOMExceptions.
 */

export const safeStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return fallback;
      }
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[safeStorage] Error reading key "${key}":`, err);
      return fallback;
    }
  },

  set(key: string, value: any): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.warn(`[safeStorage] Error saving key "${key}" (possible storage quota limit):`, err);
      return false;
    }
  },

  remove(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[safeStorage] Error removing key "${key}":`, err);
    }
  },

  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (err) {
      console.warn("[safeStorage] Error clearing localStorage:", err);
    }
  },
};

const CUSTOM_QUESTIONS_KEY = "sat_custom_questions_delta";

/**
 * Load Question Bank safely without overflowing localStorage quota.
 * Combines full deterministic 10,000 question repository with user-added/custom items.
 */
export function loadSafeQuestionBank(): SATQuestion[] {
  const base10000 = generateFull10000QuestionBank();
  const customDelta = safeStorage.get<SATQuestion[]>(CUSTOM_QUESTIONS_KEY, []);

  if (customDelta && customDelta.length > 0) {
    const customMap = new Map(customDelta.map((q) => [q.id, q]));
    // Merge: custom questions override or prepend
    const merged = [...customDelta];
    for (const q of base10000) {
      if (!customMap.has(q.id)) {
        merged.push(q);
      }
    }
    return merged;
  }

  return base10000;
}

/**
 * Save custom question delta or extracted questions safely.
 */
export function saveSafeQuestionBank(currentBank: SATQuestion[]): void {
  try {
    // Only persist custom, uploaded, or edited questions (not the entire 10k generated bank)
    const customQuestions = currentBank.filter(
      (q) => !q.id.startsWith("math-alg-") &&
             !q.id.startsWith("math-adv-") &&
             !q.id.startsWith("math-ps-") &&
             !q.id.startsWith("math-geom-") &&
             !q.id.startsWith("rw-") ||
             q.source?.includes("Upload") ||
             q.source?.includes("Custom")
    );

    safeStorage.set(CUSTOM_QUESTIONS_KEY, customQuestions.slice(0, 500));
  } catch (err) {
    console.warn("[safeStorage] Failed to save custom questions delta:", err);
  }
}
