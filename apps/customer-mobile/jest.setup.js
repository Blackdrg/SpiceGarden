const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('react-test-renderer is deprecated')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  SafeAreaView: 'SafeAreaView',
  Image: 'Image',
  ActivityIndicator: 'ActivityIndicator',
  Animated: {
    Value: jest.fn((value) => ({ value, interpolate: jest.fn(() => ({ interpolate: jest.fn() })), stopAnimation: jest.fn() })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn() })),
    delay: jest.fn(() => 'delay'),
    createAnimatedComponent: (component) => component,
    View: 'Animated.View',
  },
  Easing: {
    linear: jest.fn(() => 'linear'),
    ease: jest.fn(() => 'ease'),
    quad: jest.fn(() => 'quad'),
    cubic: jest.fn(() => 'cubic'),
    poly: jest.fn(() => 'poly'),
    sin: jest.fn(() => 'sin'),
    circle: jest.fn(() => 'circle'),
    exp: jest.fn(() => 'exp'),
    elastic: jest.fn(() => 'elastic'),
    bounce: jest.fn(() => 'bounce'),
    back: jest.fn(() => 'back'),
    in: jest.fn(() => 'in'),
    out: jest.fn(() => 'out'),
    inOut: jest.fn(() => 'inOut'),
  },

  FlatList: ({ data, renderItem, keyExtractor }) => {
    const React = require('react');
    return React.createElement(
    React.Fragment,
    null,
    ...data.map((item, index) => React.createElement(
      React.Fragment,
      { key: keyExtractor ? keyExtractor(item, index) : index },
      renderItem({ item, index }),
    )),
  );
  },
  Modal: 'Modal',
  Switch: 'Switch',
  StatusBar: 'StatusBar',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  },
  RefreshControl: 'RefreshControl',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  TouchableHighlight: 'TouchableHighlight',
  Alert: { alert: jest.fn() },
  Linking: { openURL: jest.fn() },
  Dimensions: { get: jest.fn(() => ({ width: 390, height: 844, scale: 1, fontScale: 1 })) },
  PixelRatio: { get: jest.fn(() => 1) },
  Appearance: { getColorScheme: jest.fn(() => 'light') },
  I18nManager: {
    isRTL: false,
    getConstants: jest.fn(() => ({ isRTL: false })),
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style || {},
    hairlineWidth: 1,
    select: (styles) => styles?.default || styles,
  },
  Platform: {
    OS: 'ios',
    select: (specs) => specs?.default || specs?.ios || specs?.android,
  },
}));

global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModuleConfig: [],
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ access_token: 'test-token' }),
  }),
);

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

global.document = {
  title: '',
  head: { appendChild: jest.fn() },
  getElementById: () => null,
  createElement: () => ({ id: '', textContent: '', style: {} }),
};

global.location = { hash: '' };
global.window = {
  history: {
    state: null,
    pushState: jest.fn(),
    replaceState: jest.fn(),
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setTimeout,
  clearTimeout,
};

global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const Navigator = ({ children }) => {
    const childArray = Array.isArray(children) ? children : [children];
    const firstChild = childArray[0];
    if (firstChild && firstChild.props && firstChild.props.component) {
      return React.createElement(firstChild.props.component, firstChild.props);
    }
    return React.createElement(React.Fragment, null, children);
  };
  const Screen = () => null;
  return {
    useNavigation: () => ({ replace: jest.fn(), navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
    NavigationContainer: ({ children }) => children,
    createNavigatorFactory: () => ({ Navigator, Screen }),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const Navigator = ({ children }) => {
    const childArray = Array.isArray(children) ? children : [children];
    const firstChild = childArray[0];
    if (firstChild && firstChild.props && firstChild.props.component) {
      return React.createElement(firstChild.props.component, firstChild.props);
    }
    return React.createElement(React.Fragment, null, children);
  };
  const Screen = () => null;
  return {
    createNativeStackNavigator: () => ({ Navigator, Screen }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  const Navigator = ({ children }) => {
    const childArray = Array.isArray(children) ? children : [children];
    const firstChild = childArray[0];
    if (firstChild && firstChild.props && firstChild.props.component) {
      return React.createElement(firstChild.props.component, firstChild.props);
    }
    return React.createElement(React.Fragment, null, children);
  };
  const Screen = () => null;
  return {
    createBottomTabNavigator: () => ({ Navigator, Screen }),
  };
});

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const Navigator = ({ children }) => {
    const childArray = Array.isArray(children) ? children : [children];
    const firstChild = childArray[0];
    if (firstChild && firstChild.props && firstChild.props.component) {
      return React.createElement(firstChild.props.component, firstChild.props);
    }
    return React.createElement(React.Fragment, null, children);
  };
  const Screen = () => null;
  return {
    createStackNavigator: () => ({ Navigator, Screen }),
  };
});
