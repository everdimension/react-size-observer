import { useLayoutEffect, useState, useRef, useEffect } from 'react';

const isSupported = 'ResizeObserver' in window;

// TODO:
// remove this type when ResizeObserver is added to typescript declarations:
// https://github.com/microsoft/TypeScript/issues/37861
type ResizeObserverTemporaryType = any;

type Unsub = () => void;

function useLayoutEffectOnRefChange(
  ref: React.RefObject<any>,
  cb: () => Unsub | undefined,
) {
  const refValueRef = useRef(ref.current);
  const unsubRef = useRef<Unsub | undefined>();

  const callbackRef = useRef(cb);
  useEffect(() => {
    callbackRef.current = cb;
  }, [cb]);

  useLayoutEffect(() => {
    if (refValueRef.current === ref.current) {
      console.log('early return..');
      return;
    }
    if (unsubRef.current != null) {
      unsubRef.current();
    }
    refValueRef.current = ref.current;
    unsubRef.current = callbackRef.current();
  });
}

// interface Props<T> {
//   render: (options: { ref: React.Ref<T>; width: number }) => React.ReactNode;
// }
interface Props<T> {
  ref: React.RefObject<T>;
}

export function useSizeObserver<T>({ ref }: Props<T>) {
  const [width, setWidth] = useState(0);
  // const elementRef = useRef<T>(null);

  /**
   * Lazily initialize observer
   * https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
   */
  const observerRef = useRef(null);

  function getObserver(): ResizeObserverTemporaryType {
    if (observerRef.current === null) {
      // @ts-ignore
      observerRef.current = new ResizeObserver((entries: any[]) => {
        console.log('observer callback', entries.length);
        for (const entry of entries) {
          if (entry.target !== ref.current) {
            console.log('wrong target');
            continue;
          }
          if (!entry.contentRect) {
            console.log('no content rect...');
            /**
             * contentRect may be deprecated in the future:
             * https://drafts.csswg.org/resize-observer-1/#resize-observer-entry-interface
             */
            return;
          }
          const { width } = entry.contentRect;
          console.log(`setWidth(${width})`);
          setWidth(width);
          break;
        }
      });
    }
    return observerRef.current;
  }

  useLayoutEffectOnRefChange(ref, () => {
    if (!isSupported || !ref.current) {
      return;
    }

    const node = ref.current;
    getObserver().observe(node);
    return () => {
      console.log('unobserving?...');
      getObserver().unobserve(node);
    };
  });

  return {
    width,
    isSupported,
  };
}
