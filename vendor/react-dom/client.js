import { __prepareRender, __setRerender } from 'react';
import { Fragment } from 'react/jsx-runtime';

let rootContainer = null;
let rootNode = null;

export function createRoot(container) {
  rootContainer = container;
  return {
    render(node) {
      rootNode = node;
      __setRerender(() => renderRoot());
      renderRoot();
    },
  };
}

function renderRoot() {
  if (!rootContainer) return;
  __prepareRender();
  rootContainer.replaceChildren(toDom(rootNode));
}

function toDom(node) {
  if (node === null || node === undefined || node === false || node === true) return document.createTextNode('');
  if (typeof node === 'string' || typeof node === 'number') return document.createTextNode(String(node));
  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment();
    node.forEach((child) => fragment.appendChild(toDom(child)));
    return fragment;
  }
  if (typeof node.type === 'function') return toDom(node.type(node.props || {}));
  if (node.type === Fragment) return toDom(node.props?.children ?? []);

  const element = document.createElement(node.type);
  const props = node.props || {};
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'children' || value === undefined || value === null || value === false) return;
    if (key === 'className') {
      element.setAttribute('class', String(value));
      return;
    }
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
      return;
    }
    if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
      return;
    }
    if (typeof value === 'boolean') {
      if (value) element.setAttribute(key, '');
      return;
    }
    element.setAttribute(key, String(value));
  });
  toChildArray(props.children).forEach((child) => element.appendChild(toDom(child)));
  return element;
}

function toChildArray(children) {
  if (children === undefined || children === null) return [];
  return Array.isArray(children) ? children.flat(Infinity) : [children];
}
