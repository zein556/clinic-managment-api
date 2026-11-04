const items = [
  { id: "overview", icon: "⌂", label: "Overview" },
  { id: "doctors", icon: "✚", label: "Doctors" },
  { id: "patients", icon: "♙", label: "Patients" },
  { id: "appointments", icon: "▦", label: "Appointments" },
  { id: "clinic", icon: "✚", label: "Clinic Information" },
  { id: "profile", icon: "◉", label: "My Profile" },
];

function AdminSidebar({
  activeSection,
  onChangeSection,
  onLogout,
  adminName,
  isOpen,
  onClose,
}) {
  return (
    <>
      {isOpen && (
        <button
          className="admin-overlay"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark">✚</div>
          <div>
            <strong>CarePoint</strong>
            <small>Clinic Management</small>
          </div>
        </div>

        <div className="admin-sidebar-user">
          <span className="admin-avatar">
            {(adminName || "A").charAt(0).toUpperCase()}
          </span>
          <div>
            <strong>{adminName}</strong>
            <small>Administrator</small>
          </div>
        </div>

        <div className="admin-menu-caption">MAIN MENU</div>

        <nav className="admin-navigation">
          {items.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              onClick={() => onChangeSection(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="admin-logout" onClick={onLogout}>
          <span className="admin-nav-icon">↪</span>
          Logout
        </button>

        <div className="admin-sidebar-footer">
          © CarePoint Clinic
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;