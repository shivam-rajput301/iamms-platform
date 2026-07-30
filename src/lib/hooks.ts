import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  departmentsApi,
  profilesApi,
  assetsApi,
  requestsApi,
  inventoryApi,
  notificationsApi,
} from '@/lib/api';
import type { Asset, InventoryItem, MaintenanceLog, MaintenanceRequest, Profile } from '@/lib/types';

const STALE = { staleTime: 5 * 1000, refetchInterval: 10 * 1000 };

// ===== Departments =====
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
    ...STALE,
  });
}

// ===== Profiles =====
export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: () => profilesApi.getAll(),
    ...STALE,
  });
}

export function useEngineers() {
  return useQuery({
    queryKey: ['engineers'],
    queryFn: () => profilesApi.getEngineers(),
    ...STALE,
  });
}

// ===== Assets =====
export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: () => assetsApi.getAll(),
    ...STALE,
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: ['asset', id],
    enabled: !!id,
    queryFn: () => (id ? assetsApi.getById(id) : Promise.resolve(null)),
    ...STALE,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Asset>) => assetsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<Asset>) => assetsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      qc.invalidateQueries({ queryKey: ['asset'] });
    },
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  });
}

// ===== Maintenance Requests =====
export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsApi.getAll(),
    ...STALE,
  });
}

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['request', id],
    enabled: !!id,
    queryFn: () => (id ? requestsApi.getById(id) : Promise.resolve(null)),
    ...STALE,
  });
}

export function useRequestLogs(requestId: string | undefined) {
  return useQuery({
    queryKey: ['request-logs', requestId],
    enabled: !!requestId,
    queryFn: () => (requestId ? requestsApi.getLogs(requestId) : Promise.resolve([])),
    ...STALE,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<MaintenanceRequest>) => requestsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<MaintenanceRequest>) => requestsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['request'] });
    },
  });
}

export function useSubmitRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating, feedback_comment }: { id: string; rating: number; feedback_comment?: string }) =>
      requestsApi.submitRating(id, rating, feedback_comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['request'] });
    },
  });
}

export function useAddLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<MaintenanceLog>) => requestsApi.addLog(input),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['request-logs', vars.request_id] }),
  });
}

// ===== Inventory =====
export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryApi.getAll(),
    ...STALE,
  });
}

export function useCreateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<InventoryItem>) => inventoryApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useUpdateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<InventoryItem>) => inventoryApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useDeleteInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useDecrementInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => inventoryApi.decrement(id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

// ===== Notifications =====
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(),
    ...STALE,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ===== Profile update =====
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<Profile>) => profilesApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}
