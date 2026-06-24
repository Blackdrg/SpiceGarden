export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'pickedup' | 'delivered' | 'cancelled' | 'delayed' | 'completed' | 'placed' | 'confirmed' | 'received';
export type ServiceType = 'dine-in' | 'dine_in' | 'takeaway' | 'delivery';

export type LiveOrder = {
  id: string;
  amount: number;
  branch: string;
  eta: number;
  status: OrderStatus;
  serviceType?: ServiceType;
  timestamp?: number;
  createdAt?: string;
};

export type BranchStatus = {
  name: string;
  status: 'operational' | 'delayed' | 'critical';
  orderCount: number;
  avgPrepMins: number;
  driversAssigned: number;
};

export type DisputeTicket = {
  id: string;
  type: 'refund' | 'support' | 'fraud';
  user: string;
  amount?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  createdAt: string;
};

export type HeatmapPoint = {
  x: number;
  y: number;
  intensity: number;
  label: string;
};

export type Stats = {
  revenue: number;
  orders: number;
  driversOnline: number;
  complaints: number;
  refunds: number;
  fraudAlerts: number;
  activeBranches: number;
  pendingWithdrawals: number;
};

export type AdminTab = 'overview' | 'orders' | 'branches' | 'support';
export type TicketFilter = 'all' | DisputeTicket['type'];

export type AdminDashboardState = {
  stats: Stats;
  liveOrders: LiveOrder[];
  branches: BranchStatus[];
  tickets: DisputeTicket[];
  revenueData: Record<string, unknown>[];
  heatmapData: HeatmapPoint[];
  selectedTab: AdminTab;
  ticketFilter: TicketFilter;
  clientNow: number;
};

export type AdminDashboardAction =
  | { type: 'client-tick' }
  | { type: 'stats-loaded'; payload: { stats?: Stats; revenueData?: Record<string, unknown>[]; branches?: BranchStatus[]; tickets?: DisputeTicket[] } }
  | { type: 'orders-loaded'; orders: (LiveOrder & { createdAt?: string })[] }
  | { type: 'stats-updated'; stats: Partial<Stats> }
  | { type: 'new-order-global'; order: LiveOrder }
  | { type: 'branches-updated'; branches: BranchStatus[] }
  | { type: 'heatmap-updated'; data: HeatmapPoint[] }
  | { type: 'revenue-updated'; data: Record<string, unknown>[] }
  | { type: 'tab-selected'; tab: AdminTab }
  | { type: 'ticket-filter-selected'; filter: TicketFilter }
  | { type: 'ticket-closed'; id: string }
  | { type: 'refund-approved'; id: string };

export function initialAdminDashboardState(): AdminDashboardState {
  return {
    stats: {
      revenue: 45200,
      orders: 124,
      driversOnline: 18,
      complaints: 3,
      refunds: 12,
      fraudAlerts: 3,
      activeBranches: 3,
      pendingWithdrawals: 8,
    },
    liveOrders: [],
    branches: [],
    tickets: [],
    revenueData: [],
    heatmapData: [],
    selectedTab: 'overview',
    ticketFilter: 'all',
    clientNow: Date.now(),
  };
}

export function adminDashboardReducer(state: AdminDashboardState, action: AdminDashboardAction): AdminDashboardState {
  switch (action.type) {
    case 'client-tick':
      return { ...state, clientNow: Date.now() };
    case 'stats-loaded':
      return {
        ...state,
        stats: action.payload.stats ? { ...state.stats, ...action.payload.stats } : state.stats,
        revenueData: action.payload.revenueData || state.revenueData,
        branches: action.payload.branches || state.branches,
        tickets: action.payload.tickets || state.tickets,
      };
    case 'orders-loaded':
      return { ...state, liveOrders: normalizeOrders(action.orders) };
    case 'stats-updated':
      return { ...state, stats: { ...state.stats, ...action.stats } };
    case 'new-order-global':
      return { ...state, liveOrders: [{ ...action.order, timestamp: Date.now() }, ...state.liveOrders].slice(0, 20) };
    case 'branches-updated':
      return { ...state, branches: action.branches };
    case 'heatmap-updated':
      return { ...state, heatmapData: action.data };
    case 'revenue-updated':
      return { ...state, revenueData: action.data };
    case 'tab-selected':
      return { ...state, selectedTab: action.tab };
    case 'ticket-filter-selected':
      return { ...state, ticketFilter: action.filter };
    case 'ticket-closed':
      return { ...state, tickets: state.tickets.filter((ticket) => ticket.id !== action.id) };
    case 'refund-approved':
      return {
        ...state,
        stats: { ...state.stats, refunds: state.stats.refunds + 1 },
        tickets: state.tickets.filter((ticket) => ticket.id !== action.id),
      };
    default:
      return state;
  }
}

function normalizeOrders(orders: (LiveOrder & { createdAt?: string })[]): LiveOrder[] {
  return orders.map((order) => ({ ...order, timestamp: new Date(order.createdAt || Date.now()).getTime() }));
}
