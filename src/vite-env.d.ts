declare module 'react' {
  export type ReactNode = unknown;
  export type CSSProperties = Record<string, string | number>;
  export interface ButtonHTMLAttributes<T> {
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    [key: string]: unknown;
  }
  export const StrictMode: ({ children }: { children?: ReactNode }) => unknown;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((current: T) => T)) => void];
}

declare module 'react-dom/client' {
  export function createRoot(container: Element): { render(children: unknown): void };
}

declare module 'react/jsx-runtime' {
  export const Fragment: unknown;
  export function jsx(type: unknown, props: unknown, key?: unknown): unknown;
  export function jsxs(type: unknown, props: unknown, key?: unknown): unknown;
}

declare module '*.css' {}

declare namespace JSX {
  interface IntrinsicAttributes {
    key?: string | number;
  }
  interface IntrinsicElements {
    [elemName: string]: {
      className?: string;
      children?: import('react').ReactNode;
      style?: import('react').CSSProperties;
      onClick?: () => void;
      disabled?: boolean;
      key?: string | number;
      [key: string]: unknown;
    };
  }
}
