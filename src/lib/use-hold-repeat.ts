import { useCallback, useRef, type PointerEvent } from "react";

export function useHoldRepeat(action: (step: number) => void) {
  const actionRef = useRef(action);
  actionRef.current = action;
  const timers = useRef<{ delay?: number; interval?: number; count: number }>({ count: 0 });
  const fromPointer = useRef(false);

  const stop = useCallback(() => {
    if (timers.current.delay) window.clearTimeout(timers.current.delay);
    if (timers.current.interval) window.clearInterval(timers.current.interval);
    timers.current = { count: 0 };
  }, []);

  const startHold = useCallback(() => {
    timers.current.delay = window.setTimeout(() => {
      timers.current.interval = window.setInterval(() => {
        timers.current.count += 1;
        actionRef.current(timers.current.count > 16 ? 5 : 1);
      }, 55);
    }, 380);
  }, []);

  return {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      fromPointer.current = true;
      stop();
      actionRef.current(1);
      startHold();
    },
    onClick: () => {
      if (fromPointer.current) {
        fromPointer.current = false;
        return;
      }
      actionRef.current(1);
    },
    onPointerUp: () => {
      stop();
    },
    onPointerCancel: () => {
      stop();
      fromPointer.current = false;
    },
    onLostPointerCapture: () => {
      stop();
      fromPointer.current = false;
    },
    onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === "mouse") stop();
    },
  };
}
