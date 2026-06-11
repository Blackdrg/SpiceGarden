const { render, screen } = require('@testing-library/react');
const { Card } = require('../Card');

describe('Card', () => {
  it('renders with children', () => {
    render(require('react').createElement(Card, null, 'Card content'));
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(require('react').createElement(Card, { title: 'Card Title' }, 'Card content'));
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders with elevated variant', () => {
    render(require('react').createElement(Card, { variant: 'elevated' }, 'Elevated content'));
    expect(screen.getByText('Elevated content')).toBeInTheDocument();
  });

  it('renders with list variant', () => {
    render(require('react').createElement(Card, { variant: 'list' }, 'List content'));
    expect(screen.getByText('List content')).toBeInTheDocument();
  });

  it('supports combined title and variant', () => {
    render(
      require('react').createElement(
        Card,
        { title: 'Title', variant: 'elevated' },
        require('react').createElement('span', null, 'Content')
      )
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(require('react').createElement(Card, null, require('react').createElement('span', null, 'No title content')));
    expect(screen.getByText('No title content')).toBeInTheDocument();
  });
});