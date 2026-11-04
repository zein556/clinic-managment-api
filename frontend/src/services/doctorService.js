import { apiRequest } from "./api";

// Retrieve the clinic's doctors.
export async function getDoctors() {
  const data = await apiRequest("/doctors");
  return data.doctors || [];
}

// Retrieve one doctor's profile.
export async function getDoctorById(doctorId) {
  const data = await apiRequest(`/doctors/${doctorId}`);
  return data.doctor || data;
}

// Admin-only: create a doctor account and profile.
export async function createDoctor(doctorData) {
  return apiRequest("/doctors", {
    method: "POST",
    body: JSON.stringify(doctorData),
  });
}

// Admin-only: update a doctor's profile.
export async function updateDoctor(doctorId, doctorData) {
  return apiRequest(`/doctors/${doctorId}`, {
    method: "PUT",
    body: JSON.stringify(doctorData),
  });
}

// Admin-only: delete a doctor.
export async function deleteDoctor(doctorId) {
  return apiRequest(`/doctors/${doctorId}`, {
    method: "DELETE",
  });
}
