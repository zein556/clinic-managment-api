import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDoctors, getDoctorById } from "../services/doctorService";
import { getClinic } from "../services/clinicService";

import {
  getMyAppointments,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
} from "../services/appointmentService";

import { getMyMedicalRecords } from "../services/medicalRecordService";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

import PatientSidebar from "../components/patient/PatientSidebar";
import PatientTopbar from "../components/patient/PatientTopbar";
import "./patientDashboard.css";

function PatientDashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loadingDoctorDetails, setLoadingDoctorDetails] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [readingAll, setReadingAll] = useState(false);
  const [readingId, setReadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const patientName = user.name || user.username || "Patient";
  const menuItems = [
    { id: "dashboard", icon: "⌂", label: "Dashboard" },
    { id: "appointments", icon: "▦", label: "My Appointments" },
    { id: "records", icon: "▤", label: "Medical Records" },
    { id: "notifications", icon: "♧", label: "Notifications" },
    { id: "doctors", icon: "✚", label: "Doctors" },
    { id: "clinic", icon: "⌂", label: "Clinic Information" },
    { id: "profile", icon: "◉", label: "My Profile" },
  ];

  const sectionTitles = {
    dashboard: "Dashboard",
    appointments: "My Appointments",
    records: "Medical Records",
    notifications: "Notifications",
    doctors: "Our Doctors",
    clinic: "Clinic Information",
    profile: "My Profile",
  };

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getDoctors(),
        getMyAppointments(),
        user.profileId
          ? getMyMedicalRecords(user.profileId)
          : Promise.resolve([]),
        getMyNotifications(),
        getClinic(),
      ]);

      const errors = [];

      if (results[0].status === "fulfilled") {
        setDoctors(results[0].value);
      } else {
        errors.push("Could not load doctors.");
      }

      if (results[1].status === "fulfilled") {
        setAppointments(results[1].value);
      } else {
        errors.push("Could not load appointments.");
      }

      if (results[2].status === "fulfilled") {
        setMedicalRecords(results[2].value);
      } else {
        errors.push("Could not load medical records.");
      }

      if (results[3].status === "fulfilled") {
        setNotifications(results[3].value);
      } else {
        errors.push("Could not load notifications.");
      }

      if (results[4].status === "fulfilled") {
        setClinic(results[4].value);
      } else {
        errors.push("Could not load clinic information.");
      }

      if (errors.length > 0) {
        setError(errors.join(" "));
      }

      setLoading(false);
    }

    loadDashboard();
  }, [user.profileId]);

  function changeSection(section) {
    setActiveSection(section);
    setSidebarOpen(false);
    setError("");
    setSuccess("");
  }

  async function handleViewDoctor(doctorIdToView) {
    setError("");
    setSuccess("");
    setLoadingDoctorDetails(true);
    setSelectedDoctor(null);

    try {
      const doctor = await getDoctorById(doctorIdToView);
      setSelectedDoctor(doctor);
    } catch (err) {
      setError(err.message || "Could not load doctor details.");
    } finally {
      setLoadingDoctorDetails(false);
    }
  }

  function isFutureDateTime(date, time) {
    const selected = new Date(`${date}T${time}`);
    return !Number.isNaN(selected.getTime()) && selected > new Date();
  }

  function formatDate(date) {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString();
  }

  function formatDateTime(date) {
    if (!date) return "Not specified";

    return new Date(date).toLocaleString();
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  async function refreshAppointments() {
    const data = await getMyAppointments();
    setAppointments(data);
  }

  async function refreshNotifications() {
    const data = await getMyNotifications();
    setNotifications(data);
  }

  async function handleBooking(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!doctorId) {
      setError("Please select a doctor.");
      return;
    }

    if (!isFutureDateTime(appointmentDate, appointmentTime)) {
      setError("Please select a future appointment date and time.");
      return;
    }

    try {
      setBooking(true);

      const result = await bookAppointment(
        Number(doctorId),
        appointmentDate,
        appointmentTime
      );

      setSuccess(result.message || "Appointment booked successfully!");

      setDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");

      await Promise.all([
        refreshAppointments(),
        refreshNotifications(),
      ]);
    } catch (err) {
      setError(err.message || "Failed to book appointment.");
    } finally {
      setBooking(false);
    }
  }

  function startEditing(appointment) {
    setEditingId(appointment.id);

    setEditDate(String(appointment.appointment_date).slice(0, 10));
    setEditTime(appointment.appointment_time);

    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditDate("");
    setEditTime("");
  }

  async function handleUpdate(event, appointmentId) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isFutureDateTime(editDate, editTime)) {
      setError("Please select a future appointment date and time.");
      return;
    }

    try {
      setSavingEdit(true);

      const result = await updateAppointment(
        appointmentId,
        editDate,
        editTime
      );

      setSuccess(result.message || "Appointment updated successfully!");

      cancelEditing();
      await refreshAppointments();
    } catch (err) {
      setError(err.message || "Failed to update appointment.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleCancel(appointmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const result = await cancelAppointment(appointmentId);

      setSuccess(result.message || "Appointment cancelled successfully!");

      await refreshAppointments();
    } catch (err) {
      setError(err.message || "Failed to cancel appointment.");
    }
  }

  async function handleMarkAsRead(notificationId) {
    setError("");

    try {
      setReadingId(notificationId);

      await markNotificationAsRead(notificationId);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      setError(err.message || "Could not update notification.");
    } finally {
      setReadingId(null);
    }
  }

  async function handleMarkAllAsRead() {
    setError("");

    try {
      setReadingAll(true);

      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setSuccess("All notifications marked as read.");
    } catch (err) {
      setError(err.message || "Could not update notifications.");
    } finally {
      setReadingAll(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("clinic-token");
    localStorage.removeItem("clinic-user");

    navigate("/login", { replace: true });
  }

  function renderDashboardHome() {
    const pendingAppointments = appointments.filter(
      (appointment) => appointment.status === "pending"
    ).length;

    const totalMedicalRecords = medicalRecords.length;

    return (
      <>
        <div className="welcome-banner">
          <div>
            <span className="welcome-eyebrow">PATIENT PORTAL</span>
            <h2>Welcome back, {patientName}!</h2>
            <p>
              Manage your appointments, medical records and health updates
              from one place.
            </p>
          </div>

          <div className="welcome-decoration">✚</div>
        </div>

        <div className="stats-grid">
          <button
            className="stat-card"
            onClick={() => changeSection("appointments")}
          >
            <span className="stat-icon blue">▦</span>
            <span className="stat-label">Total Appointments</span>
            <strong>{appointments.length}</strong>
            <span className="stat-link">View appointments →</span>
          </button>

          <button
            className="stat-card"
            onClick={() => changeSection("appointments")}
          >
            <span className="stat-icon orange">◷</span>
            <span className="stat-label">Pending Appointments</span>
            <strong>{pendingAppointments}</strong>
            <span className="stat-link">View pending →</span>
          </button>

          <button
            className="stat-card"
            onClick={() => changeSection("records")}
          >
            <span className="stat-icon purple">▤</span>
            <span className="stat-label">Medical Records</span>
            <strong>{totalMedicalRecords}</strong>
            <span className="stat-link">View records →</span>
          </button>

          <button
            className="stat-card"
            onClick={() => changeSection("notifications")}
          >
            <span className="stat-icon green">♧</span>
            <span className="stat-label">Unread Notifications</span>
            <strong>{unreadCount}</strong>
            <span className="stat-link">View notifications →</span>
          </button>
        </div>

        <div className="content-card">
          <div className="section-heading">
            <div>
              <h3>Recent Appointments</h3>
              <p>Your latest appointment activity</p>
            </div>

            <button
              className="text-button"
              onClick={() => changeSection("appointments")}
            >
              View all →
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="empty-state">
              <span>▦</span>
              <p>You don't have any appointments yet.</p>
              <button
                className="primary-button"
                onClick={() => changeSection("appointments")}
              >
                Book an Appointment
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.doctor?.name || "Not available"}</td>
                      <td>{formatDate(appointment.appointment_date)}</td>
                      <td>{appointment.appointment_time}</td>
                      <td>
                        <span className={`status-pill ${appointment.status}`}>
                          {formatStatus(appointment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  function renderAppointments() {
    return (
      <>
        <div className="page-intro">
          <div>
            <h2>My Appointments</h2>
            <p>Book a visit and manage your upcoming appointments.</p>
          </div>
        </div>

        <div className="content-card">
          <div className="section-heading">
            <div>
              <h3>Book an Appointment</h3>
              <p>Choose a doctor and your preferred date and time.</p>
            </div>
          </div>

          <form onSubmit={handleBooking} className="patient-form">
            <div className="form-field">
              <label htmlFor="doctor">Select Doctor</label>

              <select
                id="doctor"
                value={doctorId}
                onChange={(event) => setDoctorId(event.target.value)}
                required
              >
                <option value="">Choose a doctor</option>

                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="appointmentDate">Appointment Date</label>

              <input
                id="appointmentDate"
                type="date"
                value={appointmentDate}
                min={new Date().toLocaleDateString("en-CA")}
                onChange={(event) => setAppointmentDate(event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="appointmentTime">Appointment Time</label>

              <input
                id="appointmentTime"
                type="time"
                value={appointmentTime}
                onChange={(event) => setAppointmentTime(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={booking || doctors.length === 0}
            >
              {booking ? "Booking..." : "+ Book Appointment"}
            </button>
          </form>
        </div>

        <div className="content-card">
          <div className="section-heading">
            <div>
              <h3>Appointment History</h3>
              <p>All your appointments and their current status.</p>
            </div>

            <span className="count-label">{appointments.length} Total</span>
          </div>

          {appointments.length === 0 ? (
            <div className="empty-state">
              <span>▦</span>
              <p>You don't have any appointments yet.</p>
            </div>
          ) : (
            <div className="appointment-grid">
              {appointments.map((appointment) => (
                <article className="appointment-card" key={appointment.id}>
                  <div className="appointment-card-top">
                    <span className="appointment-number">
                      Appointment #{appointment.id}
                    </span>

                    <span className={`status-pill ${appointment.status}`}>
                      {formatStatus(appointment.status)}
                    </span>
                  </div>

                  <h3>{appointment.doctor?.name || "Doctor"}</h3>

                  <p className="muted-text">
                    {appointment.doctor?.specialty || "Specialty not available"}
                  </p>

                  <div className="appointment-details">
                    <p>
                      <strong>Date:</strong>{" "}
                      {formatDate(appointment.appointment_date)}
                    </p>

                    <p>
                      <strong>Time:</strong> {appointment.appointment_time}
                    </p>
                  </div>

                  {editingId === appointment.id ? (
                    <form
                      className="patient-form edit-form"
                      onSubmit={(event) =>
                        handleUpdate(event, appointment.id)
                      }
                    >
                      <div className="form-field">
                        <label>New Date</label>
                        <input
                          type="date"
                          value={editDate}
                          min={new Date().toLocaleDateString("en-CA")}
                          onChange={(event) => setEditDate(event.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label>New Time</label>
                        <input
                          type="time"
                          value={editTime}
                          onChange={(event) => setEditTime(event.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={savingEdit}
                      >
                        {savingEdit ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEditing}
                      >
                        Cancel Editing
                      </button>
                    </form>
                  ) : (
                    appointment.status === "pending" && (
                      <div className="appointment-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => startEditing(appointment)}
                        >
                          Reschedule
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleCancel(appointment.id)}
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  function renderMedicalRecords() {
    return (
      <div className="content-card">
        <div className="section-heading">
          <div>
            <h3>My Medical Records</h3>
            <p>Your diagnoses, doctor's notes and prescriptions.</p>
          </div>

          <span className="count-label">
            {medicalRecords.length} Records
          </span>
        </div>

        {medicalRecords.length === 0 ? (
          <div className="empty-state">
            <span>▤</span>
            <p>No medical records available yet.</p>
          </div>
        ) : (
          <div className="records-list">
            {medicalRecords.map((record) => (
              <article className="record-card" key={record.id}>
                <div className="record-header">
                  <div>
                    <span className="record-kicker">
                      MEDICAL RECORD #{record.id}
                    </span>
                    <h3>{record.diagnosis || "Diagnosis not specified"}</h3>
                  </div>

                  <span className="record-date">
                    {formatDate(record.createdAt)}
                  </span>
                </div>

                <div className="record-notes">
                  <strong>Doctor's Notes</strong>
                  <p>{record.notes || "No additional notes."}</p>
                </div>

                <div className="prescriptions-section">
                  <h4>Prescriptions</h4>

                  {!record.prescriptions ||
                  record.prescriptions.length === 0 ? (
                    <p className="muted-text">
                      No prescriptions for this record.
                    </p>
                  ) : (
                    <div className="prescriptions-list">
                      {record.prescriptions.map((prescription) => (
                        <div
                          className="prescription-card"
                          key={prescription.id}
                        >
                          <div className="prescription-icon">✚</div>

                          <div>
                            <strong>
                              {prescription.medication_name}
                            </strong>

                            <p>
                              Dosage: {prescription.dosage || "Not specified"}
                            </p>

                            <p>
                              Instructions:{" "}
                              {prescription.instructions || "Not specified"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderNotifications() {
    return (
      <div className="content-card">
        <div className="section-heading">
          <div>
            <h3>My Notifications</h3>
            <p>Stay informed about your appointments and medical records.</p>
          </div>

          {unreadCount > 0 && (
            <button
              className="secondary-button"
              onClick={handleMarkAllAsRead}
              disabled={readingAll}
            >
              {readingAll ? "Updating..." : "Mark All as Read"}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <span>♧</span>
            <p>You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <article
                className={`notification-card ${
                  notification.is_read ? "read" : "unread"
                }`}
                key={notification.id}
              >
                <div className="notification-symbol">
                  {notification.is_read ? "✓" : "!"}
                </div>

                <div className="notification-body">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>

                    <span
                      className={
                        notification.is_read
                          ? "read-label"
                          : "unread-label"
                      }
                    >
                      {notification.is_read ? "Read" : "Unread"}
                    </span>
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-date">
                    {formatDateTime(notification.createdAt)}
                  </span>

                  {!notification.is_read && (
                    <button
                      className="text-button"
                      onClick={() =>
                        handleMarkAsRead(notification.id)
                      }
                      disabled={readingId === notification.id}
                    >
                      {readingId === notification.id
                        ? "Updating..."
                        : "Mark as read"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderClinicInformation() {
    if (!clinic) {
      return (
        <div className="content-card">
          <div className="empty-state">
            <span>⌂</span>
            <p>Clinic information is not available.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="content-card clinic-information-card">
        <div className="section-heading">
          <div>
            <h3>{clinic.name || "Our Clinic"}</h3>
            <p>Contact and location information for your clinic.</p>
          </div>
          <span className="clinic-information-icon">✚</span>
        </div>

        <div className="clinic-information-grid">
          <div className="clinic-information-item">
            <span className="clinic-information-symbol">⌂</span>
            <div>
              <span>Clinic Name</span>
              <strong>{clinic.name || "Not available"}</strong>
            </div>
          </div>

          <div className="clinic-information-item">
            <span className="clinic-information-symbol">⌖</span>
            <div>
              <span>Address</span>
              <strong>{clinic.address || "Not available"}</strong>
            </div>
          </div>

          <div className="clinic-information-item">
            <span className="clinic-information-symbol">◎</span>
            <div>
              <span>Coordinates</span>
              <strong>
                {clinic.latitude ?? "—"}, {clinic.longitude ?? "—"}
              </strong>
            </div>
          </div>
        </div>

        {clinic.googleMapsUrl && (
          <a
            className="primary-button clinic-map-link"
            href={clinic.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Google Maps ↗
          </a>
        )}
      </div>
    );
  }

  function renderDoctors() {
    const normalizedSearch = doctorSearch.trim().toLowerCase();
    const filteredDoctors = doctors.filter((doctor) =>
      (doctor.specialty || "").toLowerCase().includes(normalizedSearch)
    );

    if (loadingDoctorDetails) {
      return (
        <div className="content-card">
          <div className="dashboard-loading">
            <div className="loading-spinner" />
            <p>Loading doctor details...</p>
          </div>
        </div>
      );
    }

    if (selectedDoctor) {
      return (
        <div className="content-card doctor-details-card">
          <div className="section-heading">
            <div>
              <h3>Doctor Details</h3>
              <p>Information about your selected doctor.</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setSelectedDoctor(null)}
            >
              ← Back to Doctors
            </button>
          </div>

          <div className="doctor-details-profile">
            <div className="doctor-details-avatar">✚</div>
            <div>
              <h2>{selectedDoctor.name || "Doctor"}</h2>
              <p>{selectedDoctor.specialty || "General Practitioner"}</p>
            </div>
          </div>

          <div className="doctor-details-information">
            <div>
              <span>Doctor ID</span>
              <strong>{selectedDoctor.id ?? "Not available"}</strong>
            </div>
            <div>
              <span>Specialty</span>
              <strong>{selectedDoctor.specialty || "Not available"}</strong>
            </div>
            <div>
              <span>Phone Number</span>
              <strong>{selectedDoctor.phone || "Not available"}</strong>
            </div>
            <div>
              <span>Email Address</span>
              <strong>{selectedDoctor.user?.email || "Not available"}</strong>
            </div>
          </div>

          <button
            type="button"
            className="primary-button doctor-details-book-button"
            onClick={() => {
              setDoctorId(String(selectedDoctor.id));
              setSelectedDoctor(null);
              changeSection("appointments");
            }}
          >
            Book with this Doctor
          </button>
        </div>
      );
    }

    return (
      <div className="content-card">
        <div className="section-heading">
          <div>
            <h3>Our Doctors</h3>
            <p>Explore the doctors available at our clinic.</p>
          </div>

          <span className="count-label">{filteredDoctors.length} Doctors</span>
        </div>

        <div className="doctor-search-wrapper">
          <label htmlFor="doctor-specialty-search">Search by specialty</label>
          <input
            id="doctor-specialty-search"
            type="search"
            className="doctor-search-input"
            placeholder="For example: Cardiology, Dentistry..."
            value={doctorSearch}
            onChange={(event) => setDoctorSearch(event.target.value)}
          />
        </div>

        {doctors.length === 0 ? (
          <div className="empty-state">
            <span>✚</span>
            <p>No doctors are currently available.</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="empty-state">
            <span>⌕</span>
            <p>No doctors found for this specialty.</p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setDoctorSearch("")}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="doctors-grid">
            {filteredDoctors.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-avatar">✚</div>

                <h3>{doctor.name}</h3>

                <p>{doctor.specialty || "General Practitioner"}</p>

                {doctor.phone && (
                  <span className="doctor-contact">{doctor.phone}</span>
                )}

                <button
                  type="button"
                  className="secondary-button doctor-details-button"
                  onClick={() => handleViewDoctor(doctor.id)}
                >
                  View Details
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setDoctorId(String(doctor.id));
                    changeSection("appointments");
                  }}
                >
                  Book with Doctor
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderProfile() {
    return (
      <div className="content-card profile-card">
        <div className="profile-banner">
          <div className="profile-avatar">
            {patientName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{patientName}</h2>
            <p>Patient Account</p>
          </div>
        </div>

        <div className="profile-information">
          <div>
            <span>Full Name</span>
            <strong>{patientName}</strong>
          </div>

          <div>
            <span>Email Address</span>
            <strong>{user.email || "Not available"}</strong>
          </div>

          <div>
            <span>Account Role</span>
            <strong>{user.role || "Patient"}</strong>
          </div>

          <div>
            <span>Patient ID</span>
            <strong>{user.profileId || "Not available"}</strong>
          </div>
        </div>

        <p className="profile-note">
          Your profile information is retrieved from your authenticated
          account. Profile editing can be added when the backend supports it.
        </p>
      </div>
    );
  }

  function renderActiveSection() {
    switch (activeSection) {
      case "appointments":
        return renderAppointments();

      case "records":
        return renderMedicalRecords();

      case "notifications":
        return renderNotifications();

      case "doctors":
        return renderDoctors();

      case "clinic":
        return renderClinicInformation();

      case "profile":
        return renderProfile();

      default:
        return renderDashboardHome();
    }
  }

  return (
    <div className="patient-layout">
      <PatientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        patientName={patientName}
        menuItems={menuItems}
        activeSection={activeSection}
        unreadCount={unreadCount}
        onSectionChange={changeSection}
        onLogout={handleLogout}
      />

      <div className="patient-main">
        <PatientTopbar
          patientName={patientName}
          title={sectionTitles[activeSection]}
          unreadCount={unreadCount}
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenNotifications={() => changeSection("notifications")}
          onOpenProfile={() => changeSection("profile")}
        />

        <main className="patient-content">
          {success && (
            <div className="dashboard-alert success-alert">
              <span>✓</span>
              {success}
              <button onClick={() => setSuccess("")}>×</button>
            </div>
          )}

          {error && (
            <div className="dashboard-alert error-alert">
              <span>!</span>
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}

          {loading ? (
            <div className="dashboard-loading">
              <div className="loading-spinner" />
              <p>Loading your dashboard...</p>
            </div>
          ) : (
            renderActiveSection()
          )}
        </main>

        <footer className="patient-footer">
          © {new Date().getFullYear()} CarePoint. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default PatientDashboard;