function PatientTopbar({
  patientName,
  title,
  unreadCount,
  onOpenMenu,
  onOpenNotifications,
  onOpenProfile,
}) {
  return (
    <header className="patient-topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div>
          <span className="topbar-overline">PATIENT PORTAL</span>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="topbar-notification"
          onClick={onOpenNotifications}
          aria-label="Open notifications"
        >
          ♧
          {unreadCount > 0 && (
            <span className="topbar-notification-dot" />
          )}
        </button>

        <button className="topbar-user" onClick={onOpenProfile}>
          <span className="topbar-avatar">
            {patientName.charAt(0).toUpperCase()}
          </span>
          <span>
            <strong>{patientName}</strong>
            <small>Patient</small>
          </span>
        </button>
      </div>
    </header>
  );
}

export default PatientTopbar;
