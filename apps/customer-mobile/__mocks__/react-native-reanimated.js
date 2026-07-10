module.exports = {
  __esModule: true,
  default: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    Value: function AnimatedValue(initial) {
      this._value = initial;
      this._listeners = [];
    },
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn() })),
    delay: jest.fn(() => ({ start: jest.fn() })),
    createAnimatedComponent: (component) => component,
  },
  useSharedValue: jest.fn((initial) => ({ value: initial })),
  withTiming: jest.fn((toValue, config) => ({ toValue, config })),
  withSequence: jest.fn((...args) => ({ type: 'sequence', args })),
  withSpring: jest.fn((toValue, config) => ({ toValue, config })),
  withDecay: jest.fn((config) => ({ config })),
  useAnimatedStyle: jest.fn(() => ({})),
  useAnimatedGestureHandler: jest.fn(() => ({})),
  useAnimatedScrollHandler: jest.fn(() => ({})),
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn),
  interpolate: jest.fn((value, input, output) => output[0]),
};
