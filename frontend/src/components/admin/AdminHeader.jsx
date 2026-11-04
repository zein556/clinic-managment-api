function AdminHeader({ title, adminName, onOpenMenu }) {
  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <button
          className="admin-menu-toggle"
          onClick={onOpenMenu}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <div>
          <small>ADMINISTRATION PORTAL</small>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="admin-header-user">
        <span className="admin-avatar">{adminName.charAt(0).toUpperCase()}</span>
        <span>
          <strong>{adminName}</strong>
          <small>Administrator</small>
        </span>
      </div>
    </header>
  );
}

export default AdminHeader;
