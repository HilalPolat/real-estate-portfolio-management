import "../../assets/css/header.css";

export default function Header() {
  return (
    <nav className="nav-bar d-flex align-items-center justify-content-between px-4 px-md-5">

      {/* Logo */}
      <div className="nav-logo">
        Prestij<span>Gayrimenkul</span>
      </div>

      
      <div className="nav-links d-none d-md-flex gap-4">
        <a href="/">Ana Sayfa</a>
        <a href="portfolio">İlanlar</a>
        <a href="about">Hakkımızda</a>
      </div>

      <a href="login" className="nav-btn">Admin Giriş</a>

    </nav>
  );
}
