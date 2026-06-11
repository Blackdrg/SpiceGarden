import { render, screen } from '@testing-library/react'
import AdminDashboard from '../src/pages/index'

describe('AdminDashboard', () => {
  it('renders the dashboard header', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('SpiceGarden')).toBeInTheDocument()
  })

  it('displays revenue card', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Revenue Today')).toBeInTheDocument()
  })

  it('displays navigation tabs', () => {
    render(<AdminDashboard />)
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Live Orders/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Kitchen Monitor/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Support/ })).toBeInTheDocument()
  })
})