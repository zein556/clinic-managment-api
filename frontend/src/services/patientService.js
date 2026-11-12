import { apiRequest } from "./api";

// Retrieve all patients, including deactivated accounts.
export async function getPatients() {
  const data = await apiRequest("/patients");
  return data.patients || [];
}

// Admin-only: deactivate a patient account without deleting patient data.
export async function deactivatePatient(patientId) {
  return apiRequest(`/patients/${patientId}`, {
    method: "DELETE",
  });
}

// Admin-only: reactivate a previously deactivated patient account.
export async function activatePatient(patientId) {
  return apiRequest(`/patients/${patientId}/activate`, {
    method: "PATCH",
  });
}
// Admin-only: update a patient's personal information.
export async function updatePatient(patientId, patientData) {
  return apiRequest(`/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(patientData),
  });
}
// Admin-only: create a patient account and profile.
export async function createPatient(patientData) {
  return apiRequest("/patients", {
    method: "POST",
    body: JSON.stringify(patientData),
  });
}
// Retrieve the authenticated patient's profile.
export async function getMyProfile() {
  const data = await apiRequest("/patients/me");
  return data.patient || data;
}

// Update the authenticated patient's personal profile.
export async function updateMyProfile(profileData) {
  return apiRequest("/patients/me", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}