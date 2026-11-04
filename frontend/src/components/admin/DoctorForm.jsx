import { useEffect, useState } from "react";

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  specialty: "",
  phone: "",
};

function DoctorForm({ doctor, saving, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = Boolean(doctor);

  useEffect(() => {
    if (doctor) {
      setForm({
        username: doctor.name || doctor.username || "",
        email: doctor.user?.email || doctor.email || "",
        password: "",
        specialty: doctor.specialty || "",
        phone: doctor.phone || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [doctor]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      username: form.username.trim(),
      specialty: form.specialty.trim(),
      phone: form.phone.trim(),
    };

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
            <small>DOCTOR MANAGEMENT</small>
            <h2>{isEditing ? "Edit doctor" : "Add a doctor"}</h2>
            <p>
              {isEditing
                ? "Update the doctor's professional information."
                : "Create a doctor login and professional profile."}
            </p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div className="admin-form-grid">
          <label>
            Doctor name
            <input name="username" value={form.username} onChange={updateField} required />
          </label>
          {!isEditing && (
            <>
              <label>
                Email address
                <input name="email" type="email" value={form.email} onChange={updateField} required />
              </label>
              <label className="admin-full-field">
                Temporary password
                <input name="password" type="password" minLength="6" value={form.password} onChange={updateField} required />
              </label>
            </>
          )}
          <label>
            Specialty
            <input name="specialty" value={form.specialty} onChange={updateField} required />
          </label>
          <label>
            Phone number
            <input name="phone" type="tel" value={form.phone} onChange={updateField} required />
          </label>
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="admin-button secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="admin-button primary" disabled={saving}>
            {saving ? "Saving…" : isEditing ? "Save changes" : "Create doctor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DoctorForm;
