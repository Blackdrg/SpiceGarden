import React, { useReducer } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { Plus, CreditCard, Trash2, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@spicegarden/shared/constants';
import styles from './payment-methods.module.css';
import ProtectedRoute from '../components/ProtectedRoute';

interface PaymentMethod {
  id: string;
  type: string;
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  upiId?: string;
  isDefault: boolean;
}

const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const res = await fetch(`${API_URL}/payment-methods`, {
    headers: {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load payment methods');
  return res.json();
};

const addPaymentMethod = async (method: { type: string; cardLast4: string; cardBrand: string; cardExpiry: string; upiId: string }): Promise<PaymentMethod> => {
  const res = await fetch(`${API_URL}/payment-methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(method),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to add payment method');
  return res.json();
};

const setDefaultPaymentMethod = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/payment-methods/${id}/default`, {
    method: 'PUT',
    headers: {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to set default');
};

const deletePaymentMethod = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/payment-methods/${id}`, {
    method: 'DELETE',
    headers: {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete');
};

interface PaymentMethodsState {
  error: string | null;
  showAddForm: boolean;
  newMethod: {
    type: string;
    cardLast4: string;
    cardBrand: string;
    cardExpiry: string;
    upiId: string;
  };
}

const initialPaymentMethodsState: PaymentMethodsState = {
  error: null,
  showAddForm: false,
  newMethod: { type: 'card', cardLast4: '', cardBrand: '', cardExpiry: '', upiId: '' },
};

function paymentMethodsReducer(state: PaymentMethodsState, action: { type: string; payload?: unknown }): PaymentMethodsState {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload as string | null };
    case 'SET_SHOW_ADD_FORM':
      return { ...state, showAddForm: action.payload as boolean };
    case 'SET_NEW_METHOD':
      return { ...state, newMethod: action.payload as { type: string; cardLast4: string; cardBrand: string; cardExpiry: string; upiId: string } };
    default:
      return state;
  }
}

const PaymentMethodsPage = () => {
  const queryClient = useQueryClient();
  const [uiState, dispatch] = useReducer(paymentMethodsReducer, initialPaymentMethodsState);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
  });

  const addMutation = useMutation({
    mutationFn: (method: { type: string; cardLast4: string; cardBrand: string; cardExpiry: string; upiId: string }) => addPaymentMethod(method),
    onSuccess: (added) => {
      queryClient.setQueryData<PaymentMethod[]>(['payment-methods'], prev => [...(prev || []), added]);
    },
    onError: (err: Error) => dispatch({ type: 'SET_ERROR', payload: err.message }),
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultPaymentMethod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
    onError: (err: Error) => dispatch({ type: 'SET_ERROR', payload: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
    onError: (err: Error) => dispatch({ type: 'SET_ERROR', payload: err.message }),
  });

  const handleAddMethod = async () => {
    addMutation.mutate(uiState.newMethod);
    dispatch({ type: 'SET_SHOW_ADD_FORM', payload: false });
    dispatch({ type: 'SET_NEW_METHOD', payload: { type: 'card', cardLast4: '', cardBrand: '', cardExpiry: '', upiId: '' } });
  };

  const handleSetDefault = async (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const handleDelete = async (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <p>Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {uiState.error && (
        <div className={styles.errorBanner}>
          <span>{uiState.error}</span>
        </div>
      )}

      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Payment Methods</h2>
        <button type="button" onClick={() => dispatch({ type: 'SET_SHOW_ADD_FORM', payload: true })} aria-label="Add payment method">
          <Plus size={24} />
        </button>
      </div>

      {data.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No payment methods saved yet. Add one to get started!</p>
        </div>
      ) : (
        data.map(method => (
          <Card key={method.id} title={method.type === 'card' ? `${method.cardBrand || 'Card'} •••• ${method.cardLast4 || '****'}` : `UPI • ${method.upiId || '****'}`}>
            <div className={styles.cardContent}>
              <div>
                {method.type === 'card' && method.cardExpiry && (
                  <p className={styles.expiryText}>Expires {method.cardExpiry}</p>
                )}
                {method.isDefault && (
                  <span className={styles.defaultBadge}>
                    <Star size={12} fill={DESIGN_TOKENS.colors.primary} /> Default
                  </span>
                )}
              </div>
              <div className={styles.actionsContainer}>
                {!method.isDefault && (
                  <button type="button" onClick={() => handleSetDefault(method.id)} aria-label="Set as default">
                    <Star size={16} />
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(method.id)} aria-label="Delete" className={styles.deleteButton}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {uiState.showAddForm && (
        <div className={styles.modalOverlay}>
          <Card title="Add Payment Method">
            <div className={styles.form}>
              <select
                className={styles.select}
                value={uiState.newMethod.type}
                onChange={(e) => dispatch({ type: 'SET_NEW_METHOD', payload: { ...uiState.newMethod, type: e.target.value } })}
                title="Select Payment Method Type"
                aria-label="Select payment method type"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
              </select>
              {uiState.newMethod.type === 'card' && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="pm-card-brand" className={styles.label}>Card Brand (Visa, Mastercard)</label>
                    <input
                      id="pm-card-brand"
                      className={styles.input}
                      placeholder="Card Brand (Visa, Mastercard)"
                      value={uiState.newMethod.cardBrand}
                      onChange={(e) => dispatch({ type: 'SET_NEW_METHOD', payload: { ...uiState.newMethod, cardBrand: e.target.value } })}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="pm-last4" className={styles.label}>Last 4 digits</label>
                    <input
                      id="pm-last4"
                      className={styles.input}
                      placeholder="Last 4 digits"
                      value={uiState.newMethod.cardLast4}
                      onChange={(e) => dispatch({ type: 'SET_NEW_METHOD', payload: { ...uiState.newMethod, cardLast4: e.target.value } })}
                      maxLength={4}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="pm-expiry" className={styles.label}>Expiry (MM/YY)</label>
                    <input
                      id="pm-expiry"
                      className={styles.input}
                      placeholder="Expiry (MM/YY)"
                      value={uiState.newMethod.cardExpiry}
                      onChange={(e) => dispatch({ type: 'SET_NEW_METHOD', payload: { ...uiState.newMethod, cardExpiry: e.target.value } })}
                    />
                  </div>
                </div>
              )}
              {uiState.newMethod.type === 'upi' && (
                <div className={styles.fieldGroup}>
                  <label htmlFor="pm-upi-id" className={styles.label}>UPI ID (example@upi)</label>
                  <input
                    id="pm-upi-id"
                    className={styles.input}
                    placeholder="UPI ID (example@upi)"
                    value={uiState.newMethod.upiId}
                    onChange={(e) => dispatch({ type: 'SET_NEW_METHOD', payload: { ...uiState.newMethod, upiId: e.target.value } })}
                  />
                </div>
              )}
              <div className={styles.formActions}>
                <Button label="Cancel" onClick={() => dispatch({ type: 'SET_SHOW_ADD_FORM', payload: false })} variant="secondary" />
                <Button label="Save" onClick={handleAddMethod} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default function Wrapped(props: any) {
  return <ProtectedRoute><PaymentMethodsPage {...props} /></ProtectedRoute>;
}