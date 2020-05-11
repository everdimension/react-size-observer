import './jest.setup';
import { act } from 'react-dom/test-utils';
import {
  __setMockInitialWidth,
  __instances,
  __reset,
  createResizeObserverEntry,
} from "./__mocks__/ResizeObserverMock";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { useSizeObserver } from "../src";

const { useRef } = React;

function last(a: any[]) {
  return a[a.length - 1];
}

function TestComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useSizeObserver({ ref });
  return (
    <div ref={ref}>
      <span>{width < 500 ? "smaller!" : "larger!"}</span>
      <span>{String(width)}</span>
    </div>
  );
}

beforeEach(() => {
  __reset();
  __setMockInitialWidth(499);
});

describe("useSizeObserver hook", () => {
  test("Renders", () => {
    render(<TestComponent />);
    expect(screen.getByText(/smaller/)).toBeInTheDocument();
  });

  test("renders based on available width [large]", () => {
    __setMockInitialWidth(501);
    render(<TestComponent />);
    expect(screen.queryByText(/smaller/)).toBeNull();
    expect(screen.getByText(/larger/)).toBeInTheDocument();
  });

  test("renders based on available width [small]", () => {
    __setMockInitialWidth(499);
    render(<TestComponent />);
    expect(screen.getByText(/smaller/)).toBeInTheDocument();
    expect(screen.queryByText(/larger/)).toBeNull();
  });

  test("re-renders when width changes", (done) => {
    __setMockInitialWidth(499);
    render(<TestComponent />);
    expect(screen.getByText(/smaller/)).toBeInTheDocument();
    expect(screen.queryByText(/larger/)).toBeNull();

    setTimeout(() => {
      // simulate async interaction by invoking resize event
      // in a setTimeout
      const resizeObserverInstance = last(__instances);
      const target = last(resizeObserverInstance.targets);
      console.log('last target', !!target, __instances);
      act(() => {
        resizeObserverInstance.__setMockResizeEvent(
          [createResizeObserverEntry(target, { width: 501 })],
        );
      });
      expect(screen.queryByText(/smaller/)).toBeNull();
      expect(screen.getByText(/larger/)).toBeInTheDocument();
      done();
    });
  });

  test("Re-renders expected amount of times", (done) => {
    __setMockInitialWidth(499);

    function RenderSpy({ onRender }: { onRender: Function }) {
      onRender();
      const ref = useRef<HTMLDivElement>(null);
      const { width } = useSizeObserver({ ref });
      return (
        <div ref={ref}>
          <span>{width < 500 ? "smaller!" : "larger!"}</span>
          <span>{String(width)}</span>
        </div>
      );
    }

    const mockOnRender = jest.fn();

    console.log('rendering <RenderSpy />')
    render(<RenderSpy onRender={mockOnRender} />);

    expect(mockOnRender.mock.calls.length).toBe(2);

    const resizeObserverInstance = last(__instances);
    const target = last(resizeObserverInstance.targets);
    act(() => {
      resizeObserverInstance.__setMockResizeEvent(
        [createResizeObserverEntry(target, { width: 501 })],
      );
    });
    expect(mockOnRender.mock.calls.length).toBe(3);
    done();

  });
});
