import React from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000";

const typeLabel = (type) => {
  if (type === "daire") return "Daire";
  if (type === "villa") return "Villa";
  if (type === "arsa") return "Arsa";
  if (type === "ofis") return "Ofis";
  return type;
};

const getImageSrc = (pathOrUrl) => {
  if (!pathOrUrl) return "";

  if (
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://") ||
    pathOrUrl.startsWith("blob:")
  ) {
    return pathOrUrl;
  }

  return `${API}${pathOrUrl}`;
};

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[ğ]/g, "g")
    .replace(/[ü]/g, "u")
    .replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

const getStatusLabel = (status) => {
  if (status === "satildi") return "SATILDI";
  if (status === "kiralandi") return "KİRALANDI";
  return "";
};

const PortfolioCardContent = ({ item }) => {
  const isRental = item.listing_type === "kiralik";
  const isPassive = item.status && item.status !== "aktif";

  return (
    <div className={`pf-card ${isPassive ? "pf-card-passive" : ""}`}>
      <div className="pf-card-img-wrap">
        {item.image_path ? (
          <img
            src={getImageSrc(item.image_path)}
            alt={typeLabel(item.property_type)}
            className={`pf-card-img ${isPassive ? "pf-card-img-passive" : ""}`}
          />
        ) : (
          <div className="pf-card-img-placeholder">
            <i className="bi bi-image"></i>
          </div>
        )}

        <div className="pf-card-overlay"></div>

        <span
          className={`pf-badge-type ${
            isRental ? "pf-badge-rental" : "pf-badge-sale"
          }`}
        >
          {isRental ? "Kiralık" : "Satılık"}
        </span>

        {isPassive && (
          <div className="pf-status-overlay">{getStatusLabel(item.status)}</div>
        )}

        <div className="pf-card-img-content">
          <div className="pf-card-price">
            ₺{Number(item.price).toLocaleString("tr-TR")}
            {isRental && <span className="pf-card-price-period"> / ay</span>}
          </div>

          <div className="pf-card-name">{typeLabel(item.property_type)}</div>

          <div className="pf-card-location">
            <i className="bi bi-geo-alt-fill"></i>
            {item.district}, {item.city}
          </div>
        </div>
      </div>

      <div className="pf-card-footer">
        <div className="pf-card-meta">
          <span className="pf-card-meta-item">
            <i className="bi bi-aspect-ratio"></i>
            {item.gross_m2} m²
          </span>

          {item.room_count && (
            <span className="pf-card-meta-item">
              <i className="bi bi-door-open"></i>
              {item.room_count} Oda
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const PortfolioCard = ({ item }) => {
  const slug = slugify(
    `${typeLabel(item.property_type)}-${item.city}-${item.district}-${item.id}`
  );

  const isPassive = item.status && item.status !== "aktif";

  if (isPassive) {
    return (
      <div className="portfolio-card-link portfolio-card-link-disabled">
        <PortfolioCardContent item={item} />
      </div>
    );
  }

  return (
    <Link to={`/portfolio/${slug}`} className="portfolio-card-link">
      <PortfolioCardContent item={item} />
    </Link>
  );
};

export default PortfolioCard;