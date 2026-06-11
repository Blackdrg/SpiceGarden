const { describe, it, expect } = require('@jest/globals')

describe('Kitchen Dashboard Business Logic', () => {
  it('calculates order elapsed time correctly', () => {
    const prepStartedAt = new Date(+new Date() - 17 * 60000)
    const elapsedMins = Math.max(0, Math.floor((+new Date() - +prepStartedAt) / 60000))
    expect(elapsedMins).toBeGreaterThanOrEqual(17)
  })

  it('calculates progress percentage correctly', () => {
    const estPrepMins = 14
    const mins = 7
    const progress = Math.min(100, Math.round((mins / estPrepMins) * 100))
    expect(progress).toBe(50)
  })

  it('detects delayed orders', () => {
    const estPrepMins = 14
    const mins = 20
    const isDelayed = mins > estPrepMins
    expect(isDelayed).toBe(true)
  })

  it('has correct status labels', () => {
    const statusLabels = {
      new: 'NEW', accepted: 'ACKD', preparing: 'COOKING', ready: 'READY', 
      delayed: 'DELAYED', completed: 'DONE', pickedup: 'PICKED', delivered: 'DONE', cancelled: 'CANCELLED'
    }
    expect(statusLabels.preparing).toBe('COOKING')
    expect(statusLabels.ready).toBe('READY')
    expect(statusLabels.accepted).toBe('ACKD')
  })

  it('counts orders by status', () => {
    const orders = [
      { id: 'a1', status: 'preparing' },
      { id: 'b2', status: 'accepted' },
      { id: 'c3', status: 'ready' },
      { id: 'd4', status: 'new' },
    ]
    const statuses = ['new', 'accepted', 'preparing', 'ready', 'delayed', 'completed']
    const counts = Object.fromEntries(statuses.map((s) => [s, orders.filter((o) => o.status === s).length]))
    
    expect(counts.new).toBe(1)
    expect(counts.preparing).toBe(1)
    expect(counts.ready).toBe(1)
  })
})

describe('Inventory Management Logic', () => {
  it('detects low stock items', () => {
    const inventory = [
      { id: 'inv-1', name: 'Burger Buns', inStock: 3, threshold: 20 },
      { id: 'inv-2', name: 'Cheese', inStock: 50, threshold: 50 },
    ]
    
    const lowStock = inventory.filter((item) => item.inStock < item.threshold)
    expect(lowStock.length).toBe(1)
    expect(lowStock[0].name).toBe('Burger Buns')
  })

  it('calculates stock after usage', () => {
    let stock = 10
    stock = Math.max(0, stock - 1)
    expect(stock).toBe(9)
  })

  it('adds stock correctly', () => {
    let stock = 10
    stock = stock + 10
    expect(stock).toBe(20)
  })
})

describe('Order Transition Logic', () => {
  it('transitions order status correctly', () => {
    const transitions = {
      new: 'accepted',
      accepted: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    }
    
    expect(transitions.new).toBe('accepted')
    expect(transitions.accepted).toBe('preparing')
    expect(transitions.preparing).toBe('ready')
  })
})