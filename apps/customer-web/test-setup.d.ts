import matchers from '@types/testing-library__jest-dom'

declare global {
  namespace jest {
    interface Matchers<R = void, T = {}> extends matchers<string, R> {}
  }
}

export {}
