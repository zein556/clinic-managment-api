import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import DoctorForm from "../components/admin/DoctorForm";

import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../services/doctorService";

import {
  getPatients,
  deactivatePatient,
  activatePatient,
} from "../services/patientService";

import {
  getMyAppointments,
  updateAppointmentStatus,
} from "../services/appointmentService";

import { getClinic, updateClinic } from "../services/clinicService";
import "./adminDashboard.css";

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
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function AdminDashboard() {
  const [user] = useState(readUser);

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clinic, setClinic] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [savingClinic, setSavingClinic] = useState(false);

  const [busyAppointmentId, setBusyAppointmentId] = useState(null);
  const [busyPatientId, setBusyPatientId] = useState(null);

  const [doctorFormOpen, setDoctorFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [clinicForm, setClinicForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [search, setSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const adminName = user.username || user.name || "Administrator";

  const pageTitles = {
    overview: "Overview",
    doctors: "Doctor management",
    patients: "Patient management",
    appointments: "Appointments",
    clinic: "Clinic Information",
    profile: "My profile",
  };

  // Filter doctors according to the search input.
  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return doctors;

    return doctors.filter((doctor) =>
      [
        doctor.name,
        doctor.username,
        doctor.specialty,
        doctor.phone,
        doctor.user?.email,
        doctor.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [doctors, search]);

  // Filter patients according to the search input.
  const filteredPatients = useMemo(() => {
    const term = patientSearch.trim().toLowerCase();

    if (!term) return patients;

    return patients.filter((patient) =>
      [
        patient.name,
        patient.username,
        patient.phone,
        patient.user?.email,
        patient.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [patients, patientSearch]);

  const stats = useMemo(
    () => ({
      doctors: doctors.length,
      appointments: appointments.length,
      pending: appointments.filter(
        (item) => item.status === "pending"
      ).length,
      completed: appointments.filter(
        (item) => item.status === "completed"
      ).length,
    }),
    [doctors, appointments]
  );

  // Load dashboard information.
  async function loadDashboard() {
    setLoading(true);
    setError("");

    const [
      doctorResult,
      patientResult,
      appointmentResult,
      clinicResult,
    ] = await Promise.allSettled([
      getDoctors(),
      getPatients(),
      getMyAppointments(),
      getClinic(),
    ]);

    if (doctorResult.status === "fulfilled") {
      setDoctors(doctorResult.value);
    } else {
      setError(doctorResult.reason?.message || "Could not load doctors.");
    }

    if (patientResult.status === "fulfilled") {
      setPatients(patientResult.value);
    } else {
      setError((current) =>
        current
          ? `${current} Patients could not be loaded.`
          : patientResult.reason?.message || "Could not load patients."
      );
    }

    if (appointmentResult.status === "fulfilled") {
      setAppointments(appointmentResult.value);
    } else {
      setError((current) =>
        current
          ? `${current} Appointments could not be loaded.`
          : appointmentResult.reason?.message || "Could not load appointments."
      );
    }

    if (clinicResult.status === "fulfilled") {
      setClinic(clinicResult.value);
    } else {
      setError((current) =>
        current
          ? `${current} Clinic information could not be loaded.`
          : clinicResult.reason?.message ||
            "Could not load clinic information."
      );
    }

    setLoading(false);
  }

  // Load dashboard data when the component first mounts.
  useEffect(() => {
    let ignore = false;

    async function fetchDashboard() {
      setLoading(true);
      setError("");

      const [
        doctorResult,
        patientResult,
        appointmentResult,
        clinicResult,
      ] = await Promise.allSettled([
        getDoctors(),
        getPatients(),
        getMyAppointments(),
        getClinic(),
      ]);

      if (ignore) return;

      if (doctorResult.status === "fulfilled") {
        setDoctors(doctorResult.value);
      } else {
        setError(doctorResult.reason?.message || "Could not load doctors.");
      }

      if (patientResult.status === "fulfilled") {
        setPatients(patientResult.value);
      } else {
        setError((current) =>
          current
            ? `${current} Patients could not be loaded.`
            : patientResult.reason?.message || "Could not load patients."
        );
      }

      if (appointmentResult.status === "fulfilled") {
        setAppointments(appointmentResult.value);
      } else {
        setError((current) =>
          current
            ? `${current} Appointments could not be loaded.`
            : appointmentResult.reason?.message ||
              "Could not load appointments."
        );
      }

      if (clinicResult.status === "fulfilled") {
        setClinic(clinicResult.value);
      } else {
        setError((current) =>
          current
            ? `${current} Clinic information could not be loaded.`
            : clinicResult.reason?.message ||
              "Could not load clinic information."
        );
      }

      setLoading(false);
    }

    void fetchDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  function changeSection(section) {
    setActiveSection(section);
    setSidebarOpen(false);
    setError("");
    setSuccess("");
  }

  function openCreateDoctor() {
    setEditingDoctor(null);
    setDoctorFormOpen(true);
  }

  function openEditDoctor(doctor) {
    setEditingDoctor(doctor);
    setDoctorFormOpen(true);
  }

  function openClinicEditor() {
    if (!clinic) return;

    setClinicForm({
      name: clinic.name || "",
      address: clinic.address || "",
      latitude: clinic.latitude ?? "",
      longitude: clinic.longitude ?? "",
    });

    setError("");
    setSuccess("");
  }

  // Update clinic information.
  async function saveClinic(event) {
    event.preventDefault();

    setSavingClinic(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateClinic({
        name: clinicForm.name.trim(),
        address: clinicForm.address.trim(),
        latitude: Number(clinicForm.latitude),
        longitude: Number(clinicForm.longitude),
      });

      const updatedClinic = result.clinic || result;

      setClinic(updatedClinic);

      setClinicForm({
        name: updatedClinic.name || "",
        address: updatedClinic.address || "",
        latitude: updatedClinic.latitude ?? "",
        longitude: updatedClinic.longitude ?? "",
      });

      setSuccess("Clinic information updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update clinic information.");
    } finally {
      setSavingClinic(false);
    }
  }

  // Create or update a doctor.
  async function saveDoctor(payload) {
    setSavingDoctor(true);
    setError("");
    setSuccess("");

    try {
      if (editingDoctor) {
        const result = await updateDoctor(editingDoctor.id, payload);
        const updated = result.doctor || { ...editingDoctor, ...payload };

        setDoctors((items) =>
          items.map((item) =>
            item.id === editingDoctor.id ? { ...item, ...updated } : item
          )
        );

        setSuccess("Doctor information updated successfully.");
      } else {
        const result = await createDoctor(payload);

        if (result.doctor) {
          setDoctors((items) => [result.doctor, ...items]);
        } else {
          await loadDashboard();
        }

        setSuccess("Doctor account created successfully.");
      }

      setDoctorFormOpen(false);
      setEditingDoctor(null);
    } catch (err) {
      setError(err.message || "Could not save doctor.");
    } finally {
      setSavingDoctor(false);
    }
  }

  // Delete a doctor.
  async function removeDoctor(doctor) {
    const doctorName = doctor.name || doctor.username || "this doctor";

    if (
      !window.confirm(
        `Delete ${doctorName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteDoctor(doctor.id);

      setDoctors((items) =>
        items.filter((item) => item.id !== doctor.id)
      );

      setSuccess("Doctor deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete doctor.");
    }
  }

  // Deactivate a patient without deleting their information.
  async function handleDeactivatePatient(patient) {
    const patientName =
      patient.name || patient.username || "this patient";

    if (
      !window.confirm(
        `Deactivate ${patientName}? The patient's data will not be deleted.`
      )
    ) {
      return;
    }

    setBusyPatientId(patient.id);
    setError("");
    setSuccess("");

    try {
      await deactivatePatient(patient.id);

      setPatients((items) =>
        items.map((item) =>
          item.id === patient.id
            ? {
                ...item,
                user: {
                  ...item.user,
                  isActive: false,
                },
              }
            : item
        )
      );

      setSuccess("Patient account deactivated successfully.");
    } catch (err) {
      setError(err.message || "Could not deactivate patient.");
    } finally {
      setBusyPatientId(null);
    }
  }

  // Reactivate a patient account.
  async function handleActivatePatient(patient) {
    setBusyPatientId(patient.id);
    setError("");
    setSuccess("");

    try {
      await activatePatient(patient.id);

      setPatients((items) =>
        items.map((item) =>
          item.id === patient.id
            ? {
                ...item,
                user: {
                  ...item.user,
                  isActive: true,
                },
              }
            : item
        )
      );

      setSuccess("Patient account reactivated successfully.");
    } catch (err) {
      setError(err.message || "Could not reactivate patient.");
    } finally {
      setBusyPatientId(null);
    }
  }

  // Update appointment status.
  async function changeAppointmentStatus(appointment, status) {
    setBusyAppointmentId(appointment.id);
    setError("");
    setSuccess("");

    try {
      await updateAppointmentStatus(appointment.id, status);

      setAppointments((items) =>
        items.map((item) =>
          item.id === appointment.id ? { ...item, status } : item
        )
      );

      setSuccess(`Appointment marked as ${status}.`);
    } catch (err) {
      setError(err.message || "Could not update appointment.");
    } finally {
      setBusyAppointmentId(null);
    }
  }

  function logout() {
    ["token", "user", "clinic-token", "clinic-user"].forEach((key) =>
      localStorage.removeItem(key)
    );

    window.location.assign("/");
  }

  // Render doctors table.
  function renderDoctorTable() {
    if (!filteredDoctors.length) {
      return (
        <div className="admin-empty">
          No doctors match your search.
        </div>
      );
    }

    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>
                  <div className="admin-person-cell">
                    <span className="admin-person-avatar">
                      {(doctor.name || doctor.username || "D")
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <span>
                      <strong>
                        {doctor.name || doctor.username || "Doctor"}
                      </strong>
                      <small>ID: {doctor.id}</small>
                    </span>
                  </div>
                </td>

                <td>{doctor.specialty || "—"}</td>
                <td>{doctor.phone || "—"}</td>
                <td>{doctor.user?.email || doctor.email || "—"}</td>

                <td>
                  <div className="admin-row-actions">
                    <button
                      className="admin-button small secondary"
                      onClick={() => openEditDoctor(doctor)}
                    >
                      Edit
                    </button>

                    <button
                      className="admin-button small danger"
                      onClick={() => removeDoctor(doctor)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render patients table.
  function renderPatientsTable() {
    if (!filteredPatients.length) {
      return (
        <div className="admin-empty">
          No patients match your search.
        </div>
      );
    }

    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Account status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPatients.map((patient) => {
              const isActive = patient.user?.isActive !== false;
              const isBusy = busyPatientId === patient.id;

              const patientName =
                patient.name || patient.username || "Patient";

              return (
                <tr key={patient.id}>
                  <td>
                    <div className="admin-person-cell">
                      <span className="admin-person-avatar">
                        {patientName.charAt(0).toUpperCase()}
                      </span>

                      <span>
                        <strong>{patientName}</strong>
                        <small>ID: {patient.id}</small>
                      </span>
                    </div>
                  </td>

                  <td>{patient.phone || "—"}</td>

                  <td>
                    {patient.user?.email || patient.email || "—"}
                  </td>

                  <td>
                    <span
                      className={`admin-status ${
                        isActive ? "active" : "deactivated"
                      }`}
                    >
                      {isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-row-actions">
                      {isActive ? (
                        <button
                          className="admin-button small danger"
                          disabled={isBusy}
                          onClick={() => handleDeactivatePatient(patient)}
                        >
                          {isBusy ? "Please wait…" : "Deactivate"}
                        </button>
                      ) : (
                        <button
                          className="admin-button small primary"
                          disabled={isBusy}
                          onClick={() => handleActivatePatient(patient)}
                        >
                          {isBusy ? "Please wait…" : "Reactivate"}
                        </button>
                      )}
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

  // Render appointments table.
  function renderAppointments() {
    if (!appointments.length) {
      return (
        <div className="admin-empty">
          No appointments found.
        </div>
      );
    }

    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Update status</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  {appointment.patient?.name ||
                    `Patient #${appointment.patient_id || "—"}`}
                </td>

                <td>
                  {appointment.doctor?.name ||
                    `Doctor #${appointment.doctor_id || "—"}`}
                </td>

                <td>{formatDate(appointment.appointment_date)}</td>
                <td>{appointment.appointment_time || "—"}</td>

                <td>
                  <span
                    className={`admin-status ${appointment.status || "pending"}`}
                  >
                    {appointment.status || "pending"}
                  </span>
                </td>

                <td>
                  <select
                    aria-label={`Status for appointment ${appointment.id}`}
                    value={appointment.status || "pending"}
                    disabled={busyAppointmentId === appointment.id}
                    onChange={(event) =>
                      changeAppointmentStatus(
                        appointment,
                        event.target.value
                      )
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render clinic information card.
  function renderClinicCard(compact = false) {
    if (!clinic) {
      return (
        <div className="admin-empty">
          Clinic information is not available.
        </div>
      );
    }

    return (
      <article className={`admin-clinic-card ${compact ? "compact" : ""}`}>
        <div className="admin-clinic-icon">✚</div>

        <div className="admin-clinic-main">
          <span className="admin-clinic-label">CAREPOINT CLINIC</span>
          <h2>{clinic.name}</h2>
          <p>{clinic.address}</p>

          {!compact && (
            <div className="admin-clinic-coordinates">
              <span>
                <small>Latitude</small>
                <strong>{clinic.latitude}</strong>
              </span>

              <span>
                <small>Longitude</small>
                <strong>{clinic.longitude}</strong>
              </span>
            </div>
          )}

          <div className="admin-clinic-actions">
            <a
              href={
                clinic.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`
              }
              target="_blank"
              rel="noreferrer"
              className="admin-button secondary"
            >
              View on Google Maps ↗
            </a>

            {compact ? (
              <button
                className="admin-button primary"
                onClick={() => changeSection("clinic")}
              >
                View details
              </button>
            ) : (
              <button
                className="admin-button primary"
                onClick={openClinicEditor}
              >
                Edit clinic information
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Render clinic section.
  function renderClinicSection() {
    if (!clinic) {
      return (
        <div className="admin-empty">
          Clinic information is not available.
        </div>
      );
    }

    return (
      <>
        <div className="admin-section-heading">
          <div>
            <h2>Clinic Information</h2>
            <p>View and manage the information of your clinic.</p>
          </div>
        </div>

        {renderClinicCard(false)}

        <div className="admin-section-heading admin-clinic-doctors-heading">
          <div>
            <h2>Doctors at the clinic</h2>
            <p>Doctors currently associated with this clinic.</p>
          </div>

          <span className="admin-count">
            {clinic.doctors?.length || 0} doctors
          </span>
        </div>

        {clinic.doctors?.length ? (
          <div className="admin-clinic-doctors">
            {clinic.doctors.map((doctor) => (
              <article className="admin-clinic-doctor" key={doctor.id}>
                <span className="admin-person-avatar">
                  {(doctor.name || "D").charAt(0).toUpperCase()}
                </span>

                <div>
                  <strong>{doctor.name}</strong>
                  <small>{doctor.specialty || "General"}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty">
            No doctors are currently associated with this clinic.
          </div>
        )}
      </>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        activeSection={activeSection}
        onChangeSection={changeSection}
        onLogout={logout}
        adminName={adminName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main">
        <AdminHeader
          title={pageTitles[activeSection]}
          adminName={adminName}
          onOpenMenu={() => setSidebarOpen(true)}
        />

        <section className="admin-content">
          {error && (
            <div className="admin-alert error" role="alert">
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}

          {success && (
            <div className="admin-alert success" role="status">
              {success}
              <button onClick={() => setSuccess("")}>×</button>
            </div>
          )}

          {loading ? (
            <div className="admin-loading">
              Loading clinic information…
            </div>
          ) : (
            <>
              {activeSection === "overview" && (
                <>
                  <div className="admin-welcome">
                    <div>
                      <span>CAREPOINT CONTROL CENTER</span>
                      <h2>Welcome back, {adminName}</h2>
                      <p>
                        Here is the current activity across your clinic.
                      </p>
                    </div>

                    <span className="admin-welcome-mark">✚</span>
                  </div>

                  <div className="admin-stat-grid">
                    {[
                      ["Registered doctors", stats.doctors, "Doctors in the clinic", "✚"],
                      ["Total appointments", stats.appointments, "All scheduled visits", "▦"],
                      ["Pending appointments", stats.pending, "Awaiting action", "◷"],
                      ["Completed appointments", stats.completed, "Finished consultations", "✓"],
                    ].map(([label, value, note, icon]) => (
                      <article className="admin-stat-card" key={label}>
                        <span>{icon}</span>
                        <div>
                          <small>{label}</small>
                          <strong>{value}</strong>
                          <em>{note}</em>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="admin-section-heading">
                    <div>
                      <h2>Clinic overview</h2>
                      <p>Quick access to your clinic information.</p>
                    </div>
                  </div>

                  {renderClinicCard(true)}

                  <div className="admin-section-heading">
                    <div>
                      <h2>Quick actions</h2>
                      <p>Manage the clinic from one place.</p>
                    </div>
                  </div>

                  <div className="admin-quick-actions">
                    <button
                      onClick={() => {
                        changeSection("doctors");
                        openCreateDoctor();
                      }}
                    >
                      <span>✚</span>
                      <strong>Add a doctor</strong>
                      <small>Create a doctor account and profile</small>
                    </button>

                    <button onClick={() => changeSection("appointments")}>
                      <span>▦</span>
                      <strong>View appointments</strong>
                      <small>Review bookings and their status</small>
                    </button>
                  </div>
                </>
              )}

              {activeSection === "doctors" && (
                <>
                  <div className="admin-section-heading admin-doctors-heading">
                    <div>
                      <h2>Doctors</h2>
                      <p>
                        Create and maintain doctor accounts and professional
                        profiles.
                      </p>
                    </div>

                    <button
                      className="admin-button primary"
                      onClick={openCreateDoctor}
                    >
                      ＋ Add doctor
                    </button>
                  </div>

                  <div className="admin-toolbar">
                    <input
                      type="search"
                      placeholder="Search by name, specialty, phone or email…"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />

                    <span>
                      {filteredDoctors.length} of {doctors.length} doctors
                    </span>
                  </div>

                  {renderDoctorTable()}
                </>
              )}

              {activeSection === "patients" && (
                <>
                  <div className="admin-section-heading">
                    <div>
                      <h2>Patients</h2>
                      <p>
                        View patients and manage their account activation
                        status.
                      </p>
                    </div>

                    <span className="admin-count">
                      {patients.length} patients
                    </span>
                  </div>

                  <div className="admin-toolbar">
                    <input
                      type="search"
                      placeholder="Search by name, phone or email..."
                      value={patientSearch}
                      onChange={(event) =>
                        setPatientSearch(event.target.value)
                      }
                    />

                    <span>
                      {filteredPatients.length} of {patients.length} patients
                    </span>
                  </div>

                  {renderPatientsTable()}
                </>
              )}

              {activeSection === "appointments" && (
                <>
                  <div className="admin-section-heading">
                    <div>
                      <h2>All appointments</h2>
                      <p>
                        Review clinic bookings and update their status.
                      </p>
                    </div>

                    <span className="admin-count">
                      {appointments.length} appointments
                    </span>
                  </div>

                  {renderAppointments()}
                </>
              )}

              {activeSection === "clinic" && renderClinicSection()}

              {activeSection === "profile" && (
                <article className="admin-profile-card">
                  <span className="admin-profile-avatar">
                    {adminName.charAt(0).toUpperCase()}
                  </span>

                  <h2>{adminName}</h2>
                  <p>CarePoint Administrator</p>

                  <div>
                    <small>Email</small>
                    <strong>{user.email || "—"}</strong>
                  </div>

                  <div>
                    <small>Role</small>
                    <strong>{user.role || "admin"}</strong>
                  </div>
                </article>
              )}
            </>
          )}
        </section>
      </main>

      {doctorFormOpen && (
        <DoctorForm
          doctor={editingDoctor}
          saving={savingDoctor}
          onSubmit={saveDoctor}
          onCancel={() => {
            if (!savingDoctor) {
              setDoctorFormOpen(false);
              setEditingDoctor(null);
            }
          }}
        />
      )}

      {clinicForm.name !== "" && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal" onSubmit={saveClinic}>
            <div className="admin-modal-heading">
              <div>
                <small>CAREPOINT SETTINGS</small>
                <h2>Edit clinic information</h2>
                <p>Update the details of your clinic.</p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setClinicForm({
                    name: "",
                    address: "",
                    latitude: "",
                    longitude: "",
                  })
                }
                aria-label="Close"
                disabled={savingClinic}
              >
                ×
              </button>
            </div>

            <div className="admin-form-grid">
              <label className="admin-full-field">
                Clinic name
                <input
                  type="text"
                  value={clinicForm.name}
                  onChange={(event) =>
                    setClinicForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="admin-full-field">
                Address
                <input
                  type="text"
                  value={clinicForm.address}
                  onChange={(event) =>
                    setClinicForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  value={clinicForm.latitude}
                  onChange={(event) =>
                    setClinicForm((current) => ({
                      ...current,
                      latitude: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  value={clinicForm.longitude}
                  onChange={(event) =>
                    setClinicForm((current) => ({
                      ...current,
                      longitude: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-button secondary"
                onClick={() =>
                  setClinicForm({
                    name: "",
                    address: "",
                    latitude: "",
                    longitude: "",
                  })
                }
                disabled={savingClinic}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-button primary"
                disabled={savingClinic}
              >
                {savingClinic ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;