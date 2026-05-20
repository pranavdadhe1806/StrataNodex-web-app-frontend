import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import type { NotificationPreferences } from '../types/notification.types';

const NOTIF_KEY = 'notification-preferences';

export function useNotificationPreferences(pollInterval?: number) {
  return useQuery<NotificationPreferences, Error>({
    queryKey: [NOTIF_KEY],
    queryFn: notificationApi.getPreferences,
    refetchInterval: pollInterval,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIF_KEY] });
    },
  });
}

export function useGenerateTelegramCode() {
  return useMutation({
    mutationFn: notificationApi.generateTelegramCode,
  });
}

export function useUnlinkTelegram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.unlinkTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIF_KEY] });
    },
  });
}
