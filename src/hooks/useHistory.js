import { useState } from 'react';

const MAX_HISTORY = 20;

export function useHistory() {
  const [history, setHistory] = useState([]);

  function addEntry({ grade, topic, mode, context }, content) {
    const entry = {
      id: crypto.randomUUID(),
      grade,
      topic,
      mode,
      context,
      content,
      tags: [],
      timestamp: Date.now(),
      pinned: false,
    };
    setHistory((prev) => {
      const next = [entry, ...prev];
      if (next.length > MAX_HISTORY) {
        // Remove oldest unpinned
        const lastUnpinnedIdx = [...next].reverse().findIndex((h) => !h.pinned);
        if (lastUnpinnedIdx !== -1) next.splice(next.length - 1 - lastUnpinnedIdx, 1);
      }
      return next;
    });
    return entry.id;
  }

  function removeEntry(id) {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }

  function clearHistory() {
    setHistory([]);
  }

  function addTag(id, tag) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setHistory((prev) =>
      prev.map((h) =>
        h.id === id && !h.tags.includes(trimmed)
          ? { ...h, tags: [...h.tags, trimmed] }
          : h
      )
    );
  }

  function removeTag(id, tag) {
    setHistory((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, tags: h.tags.filter((t) => t !== tag) } : h
      )
    );
  }

  function togglePin(id) {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h))
    );
  }

  function searchHistory(query) {
    if (!query.trim()) return history;
    const q = query.toLowerCase();
    return history.filter(
      (h) =>
        h.topic.toLowerCase().includes(q) ||
        h.content.toLowerCase().includes(q) ||
        h.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sorted: pinned first, then newest
  const sorted = [
    ...history.filter((h) => h.pinned),
    ...history.filter((h) => !h.pinned),
  ];

  return {
    history: sorted,
    rawHistory: history,
    addEntry,
    removeEntry,
    clearHistory,
    addTag,
    removeTag,
    togglePin,
    searchHistory,
  };
}
