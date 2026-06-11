import { describe, it, expect, jest } from '@jest/globals'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

const EmptyState = ({ title, description, actionLabel, onAction }: { 
  title: string; 
  description?: string; 
  actionLabel?: string; 
  onAction?: () => void 
}) =>
  React.createElement('div', { role: 'status', 'aria-live': 'polite' }, [
    title,
    description && React.createElement('span', { key: 'desc' }, description),
    actionLabel && React.createElement('button', { key: 'btn', onClick: onAction }, actionLabel)
  ])

const NetworkError = ({ message, onRetry }: { message?: string; onRetry?: () => void }) =>
  React.createElement('div', { role: 'alert', 'aria-live': 'assertive' }, [
    'Connection Lost',
    onRetry && React.createElement('button', { key: 'retry', onClick: onRetry }, 'Try Again')
  ])

const LoadingState = ({ count, variant }: { count?: number; variant?: string }) => {
  if (variant === 'text') {
    return React.createElement('div', null, 
      Array.from({ length: count || 3 }).map((_, i) => 
        React.createElement('div', { key: i, style: { height: '16px' } })
      )
    )
  }
  return React.createElement('div', null, 'Loading...')
}

describe('EmptyState Component', () => {
  it('renders with title', () => {
    render(React.createElement(EmptyState, { title: 'No items found' }))
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(React.createElement(EmptyState, { title: 'Empty', description: 'No data' }))
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const mockAction = jest.fn()
    render(React.createElement(EmptyState, { title: 'Empty', actionLabel: 'Retry', onAction: mockAction }))
    const button = screen.getByRole('button', { name: /retry/i })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(mockAction).toHaveBeenCalled()
  })

  it('has accessible status role', () => {
    render(React.createElement(EmptyState, { title: 'Status' }))
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})

describe('NetworkError Component', () => {
  it('renders connection lost message', () => {
    render(React.createElement(NetworkError, { onRetry: jest.fn() }))
    expect(screen.getByText(/Connection Lost/i)).toBeInTheDocument()
  })

  it('has retry button', () => {
    const mockRetry = jest.fn()
    render(React.createElement(NetworkError, { onRetry: mockRetry }))
    const button = screen.getByRole('button', { name: /try again/i })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(mockRetry).toHaveBeenCalled()
  })

  it('has accessible alert role', () => {
    render(React.createElement(NetworkError, { onRetry: jest.fn() }))
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })
})

describe('LoadingState Component', () => {
  it('renders card variant by default', () => {
    render(React.createElement(LoadingState, { count: 2 }))
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders text variant', () => {
    render(React.createElement(LoadingState, { variant: 'text', count: 3 }))
    const elements = document.querySelectorAll('[style*="height: 16px"]')
    expect(elements.length).toBe(3)
  })
})