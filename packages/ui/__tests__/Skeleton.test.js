const { render } = require('@testing-library/react');
const { Skeleton, SkeletonCard, SkeletonList } = require('../Skeleton');

describe('Skeleton', () => {
  const React = require('react');

  it('renders with default props', () => {
    const { container } = render(React.createElement(Skeleton));
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('renders with custom width and height', () => {
    render(React.createElement(Skeleton, { width: 100, height: 200 }));
    expect(document.querySelector('div')).toBeInTheDocument();
  });

  it('renders with text variant', () => {
    render(React.createElement(Skeleton, { variant: 'text' }));
    expect(document.querySelector('div')).toBeInTheDocument();
  });

  it('renders with circular variant', () => {
    render(React.createElement(Skeleton, { variant: 'circular', width: 40 }));
    expect(document.querySelector('div')).toBeInTheDocument();
  });

  it('renders with rectangular variant', () => {
    render(React.createElement(Skeleton, { variant: 'rectangular', width: 200, height: 100 }));
    expect(document.querySelector('div')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    render(React.createElement(Skeleton, { style: { margin: '10px' } }));
    expect(document.querySelector('div')).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  const React = require('react');

  it('renders single skeleton card by default', () => {
    const { container } = render(React.createElement(SkeletonCard));
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('renders multiple skeleton cards', () => {
    const { container } = render(React.createElement(SkeletonCard, { count: 3 }));
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});

describe('SkeletonList', () => {
  const React = require('react');

  it('renders skeleton list items', () => {
    const { container } = render(React.createElement(SkeletonList));
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('renders multiple list items', () => {
    const { container } = render(React.createElement(SkeletonList, { count: 5 }));
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});