let states = [];
let cursor = 0;
let rerender = () => {};

export function __prepareRender() {
  cursor = 0;
}

export function __setRerender(fn) {
  rerender = fn;
}

export function useState(initialValue) {
  const stateIndex = cursor++;
  if (states[stateIndex] === undefined) {
    states[stateIndex] = typeof initialValue === 'function' ? initialValue() : initialValue;
  }
  const setState = (nextValue) => {
    states[stateIndex] = typeof nextValue === 'function' ? nextValue(states[stateIndex]) : nextValue;
    rerender();
  };
  return [states[stateIndex], setState];
}

export function useMemo(factory) {
  return factory();
}

export function StrictMode({ children }) {
  return children;
}

export function createElement(type, props, ...children) {
  return { type, props: { ...(props || {}), children } };
}

export default { createElement, StrictMode, useMemo, useState };
