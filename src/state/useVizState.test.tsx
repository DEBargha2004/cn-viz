import { test, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVizState } from "./useVizState";
import { useAppStore } from "./appStore";
import { ChapterStoreProvider } from "./chapterStore";
import React from "react";

const initialAppStoreState = useAppStore.getState();

afterEach(() => {
  useAppStore.setState(initialAppStoreState, true);
});

test("local scope: two hook instances do not share state", () => {
  const defaults = { value: 1 };
  
  const { result: hookA } = renderHook(() => useVizState("topic-1", "local", defaults));
  const { result: hookB } = renderHook(() => useVizState("topic-1", "local", defaults));

  expect(hookA.current[0].value).toBe(1);
  expect(hookB.current[0].value).toBe(1);

  act(() => {
    hookA.current[1]({ value: 42 });
  });

  expect(hookA.current[0].value).toBe(42);
  expect(hookB.current[0].value).toBe(1);
});

test("chapter scope: two independent providers keep state isolated", () => {
  const defaults = { value: 10 };
  
  const wrapperA = ({ children }: { children: React.ReactNode }) => (
    <ChapterStoreProvider>{children}</ChapterStoreProvider>
  );
  const wrapperB = ({ children }: { children: React.ReactNode }) => (
    <ChapterStoreProvider>{children}</ChapterStoreProvider>
  );

  const { result: hookA } = renderHook(() => useVizState("topic-1", "chapter", defaults), {
    wrapper: wrapperA,
  });
  const { result: hookB } = renderHook(() => useVizState("topic-1", "chapter", defaults), {
    wrapper: wrapperB,
  });

  expect(hookA.current[0].value).toBe(10);
  expect(hookB.current[0].value).toBe(10);

  act(() => {
    hookA.current[1]({ value: 99 });
  });

  expect(hookA.current[0].value).toBe(99);
  expect(hookB.current[0].value).toBe(10);
});

test("app scope: hook instances share app-scoped state", () => {
  const defaults = { speed: 1.0 };

  const { result: hookA } = renderHook(() => useVizState("topic-1", "app", defaults));
  const { result: hookB } = renderHook(() => useVizState("topic-1", "app", defaults));

  expect(hookA.current[0].speed).toBe(1.0);
  expect(hookB.current[0].speed).toBe(1.0);

  act(() => {
    hookA.current[1]({ speed: 2.5 });
  });

  expect(hookA.current[0].speed).toBe(2.5);
  expect(hookB.current[0].speed).toBe(2.5);
});
