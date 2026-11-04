import { apiRequest } from "./api";

export async function getMyAppointments() {
  try {
    const data = await apiRequest("/appointments");
    return Array.isArray(data) ? data : data.appointments || [];
  } catch (error) {
    if (error.message === "No appointments found") return [];
    throw error;
  }
}

export async function bookAppointment(doctorId, appointmentDate, appointmentTime) {
  return apiRequest("/appointments", {
    method: "POST",
    body: JSON.stringify({
      doctor_id: doctorId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    }),
  });
}

export async function updateAppointment(appointmentId, appointmentDate, appointmentTime) {
  return apiRequest(`/appointments/${appointmentId}`, {
    method: "PUT",
    body: JSON.stringify({
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    }),
  });
}

// Used by doctors to confirm, cancel, or complete an appointment.
export async function updateAppointmentStatus(appointmentId, status) {
  return apiRequest(`/appointments/${appointmentId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function cancelAppointment(appointmentId) {
  return apiRequest(`/appointments/${appointmentId}`, { method: "DELETE" });
}
