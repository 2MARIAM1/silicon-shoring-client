import './Sidebar.css';

const Sidebar = () => {
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

      {/* Brand */}
      <div className="sidebar-brand d-flex align-items-center justify-content-center">
        <div className="sidebar-brand-icon">
          <img src="/images/logo-wemanity-white.png" alt="Logo" style={{ width: '80%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Divider */}
      <hr className="sidebar-divider my-0" />

      {/* Collections */}
      <li className="nav-item">
        <a className="nav-link" href="/">
          <i className="fa fa-folder-open"></i>
          <span>Upload Files</span>
        </a>
      </li>

      {/* Chat Assistant */}
      <li className="nav-item">
        <a className="nav-link" href="/chat-assistant/">
          <i className="fa fa-id-badge"></i>
          <span>Chat Assistant</span>
        </a>
      </li>

    </ul>
  );
};

export default Sidebar;