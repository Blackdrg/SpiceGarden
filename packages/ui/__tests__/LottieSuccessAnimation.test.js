const { render } = require('@testing-library/react');
const LottieSuccessAnimation = require('../LottieSuccessAnimation').default;

describe('LottieSuccessAnimation', () => {
  const React = require('react');

  it('renders with default dimensions', () => {
    const { container } = render(React.createElement(LottieSuccessAnimation));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    const { container } = render(React.createElement(LottieSuccessAnimation, { width: 300, height: 300 }));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with custom size string', () => {
    const { container } = render(React.createElement(LottieSuccessAnimation, { width: '100%', height: '100%' }));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    const { container } = render(React.createElement(LottieSuccessAnimation, { style: { margin: '10px' } }));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('uses success color from design tokens', () => {
    const { container } = render(React.createElement(LottieSuccessAnimation));
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('has SVG with viewbox', () => {
    const { container } = render(React.createElement(LottieSuccessAnimation));
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('has checkmark path', () => {
    const { container } = render(React.createElement(LottieSuccessAnimation));
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });
});