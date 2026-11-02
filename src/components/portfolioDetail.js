import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import axios from "axios";
import "../assets/css/portfolioDetail.css";

const API = "http://localhost:5000";

const typeLabel = (type) => {
  if (type === "daire") return "Daire";
  if (type === "villa") return "Villa";
  if (type === "arsa") return "Arsa";
  if (type === "ofis") return "Ofis";
  return type;
};

const listingTypeLabel = (type) => {
  if (type === "satilik") return "Satılık";
  if (type === "kiralik") return "Kiralık";
  return type;
};

const usageLabel = (val) => {
  if (val === "bos") return "Boş";
  if (val === "kiracili") return "Kiracılı";
  if (val === "mulk_sahibi") return "Mülk Sahibi";
  return val;
};

const inSiteLabel = (val) => {
  if (val === "evet") return "Evet";
  if (val === "hayir") return "Hayır";
  return val;
};

const getImageSrc = (path) => {
  if (!path) return "";
  return `${API}${path}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const PortfolioDetail = () => {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/api/portfolio`);
        setPortfolio(res.data.portfolio || []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const item = useMemo(() => {
    if (!slug || portfolio.length === 0) return null;
    const id = Number(slug.split("-").pop());
    return portfolio.find((p) => p.id === id);
  }, [slug, portfolio]);

  useEffect(() => {
    if (!loading && !item) setNotFound(true);
  }, [loading, item]);

  if (notFound) return <Navigate to="/portfolio" />;
  if (loading) return (
    <div className="pd-loading">
      <div className="pd-loading-spinner"></div>
      <span>Yükleniyor...</span>
    </div>
  );
  if (!item) return null;

  const isRental = item.listing_type === "kiralik";

  return (
    <>
      {/* Breadcrumb */}
      <div className="pd-breadcrumb-bar">
        <div className="container">
          <nav className="pd-breadcrumb">
            <Link to="/">Ana Sayfa</Link>
            <span>›</span>
            <Link to="/ilanlar">İlanlar</Link>
            <span>›</span>
            <span className="pd-breadcrumb-current">
              {typeLabel(item.property_type)} — {item.district}, {item.city}
            </span>
          </nav>
        </div>
      </div>

      <section className="pd-section">
        <div className="container">
          <div className="row g-5 align-items-start">

            {/* SOL: GÖRSEL */}
            <div className="col-lg-7">
              <div className="pd-img-wrap">
                {item.image_path ? (
                  <img
                    src={getImageSrc(item.image_path)}
                    alt={`${typeLabel(item.property_type)} - ${item.district}`}
                    className="pd-img"
                  />
                ) : (
                  <div className="pd-img-placeholder">
                    <i className="bi bi-image"></i>
                  </div>
                )}
                <div className="pd-img-overlay"></div>

                {/* Satılık / Kiralık badge */}
                <span className={`pd-listing-badge ${isRental ? "pd-badge-rental" : "pd-badge-sale"}`}>
                  {listingTypeLabel(item.listing_type)}
                </span>

                {/* Tarih — görsel üzerinde sol alt */}
                {item.created_at && (
                  <div className="pd-img-date">
                    <i className="bi bi-calendar3"></i>
                    {formatDate(item.created_at)}
                  </div>
                )}
              </div>

              {/* Hızlı özellikler */}
              <div className="pd-quick-stats">
                {item.gross_m2 && (
                  <div className="pd-quick-stat">
                    <i className="bi bi-aspect-ratio"></i>
                    <span>{item.gross_m2} m²</span>
                    <small>Brüt Alan</small>
                  </div>
                )}
                {item.room_count && (
                  <div className="pd-quick-stat">
                    <i className="bi bi-door-open"></i>
                    <span>{item.room_count}</span>
                    <small>Oda</small>
                  </div>
                )}
                {item.bathroom_count && (
                  <div className="pd-quick-stat">
                    <i className="bi bi-droplet"></i>
                    <span>{item.bathroom_count}</span>
                    <small>Banyo</small>
                  </div>
                )}
                {item.building_age && (
                  <div className="pd-quick-stat">
                    <i className="bi bi-building"></i>
                    <span>{item.building_age}</span>
                    <small>Bina Yaşı</small>
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ: BİLGİLER */}
            <div className="col-lg-5">
              <div className="pd-info-card">

                {/* Başlık grubu */}
                <div className="pd-info-header">
                  <div className="pd-type-badge">{typeLabel(item.property_type)}</div>
                  <h1 className="pd-title">
                    {typeLabel(item.property_type)}
                    <span className="pd-title-location">
                      {item.district}, {item.city}
                    </span>
                  </h1>
                  <div className="pd-price">
                    ₺{Number(item.price).toLocaleString("tr-TR")}
                    {isRental && <span className="pd-price-period"> / ay</span>}
                  </div>
                </div>

                <div className="pd-info-divider"></div>

                {/* Detay grid */}
                <div className="pd-details-grid">
                  <DetailRow icon="bi-geo-alt-fill" label="Konum" value={`${item.district}, ${item.city}`} />
                  <DetailRow icon="bi-aspect-ratio" label="Brüt m²" value={item.gross_m2 ? `${item.gross_m2} m²` : null} />
                  <DetailRow icon="bi-door-open" label="Oda Sayısı" value={item.room_count} />
                  <DetailRow icon="bi-droplet" label="Banyo Sayısı" value={item.bathroom_count} />
                  <DetailRow icon="bi-building" label="Bina Yaşı" value={item.building_age} />
                  <DetailRow icon="bi-thermometer-half" label="Isıtma" value={item.heating} />
                  <DetailRow icon="bi-shield-check" label="Site İçerisinde" value={inSiteLabel(item.in_site)} />
                  <DetailRow icon="bi-person-check" label="Kullanım Durumu" value={usageLabel(item.usage_status)} />
                  <DetailRow icon="bi-file-earmark-text" label="Tapu Durumu" value={item.title_deed_status} />
                </div>

                <div className="pd-info-divider"></div>

                {/* CTA */}
                <div className="pd-cta">
                  <a href="tel:05555555555" className="pd-cta-btn pd-cta-primary">
                    <i className="bi bi-telephone-fill"></i>
                    Hemen Ara
                  </a>
              
                </div>

            

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

/* Detay satırı */
const DetailRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="pd-detail-row">
      <div className="pd-detail-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="pd-detail-label">{label}</div>
      <div className="pd-detail-value">{value}</div>
    </div>
  );
};

export default PortfolioDetail;