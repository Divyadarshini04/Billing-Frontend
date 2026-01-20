declare global {
  namespace JSX {
    interface Element {}
    interface ElementClass {}
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export {}
