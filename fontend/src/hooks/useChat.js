import { useState, useCallback } from "react";
import { getUserConversations } from "../lib/api";

export const useChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState(() => {
    const cached = localStorage.getItem("conversations");
    return cached ? JSON.parse(cached) : [];
  });

  const fetchConversations = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserConversations();
      setConversations(data);
      localStorage.setItem("conversations", JSON.stringify(data));
    } catch (err) {
      setError(
        err?.response?.status === 429
          ? "Too many requests, please try again later."
          : err?.response?.data?.message || "Failed to fetch conversations."
      );
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { conversations, fetchConversations, loading, error };
};
