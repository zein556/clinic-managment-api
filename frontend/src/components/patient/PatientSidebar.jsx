function PatientSidebar({
  isOpen,
  onClose,
  patientName,
  menuItems,
  activeSection,
  unreadCount,
  onSectionChange,
  onLogout,
}) {
  return (
    <>
      {isOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}

      <aside className={`patient-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">✚</div>
          <div>
            <h2>CarePoint</h2>
            <span>Patient Portal</span>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {patientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{patientName}</strong>
            <span>Patient</span>
          </div>
        </div>

        <span className="sidebar-section-label">MENU</span>

        <nav className="sidebar-navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 && (
                <span className="sidebar-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-link logout-link" onClick={onLogout}>
            <span className="sidebar-link-icon">↪</span>
            <span>Logout</span>
          </button>

          <div className="sidebar-footer">
            <span>CarePoint</span>
            <small>Patient Management System</small>
          </div>
        </div>
      </aside>
    </>
  );
}

export default PatientSidebar;
