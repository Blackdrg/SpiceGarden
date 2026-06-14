import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3001/api';

export interface Address {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

async function fetchAddresses(token: string): Promise<Address[]> {
  const res = await fetch(`${API_URL}/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load addresses');
  const json = await res.json();
  return json.data ?? json;
}

async function addAddress(token: string, address: Omit<Address, 'id'>): Promise<Address> {
  const res = await fetch(`${API_URL}/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(address),
  });
  if (!res.ok) throw new Error('Failed to add address');
  const json = await res.json();
  return json.data ?? json;
}

async function deleteAddress(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/addresses/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete address');
}

export function useAddresses(token: string | null) {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: () => fetchAddresses(token!),
    enabled: !!token,
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: (address: Omit<Address, 'id'>) => addAddress(token!, address),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  return {
    addresses: addressesQuery.data ?? [],
    isLoading: addressesQuery.isLoading,
    isAdding: addMutation.isPending,
    isDeleting: (id: string) => deleteMutation.isPending && deleteMutation.variables === id,
    addAddress: addMutation.mutate,
    deleteAddress: deleteMutation.mutate,
    error: addressesQuery.error ?? addMutation.error ?? deleteMutation.error,
  };
}
