
import { useState } from "react";

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  phone: "",
  age: "",
  gender: "",
};

function createForm(patient) {
  if (!patient) {
    return EMPTY_FORM;
  }

  return {
    username: patient.name || patient.username || "",
    email: patient.user?.email || patient.email || "",
    password: "",
    phone: patient.phone || "",
    age: patient.age ?? "",
    gender: patient.gender || "",
  };
}

function PatientForm({ patient, saving, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => createForm(patient));
  const [previousPatient, setPreviousPatient] = useState(patient);
  const isEditing = Boolean(patient);

  if (patient !== previousPatient) {
    setPreviousPatient(patient);
    setForm(createForm(patient));
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      username: form.username.trim(),
      phone: form.phone.trim(),
    };

    if (form.age !== "") {
      payload.age = Number(form.age);
    }

    if (form.gender) {
      payload.gender = form.gender;
    }

    if (!isEditing) {
      payload.email = form.email.trim();
      payload.password = form.password;
    }

    onSubmit(payload);
  }

  return (
    <div className="admin-modal-backdrop" onMouseDown={onCancel}>
      <form
        className="admin-modal"
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-heading">
          <div>
            <small>PATIENT MANAGEMENT</small>
            <h2>{isEditing ? "Edit patient" : "Add a patient"}</h2>
            <p>
              {isEditing
                ? "Update the patient's personal information."
                : "Create a patient login and personal profile."}
            </p>
          </div>

          <button
            type="button"
            className="admin-modal-close"
            onClick={onCancel}
            aria-label="Close"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <div className="admin-form-grid">
          <label>
            Patient name
            <input
              name="username"
              value={form.username}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Phone number
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required={!isEditing}
              readOnly={isEditing}
            />
          </label>

          {!isEditing && (
            <label>
              Password
              <input
                name="password"
                type="password"
                minLength="6"
                value={form.password}
                onChange={updateField}
                required
              />
            </label>
          )}

          <label>
            Age
            <input
              name="age"
              type="number"
              min="0"
              value={form.age}
              onChange={updateField}
            />
          </label>

          <label>
            Gender
            <select
              name="gender"
              value={form.gender}
              onChange={updateField}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-button secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-button primary"
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Create patient"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientForm;
