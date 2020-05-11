import {
  ResizeObserver,
  ResizeObserverContructor,
  ResizeObserverCallback,
  ResizeObserverEntry,
  ResizeObserverObserveOptions,
} from "./ResizeObserverType";

export function createResizeObserverEntry(
  target: Element,
  contentRect: { width: number }
) {
  return { target, contentRect } as ResizeObserverEntry;
}

let mockInitialWidth = 600;

export function __setMockInitialWidth(width: number) {
  mockInitialWidth = width;
}

export const __instances: ResizeObserver[] = [];

export function __reset() {
  __instances.length = 0;
}

export const ResizeObserverMock: ResizeObserverContructor = class ResizeObserverMock implements ResizeObserver {
  private callback: ResizeObserverCallback;
  // "targets" array is public for testing
  public targets: any[];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    this.targets = [];
    __instances.push(this);
  }

  observe(target: Element, _options?: ResizeObserverObserveOptions) {
    this.targets.push(target);
    this.callback(
      [createResizeObserverEntry(target, { width: mockInitialWidth })],
      this as any
    );
  }

  unobserve(domNode: Element) {
    this.targets = this.targets.filter((n) => n !== domNode);
  }

  disconnect() {
    this.targets = [];
  }

  __setMockResizeEvent(resizeObserverEntries: ResizeObserverEntry[]) {
    this.callback(resizeObserverEntries, this);
  }
}

Object.defineProperty(
  window,
  "ResizeObserver",
  {
    writable: true,
    value: jest.fn().mockImplementation((callback) => new ResizeObserverMock(callback))
  },
);
