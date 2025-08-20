import { useState, useCallback } from "react";
import { askClothifyAI } from "../lib/api";

export const useClothifyAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestion = useCallback(async (messages) => {
    setLoading(true);
    setError(null);
    try {
      const response = await askClothifyAI(messages);
      if (!response?.suggestion) {
        throw new Error("No suggestion received from AI.");
      }
      return response;
    } catch (err) {
      setError(
        err?.response?.status === 429
          ? "Too many requests, please try again later."
          : err?.response?.data?.error ||
              err.message ||
              "Failed to get AI response."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, getSuggestion };
};
