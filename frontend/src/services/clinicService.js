
import { apiRequest } from "./api";

// Retrieve the clinic information.
export async function getClinic() {
  return apiRequest("/clinic");
}

// Admin-only: update clinic information.
export async function updateClinic(clinicData) {
  return apiRequest("/clinic", {
    method: "PUT",
    body: JSON.stringify(clinicData),
  });
}
