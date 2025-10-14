import { NavLink } from "react-router-dom";

export default function WebHeader() {
  const Env = process.env;
  return (
    <header id="header" className="header d-flex align-items-center sticky-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center">
        <NavLink to="/" className="logo d-flex align-items-center me-auto">
          <img src={Env.REACT_APP_PROJECT_ICON} alt="" />
          <h1 className="sitename">{Env.REACT_APP_PROJECT_NAME}</h1>
        </NavLink>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/team"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Team
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/services"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Services
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/companys"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Companys
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/jobboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Job Board
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/feedback"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Feed Back
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Contact
              </NavLink>
            </li>
            
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>
      </div>
    </header>
  );
}
