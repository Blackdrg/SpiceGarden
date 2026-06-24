const React = require('react');

const SafeAreaProvider = ({ children }) => React.createElement(React.Fragment, null, children);
const SafeAreaConsumer = ({ children }) => React.createElement(React.Fragment, null, children({ insets: { top: 0, right: 0, bottom: 0, left: 0 } }));
const SafeAreaInsetsContext = React.createContext({ top: 0, right: 0, bottom: 0, left: 0 });

module.exports = {
  SafeAreaProvider,
  SafeAreaConsumer,
  SafeAreaInsetsContext,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
};
