import { useState, useEffect, type RefObject } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  enabled?: boolean;
  freezeOnceVisible?: boolean;
}

/**
 * React hook that tracks element visibility in viewport using IntersectionObserver.
 * Defaults to 300px rootMargin so visualizations pre-load smoothly before coming into view.
 * Defaults to true in non-browser/unsupported environments (SSR/jsdom/Vitest).
 */
export function useIntersectionObserver(
  targetRef: RefObject<Element | null>,
  options: UseIntersectionObserverOptions = {}
): boolean {
  const {
    root = null,
    rootMargin = "300px 0px",
    threshold = 0,
    enabled = true,
    freezeOnceVisible = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState<boolean>(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (!enabled) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsIntersecting(true);
      return;
    }

    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (freezeOnceVisible) {
            observer.unobserve(element);
          }
        } else if (!freezeOnceVisible) {
          setIsIntersecting(false);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, root, rootMargin, threshold, enabled, freezeOnceVisible]);

  return isIntersecting;
}
