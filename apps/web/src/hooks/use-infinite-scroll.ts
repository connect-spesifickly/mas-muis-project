"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  rootMargin?: string; // Intersection observer root margin
  enabled?: boolean; // Enable/disable infinite scroll
}

interface UseInfiniteScrollReturn {
  loadMoreRef: React.RefObject<HTMLDivElement>;
  isNearBottom: boolean;
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  isLoading: boolean,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const { threshold = 100, rootMargin = "0px", enabled = true } = options;

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry?.isIntersecting) {
        setIsNearBottom(true);

        if (enabled && hasMore && !isLoading) {
          onLoadMore();
        }
      } else {
        setIsNearBottom(false);
      }
    },
    [enabled, hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, rootMargin, enabled]);

  // Alternative scroll-based detection as fallback
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      const isNear = scrollTop + clientHeight >= scrollHeight - threshold;
      setIsNearBottom(isNear);

      if (isNear && hasMore && !isLoading) {
        onLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, hasMore, isLoading, onLoadMore, threshold]);

  return {
    loadMoreRef,
    isNearBottom,
  };
}
