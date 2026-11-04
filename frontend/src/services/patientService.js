
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
