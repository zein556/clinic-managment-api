import { apiRequest } from "./api";

export async function getMyNotifications() {
  const data = await apiRequest("/notifications");
  return data.notifications || [];
}

export async function getUnreadNotifications() {
  const data = await apiRequest("/notifications/unread");
  return data.notifications || [];
}

export async function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: "PUT",
  });
}

export async function markAllNotificationsAsRead() {
  return apiRequest("/notifications/read-all", {
    method: "PUT",
  });
}