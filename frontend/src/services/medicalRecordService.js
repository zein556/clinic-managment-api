import { apiRequest } from "./api";

// Patient history (also used by doctors when reviewing an appointment's patient).
export async function getMyMedicalRecords(patientId) {
  const data = await apiRequest(`/medicalRecords/patient/${patientId}`);
  return data.data || [];
}

export async function getPatientMedicalHistory(patientId) {
  const data = await apiRequest(`/medicalRecords/patient/${patientId}`);
  return data.data || [];
}

export async function getRecordByAppointment(appointmentId) {
  const data = await apiRequest(`/medicalRecords/appointment/${appointmentId}`);
  return data.data || null;
}

export async function createMedicalRecord(record) {
  return apiRequest("/medicalRecords", {
    method: "POST",
    body: JSON.stringify(record),
  });
}
