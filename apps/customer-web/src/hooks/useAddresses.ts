import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@spicegarden/shared/constants';

export interface Address {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

async function fetchAddresses(): Promise<Address[]> {
  const res = await fetch(`${API_URL}/addresses`, {
    headers: {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load addresses');
  const json = await res.json();
  return json.data ?? json;
}

async function addAddress(address: Omit<Address, 'id'>): Promise<Address> {
  const res = await fetch(`${API_URL}/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(address),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to add address');
  const json = await res.json();
  return json.data ?? json;
}

async function deleteAddress(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/addresses/${id}`, {
    method: 'DELETE',
    headers: {},
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete address');
}

export function useAddresses() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: (address: Omit<Address, 'id'>) => addAddress(address),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  return {
    addresses: data ?? [],
    isLoading,
    isAdding: addMutation.isPending,
    isDeleting: (id: string) => deleteMutation.isPending && deleteMutation.variables === id,
    addAddress: addMutation.mutate,
    deleteAddress: deleteMutation.mutate,
    error: error ?? addMutation.error ?? deleteMutation.error,
  };
}
