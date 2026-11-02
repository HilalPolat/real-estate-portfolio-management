import "../assets/css/sidebar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ page, setPage }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
      alert("Çıkış yapılırken bir hata oluştu.");
    }
  };

  return (
    <aside className="sidebar d-flex flex-column">

      {/* Brand */}
      <div className="sidebar-brand px-3 py-4 m-2">
        <div className="nav-logo">
          Prestij<span>Gayrimenkul</span>
          <small>Admin Paneli</small>
        </div>
      </div>

      <hr className="sidebar-divider my-0 mx-3" />

      {/* Nav */}
      <nav className="sidebar-nav px-2 py-3 flex-grow-1">
        <button
          type="button"
          onClick={() => setPage("home")}
          className={page === "home" ? "sidebar-link active" : "sidebar-link"}
        >
          <i className="bi bi-speedometer2"></i>
          <span>Genel Bakış</span>
        </button>

        <button
          type="button"
          onClick={() => setPage("customers")}
          className={page === "customers" ? "sidebar-link active" : "sidebar-link"}
        >
          <i className="bi bi-people"></i>
          <span>Müşteriler</span>
        </button>

        <button
          type="button"
          onClick={() => setPage("portfolio")}
          className={page === "portfolio" ? "sidebar-link active" : "sidebar-link"}
        >
          <i className="bi bi-briefcase"></i>
          <span>Portföy</span>
        </button>
      </nav>

      <hr className="sidebar-divider my-0 mx-3" />

      {/* Logout */}
      <div className="px-3 py-3">
        <button
          type="button"
          className="sidebar-logout w-100"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Çıkış Yap</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;