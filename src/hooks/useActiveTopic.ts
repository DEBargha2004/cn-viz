import { useState, useEffect, useCallback, useRef } from "react";
import { scroller } from "react-scroll";
import { type Topic } from "../lib/content";

interface UseActiveTopicResult {
  activeTopicId: string;
  scrollToTopic: (id: string) => void;
  activeIndex: number;
  progressPercentage: number;
}

export function useActiveTopic(topics: Topic[]): UseActiveTopicResult {
  const [activeTopicId, setActiveTopicId] = useState<string>(
    () => topics[0]?.id || ""
  );
  const isManualScrollingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial state when topics change
  useEffect(() => {
    if (topics.length > 0 && !topics.some((t) => t.id === activeTopicId)) {
      setActiveTopicId(topics[0].id);
    }
  }, [topics, activeTopicId]);

  // Target-based element scrolling via react-scroll library
  const scrollToTopic = useCallback((topicId: string) => {
    setActiveTopicId(topicId);
    isManualScrollingRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 700);

    const isMobile = window.innerWidth < 768;
    const targetOffset = isMobile ? -80 : -24;

    scroller.scrollTo(`topic-${topicId}`, {
      duration: 500,
      delay: 0,
      smooth: "easeInOutCubic",
      offset: targetOffset,
    });
  }, []);

  // IntersectionObserver scrollspy for reactive highlight tracking
  useEffect(() => {
    if (typeof window === "undefined" || topics.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrollingRef.current) return;

        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio
          );
          const topEntry = visibleEntries[0];
          const id = topEntry.target.id.replace("topic-", "");
          setActiveTopicId((prev) => (prev !== id ? id : prev));
        }
      },
      {
        rootMargin: "-15% 0px -40% 0px",
        threshold: [0.1, 0.4, 0.7],
      }
    );

    topics.forEach((topic) => {
      const el = document.getElementById(`topic-${topic.id}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [topics]);

  const activeIndex = Math.max(
    0,
    topics.findIndex((t) => t.id === activeTopicId)
  );

  const progressPercentage =
    topics.length > 0
      ? Math.round(((activeIndex + 1) / topics.length) * 100)
      : 0;

  return {
    activeTopicId,
    scrollToTopic,
    activeIndex,
    progressPercentage,
  };
}
