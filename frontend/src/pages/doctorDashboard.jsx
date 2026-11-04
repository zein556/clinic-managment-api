import { useEffect, useMemo, useState } from "react";
import {
  getMyAppointments,
  updateAppointmentStatus,
} from "../services/appointmentService";
import {
  createMedicalRecord,
  getPatientMedicalHistory,
} from "../services/medicalRecordService";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import { getClinic } from "../services/clinicService";
import "./doctorDashboard.css";

const MENU = [
  { id: "dashboard", icon: "⌂", label: "Dashboard" },
  { id: "appointments", icon: "▦", label: "Appointments" },
  { id: "records", icon: "▤", label: "Medical Records" },
  { id: "notifications", icon: "♧", label: "Notifications" },
  { id: "profile", icon: "◉", label: "My Profile" },
  { id: "clinic", icon: "⌂", label: "Clinic Information" },
];

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatStatus(status = "pending") {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DoctorDashboard() {
  const [user] = useState(readUser);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [readingId, setReadingId] = useState(null);
  const [readingAll, setReadingAll] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [recordAppointment, setRecordAppointment] = useState(null);
  const [savingRecord, setSavingRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({
    diagnosis: "", notes: "",
    medication_name: "", dosage: "", instructions: "",
  });

 const doctorName = (user.name || user.username || "Doctor")
  .replace(/^Dr\.?\s*/i, "")
  .trim() || "Doctor";
  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const today = new Date().toDateString();

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((item) => item.status === "pending").length,
    confirmed: appointments.filter((item) => item.status === "confirmed").length,
    completed: appointments.filter((item) => item.status === "completed").length,
    today: appointments.filter((item) => new Date(item.appointment_date).toDateString() === today).length,
  }), [appointments, today]);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      const results = await Promise.allSettled([getMyAppointments(), getMyNotifications(), getClinic()]);
      if (cancelled) return;

      setError("");
      if (results[0].status === "fulfilled") setAppointments(results[0].value);
      else setError("Could not load appointments. Please refresh the page.");
      if (results[1].status === "fulfilled") setNotifications(results[1].value);
      else if (results[0].status === "fulfilled") setError("Appointments loaded, but notifications could not be loaded.");
      if (results[2].status === "fulfilled") setClinic(results[2].value);
      else if (results[0].status === "fulfilled" && results[1].status === "fulfilled") setError("Dashboard loaded, but clinic information could not be loaded.");
      setLoading(false);
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  function changeSection(id) {
    setActiveSection(id);
    setSidebarOpen(false);
    setError("");
    setSuccess("");
  }

  async function changeStatus(appointment, status) {
    setBusyId(appointment.id);
    setError("");
    setSuccess("");
    try {
      await updateAppointmentStatus(appointment.id, status);
      setAppointments((current) => current.map((item) =>
        item.id === appointment.id ? { ...item, status } : item
      ));
      setSuccess(`Appointment ${status} successfully.`);
      const refreshed = await getMyNotifications().catch(() => null);
      if (refreshed) setNotifications(refreshed);
    } catch (err) {
      setError(err.message || "Could not update appointment.");
    } finally {
      setBusyId(null);
    }
  }

  async function openPatientHistory(appointment) {
    const patient = appointment.patient || {};
    const patientId = appointment.patient_id || patient.id;
    if (!patientId) {
      setError("Patient information is not available for this appointment.");
      return;
    }
    setSelectedPatient({ ...patient, id: patientId });
    setHistoryLoading(true);
    setActiveSection("records");
    setError("");
    try {
      setPatientRecords(await getPatientMedicalHistory(patientId));
    } catch (err) {
      setPatientRecords([]);
      setError(err.message || "Could not load patient history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  function openRecordForm(appointment) {
    setRecordAppointment(appointment);
    setRecordForm({
      diagnosis: "", notes: "",
      medication_name: "", dosage: "", instructions: "",
    });
    setError("");
    setSuccess("");
  }

  async function submitRecord(event) {
    event.preventDefault();
    if (!recordAppointment) return;
    setSavingRecord(true);
    setError("");
    setSuccess("");
    const prescriptions = recordForm.medication_name.trim()
      ? [{
          medication_name: recordForm.medication_name.trim(),
          dosage: recordForm.dosage.trim(),
          instructions: recordForm.instructions.trim(),
        }]
      : [];
    try {
      await createMedicalRecord({
        appointment_id: recordAppointment.id,
        diagnosis: recordForm.diagnosis.trim(),
        notes: recordForm.notes.trim(),
        prescriptions,
      });
      setSuccess("Medical record created successfully.");
      setRecordAppointment(null);
      if (selectedPatient?.id) {
        setPatientRecords(await getPatientMedicalHistory(selectedPatient.id));
      }
      const refreshed = await getMyNotifications().catch(() => null);
      if (refreshed) setNotifications(refreshed);
    } catch (err) {
      setError(err.message || "Could not create medical record.");
    } finally {
      setSavingRecord(false);
    }
  }

  async function readNotification(notification) {
    setReadingId(notification.id);
    try {
      await markNotificationAsRead(notification.id);
      setNotifications((items) => items.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      ));
    } catch (err) {
      setError(err.message || "Could not update notification.");
    } finally {
      setReadingId(null);
    }
  }

  async function readAllNotifications() {
    setReadingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
    } catch (err) {
      setError(err.message || "Could not update notifications.");
    } finally {
      setReadingAll(false);
    }
  }

  function logout() {
    ["token", "user", "clinic-token", "clinic-user"].forEach((key) => localStorage.removeItem(key));
    window.location.assign("/");
  }

  const title = MENU.find((item) => item.id === activeSection)?.label || "Dashboard";

  function renderClinicInformation() {
    if (!clinic) {
      return <div className="doctor-empty">Clinic information is currently unavailable.</div>;
    }

    const coordinates = clinic.latitude != null && clinic.longitude != null
      ? `${clinic.latitude}, ${clinic.longitude}`
      : "—";

    return (
      <div className="doctor-clinic-card">
        <div className="doctor-clinic-heading">
          <span className="doctor-clinic-icon">⌂</span>
          <div>
            <span className="doctor-clinic-eyebrow">CAREPOINT</span>
            <h2>{clinic.name || "Clinic"}</h2>
            <p>Clinic information and location</p>
          </div>
        </div>
        <div className="doctor-clinic-grid">
          <div className="doctor-clinic-item">
            <span className="doctor-clinic-symbol">⌖</span>
            <div><small>Address</small><strong>{clinic.address || "Not provided"}</strong></div>
          </div>
          <div className="doctor-clinic-item">
            <span className="doctor-clinic-symbol">◎</span>
            <div><small>Coordinates</small><strong>{coordinates}</strong></div>
          </div>
        </div>
        {clinic.googleMapsUrl && (
          <a className="doctor-clinic-map-link" href={clinic.googleMapsUrl} target="_blank" rel="noopener noreferrer">
            Open clinic in Google Maps <span aria-hidden="true">↗</span>
          </a>
        )}
        <p className="doctor-clinic-note">This information is provided for viewing only. Contact the clinic administrator if it needs to be changed.</p>
      </div>
    );
  }

  function appointmentRows(items) {
    if (!items.length) return <div className="doctor-empty">No appointments found.</div>;
    return (
      <div className="doctor-table-wrap">
        <table className="doctor-table">
          <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((appointment) => {
              const patient = appointment.patient || {};
              const patientName = patient.name || patient.username || `Patient #${appointment.patient_id || "—"}`;
              return (
                <tr key={appointment.id}>
                  <td><strong>{patientName}</strong><small>{patient.phone || patient.email || ""}</small></td>
                  <td>{formatDate(appointment.appointment_date)}</td>
                  <td>{appointment.appointment_time || "—"}</td>
                  <td><span className={`doctor-status ${appointment.status || "pending"}`}>{formatStatus(appointment.status)}</span></td>
                  <td>
                    <div className="doctor-actions">
                      <button className="doctor-btn light" onClick={() => openPatientHistory(appointment)}>History</button>
                      {appointment.status === "pending" && <button className="doctor-btn primary" disabled={busyId === appointment.id} onClick={() => changeStatus(appointment, "confirmed")}>Confirm</button>}
                      {appointment.status === "confirmed" && <button className="doctor-btn primary" disabled={busyId === appointment.id} onClick={() => changeStatus(appointment, "completed")}>Complete</button>}
                      {["pending", "confirmed"].includes(appointment.status) && <button className="doctor-btn danger" disabled={busyId === appointment.id} onClick={() => changeStatus(appointment, "cancelled")}>Cancel</button>}
                      {appointment.status !== "cancelled" && <button className="doctor-btn light" onClick={() => openRecordForm(appointment)}>Add record</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="doctor-layout">
      {sidebarOpen && <button className="doctor-overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`doctor-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="doctor-brand"><span className="doctor-brand-mark">✚</span><div><strong>CarePoint</strong><small>Doctor Portal</small></div></div>
        <div className="doctor-sidebar-user"><span className="doctor-avatar">{doctorName.charAt(0).toUpperCase()}</span><div><strong>{doctorName}</strong><small>Doctor</small></div></div>
        <span className="doctor-menu-label">WORKSPACE</span>
        <nav className="doctor-nav">
          {MENU.map((item) => <button key={item.id} className={activeSection === item.id ? "active" : ""} onClick={() => changeSection(item.id)}><span>{item.icon}</span>{item.label}{item.id === "notifications" && unreadCount > 0 && <b>{unreadCount}</b>}</button>)}
        </nav>
        <button className="doctor-logout" onClick={logout}>↪ <span>Sign out</span></button>
        <div className="doctor-sidebar-foot">CarePoint · Patient Management</div>
      </aside>

      <main className="doctor-main">
        <header className="doctor-header">
          <div className="doctor-header-left"><button className="doctor-menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button><div><small>DOCTOR PORTAL</small><h1>{title}</h1></div></div>
          <div className="doctor-header-right"><button className="doctor-bell" onClick={() => changeSection("notifications")}>♧{unreadCount > 0 && <i />}</button><div className="doctor-header-user"><span className="doctor-avatar">{doctorName.charAt(0).toUpperCase()}</span><div><strong>{doctorName}</strong><small>Doctor</small></div></div></div>
        </header>

        <section className="doctor-content">
          {error && <div className="doctor-alert error">{error}<button onClick={() => setError("")}>×</button></div>}
          {success && <div className="doctor-alert success">{success}<button onClick={() => setSuccess("")}>×</button></div>}
          {loading ? <div className="doctor-loading">Loading your dashboard…</div> : (
            <>
              {activeSection === "dashboard" && <>
                <div className="doctor-welcome"><div><span>YOUR PRACTICE AT A GLANCE</span><h2>Welcome back, Dr. {doctorName}</h2><p>Here is an overview of your appointments and patient activity.</p></div><div className="doctor-welcome-icon">✚</div></div>
                <div className="doctor-stat-grid">
                  {[["Total appointments", stats.total, "All scheduled visits", "▦"], ["Pending", stats.pending, "Awaiting your response", "◷"], ["Confirmed", stats.confirmed, "Upcoming visits", "✓"], ["Completed", stats.completed, "Finished consultations", "▤"]].map(([label, value, note, icon]) => <article className="doctor-stat" key={label}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><em>{note}</em></div></article>)}
                </div>
                <div className="doctor-section-heading"><div><h2>Recent appointments</h2><p>Review and manage your latest patient visits.</p></div><button className="doctor-btn light" onClick={() => changeSection("appointments")}>View all</button></div>
                {appointmentRows(appointments.slice(0, 5))}
              </>}

              {activeSection === "appointments" && <>
                <div className="doctor-section-heading"><div><h2>My appointments</h2><p>Manage bookings, update their status and review patient history.</p></div><span className="doctor-count">{appointments.length} appointments</span></div>
                {appointmentRows(appointments)}
              </>}

              {activeSection === "records" && <>
                <div className="doctor-section-heading"><div><h2>Patient medical records</h2><p>Choose a patient from an appointment to review their history.</p></div></div>
                {selectedPatient ? <><div className="doctor-patient-banner"><div><strong>{selectedPatient.name || selectedPatient.username || `Patient #${selectedPatient.id}`}</strong><small>Patient ID: {selectedPatient.id}</small></div><button className="doctor-btn light" onClick={() => { setSelectedPatient(null); setPatientRecords([]); }}>Clear selection</button></div>{historyLoading ? <div className="doctor-loading">Loading patient history…</div> : patientRecords.length ? <div className="doctor-record-list">{patientRecords.map((record) => <article className="doctor-record-card" key={record.id || record.appointment_id}><div><span className="doctor-record-date">{formatDate(record.created_at || record.appointment?.appointment_date)}</span><h3>{record.diagnosis || "Medical record"}</h3></div><p>{record.notes || "No additional notes."}</p>{Array.isArray(record.prescriptions) && record.prescriptions.length > 0 && <div className="doctor-prescriptions"><strong>Prescriptions</strong>{record.prescriptions.map((prescription, index) => <p key={prescription.id || index}>{prescription.medication_name} · {prescription.dosage} — {prescription.instructions}</p>)}</div>}</article>)}</div> : <div className="doctor-empty">No medical history found for this patient.</div>}</> : <div className="doctor-empty">Open an appointment and select <strong>History</strong> to view a patient's records.</div>}
              </>}

              {activeSection === "notifications" && <>
                <div className="doctor-section-heading"><div><h2>Notifications</h2><p>Stay up to date with appointment activity.</p></div><button className="doctor-btn light" disabled={!unreadCount || readingAll} onClick={readAllNotifications}>{readingAll ? "Updating…" : "Mark all as read"}</button></div>
                {notifications.length ? <div className="doctor-notification-list">{notifications.map((item) => <article key={item.id} className={`doctor-notification ${item.is_read ? "" : "unread"}`}><span className="doctor-notification-icon">♧</span><div><strong>{item.title || "Notification"}</strong><p>{item.message}</p><small>{item.created_at ? formatDate(item.created_at) : ""}</small></div>{!item.is_read && <button className="doctor-btn light" disabled={readingId === item.id} onClick={() => readNotification(item)}>{readingId === item.id ? "…" : "Mark read"}</button>}</article>)}</div> : <div className="doctor-empty">You have no notifications.</div>}
              </>}

              {activeSection === "clinic" && <>{renderClinicInformation()}</>}

              {activeSection === "profile" && <div className="doctor-profile-card"><div className="doctor-profile-top"><span className="doctor-profile-avatar">{doctorName.charAt(0).toUpperCase()}</span><div><h2>{doctorName}</h2><p>CarePoint Doctor</p></div></div><div className="doctor-profile-grid"><div><small>Name</small><strong>{doctorName}</strong></div><div><small>Email</small><strong>{user.email || "—"}</strong></div><div><small>Role</small><strong>{user.role || "doctor"}</strong></div><div><small>Specialty</small><strong>{user.specialty || "—"}</strong></div></div></div>}
            </>
          )}
        </section>
      </main>

      {recordAppointment && <div className="doctor-modal-backdrop" onClick={() => !savingRecord && setRecordAppointment(null)}><form className="doctor-modal" onSubmit={submitRecord} onClick={(event) => event.stopPropagation()}><div className="doctor-modal-heading"><div><small>APPOINTMENT #{recordAppointment.id}</small><h2>Create medical record</h2></div><button type="button" onClick={() => setRecordAppointment(null)}>×</button></div><label>Diagnosis<input required value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} /></label><label>Notes<textarea rows="3" value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} /></label><div className="doctor-form-divider">Prescription (optional)</div><label>Medication name<input value={recordForm.medication_name} onChange={(e) => setRecordForm({ ...recordForm, medication_name: e.target.value })} /></label><div className="doctor-form-row"><label>Dosage<input value={recordForm.dosage} onChange={(e) => setRecordForm({ ...recordForm, dosage: e.target.value })} /></label><label>Instructions<input value={recordForm.instructions} onChange={(e) => setRecordForm({ ...recordForm, instructions: e.target.value })} /></label></div><div className="doctor-modal-actions"><button type="button" className="doctor-btn light" onClick={() => setRecordAppointment(null)}>Cancel</button><button type="submit" className="doctor-btn primary" disabled={savingRecord}>{savingRecord ? "Saving…" : "Save record"}</button></div></form></div>}
    </div>
  );
}

export default DoctorDashboard;
