import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PortfolioFilter from "../components/portfolioFilter";
import "../assets/css/home.css";

const API = "http://localhost:5000";

const defaultFilters = {
  listingType: "",
  propertyType: "",
  city: "",
  district: "",
  roomCount: "",
  maxPrice: "",
  sortBy: "newest",
};

const whyUs = [
  {
    icon: "🏆",
    title: "Güvenilir Hizmet",
    desc: "15 yıllık deneyimimiz ve yüzlerce mutlu müşterimizle Ankara'nın en güvenilir gayrimenkul danışmanlığını sunuyoruz.",
  },
  {
    icon: "🔍",
    title: "Uzman Kadro",
    desc: "Alanında uzman danışmanlarımız, ihtiyacınıza en uygun mülkü bulmak için sizinle birebir ilgilenir.",
  },
  {
    icon: "📋",
    title: "Şeffaf Süreç",
    desc: "Alım, satım ve kiralama süreçlerinde her adımı sizinle şeffaf biçimde paylaşır, sürprizlere yer bırakmayız.",
  },
];

export default function HomePage() {
  const [portfolio, setPortfolio] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const featuredSectionRef = useRef(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(`${API}/api/portfolio`);
        setPortfolio(res.data.portfolio || []);
      } catch (error) {
        console.error("Portföy verileri alınamadı:", error);
        setPortfolio([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchPortfolio();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setAppliedFilters(filters);

    setTimeout(() => {
      featuredSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);

    setTimeout(() => {
      featuredSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const normalizeImagePath = (path) => {
    if (!path || typeof path !== "string") return "";

    const trimmed = path.trim();

    if (!trimmed) return "";

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    if (trimmed.startsWith("/")) {
      return `${API}${trimmed}`;
    }

    return `${API}/${trimmed}`;
  };

  const getImageSrc = (item) => {
    let imageCandidate = "";

    if (Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];

      if (typeof firstImage === "string") {
        imageCandidate = firstImage;
      } else if (typeof firstImage === "object" && firstImage !== null) {
        imageCandidate =
          firstImage.url ||
          firstImage.image ||
          firstImage.path ||
          firstImage.image_path ||
          "";
      }
    } else if (typeof item.images === "string" && item.images.trim()) {
      try {
        const parsed = JSON.parse(item.images);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstParsed = parsed[0];

          if (typeof firstParsed === "string") {
            imageCandidate = firstParsed;
          } else if (typeof firstParsed === "object" && firstParsed !== null) {
            imageCandidate =
              firstParsed.url ||
              firstParsed.image ||
              firstParsed.path ||
              firstParsed.image_path ||
              "";
          }
        } else if (typeof parsed === "string") {
          imageCandidate = parsed;
        }
      } catch (error) {
        imageCandidate = item.images;
      }
    }

    if (!imageCandidate) {
      imageCandidate =
        item.image_path ||
        item.image ||
        item.image_url ||
        item.cover_image ||
        "";
    }

    return normalizeImagePath(imageCandidate);
  };

  const formatPrice = (price, listingType) => {
    if (price === null || price === undefined || price === "")
      return "Fiyat yok";

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) return String(price);

    const formatted = `₺${numericPrice.toLocaleString("tr-TR")}`;

    return String(listingType || "").toLowerCase() === "kiralik"
      ? `${formatted} / ay`
      : formatted;
  };

  const getLocation = (item) => {
    return (
      [item.district, item.city].filter(Boolean).join(", ") ||
      "Konum belirtilmemiş"
    );
  };

  const getRooms = (item) => {
    return (
      item.room_count ||
      item.roomCount ||
      item.room_count_text ||
      item.room ||
      item.rooms ||
      "-"
    );
  };

  const getArea = (item) => {
    return item.gross_m2 || item.net_m2 || item.area || "-";
  };

  const getTypeLabel = (item) => {
    const type = String(item.listing_type || "").toLowerCase();

    if (type === "satilik") return "Satılık";
    if (type === "kiralik") return "Kiralık";

    return item.listing_type || "";
  };

  const getDaysAgo = (dateValue) => {
    if (!dateValue) return "";

    const created = new Date(dateValue);
    if (Number.isNaN(created.getTime())) return "";

    const now = new Date();
    const diffMs = now - created;
    const day = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (day <= 0) return "Bugün";
    if (day === 1) return "1 gün önce";
    return `${day} gün önce`;
  };

  const getTag = (item, index) => {
    if (index === 0) return "Öne Çıkan";

    if (item.created_date) {
      const created = new Date(item.created_date);
      const now = new Date();
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) return "Yeni";
    }

    return null;
  };

  const filteredPortfolio = useMemo(() => {
    let result = [...portfolio];

    if (appliedFilters.listingType) {
      result = result.filter(
        (item) =>
          String(item.listing_type || "").toLowerCase() ===
          String(appliedFilters.listingType).toLowerCase(),
      );
    }

    if (appliedFilters.propertyType) {
      result = result.filter(
        (item) =>
          String(item.property_type || "").toLowerCase() ===
          String(appliedFilters.propertyType).toLowerCase(),
      );
    }

    if (appliedFilters.city) {
      result = result.filter(
        (item) =>
          String(item.city || "").toLowerCase() ===
          String(appliedFilters.city).toLowerCase(),
      );
    }

    if (appliedFilters.district) {
      result = result.filter(
        (item) =>
          String(item.district || "").toLowerCase() ===
          String(appliedFilters.district).toLowerCase(),
      );
    }

    if (appliedFilters.roomCount) {
      result = result.filter((item) => {
        const itemRoomCount =
          item.room_count ||
          item.roomCount ||
          item.room_count_text ||
          item.room ||
          item.rooms ||
          "";

        return (
          String(itemRoomCount).trim().toLowerCase() ===
          String(appliedFilters.roomCount).trim().toLowerCase()
        );
      });
    }

    if (appliedFilters.maxPrice) {
      result = result.filter(
        (item) => Number(item.price) <= Number(appliedFilters.maxPrice),
      );
    }

    switch (appliedFilters.sortBy) {
      case "price_asc":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "price_desc":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "m2_desc":
        result.sort((a, b) => Number(b.gross_m2) - Number(a.gross_m2));
        break;

      default:
        result.sort((a, b) => {
          if (a.created_date && b.created_date) {
            return new Date(b.created_date) - new Date(a.created_date);
          }
          return Number(b.id || 0) - Number(a.id || 0);
        });
        break;
    }

    return result;
  }, [portfolio, appliedFilters]);

  const featuredProperties = useMemo(() => {
    return filteredPortfolio.slice(0, 4);
  }, [filteredPortfolio]);

  return (
    <div className="hp-wrapper">
      <section className="hero position-relative overflow-hidden">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content position-relative d-flex flex-column justify-content-center h-100 px-4 px-md-5">
          <span className="hero-badge d-inline-block mb-3">
            ✦ Güvenilir Gayrimenkul
          </span>
          <h1 className="hero-title mb-3">
            Hayalinizdeki
            <br />
            <span>Mülkü</span> Keşfedin
          </h1>
          <p className="hero-sub mb-4">
            Türkiye'nin en seçkin gayrimenkullerini sizin için bir araya
            getirdik.
            <br />
            Uzman kadromuzla doğru yatırımı yapın.
          </p>
          <div>
            <Link to="/portfolio">
              <button className="hero-cta">İlanları Keşfet →</button>
            </Link>
          </div>
        </div>

        <div className="hero-stats d-none d-md-flex gap-2 position-absolute">
          {[
            ["250+", "Aktif İlan"],
            ["840+", "Mutlu Müşteri"],
            ["12+", "Yıllık Deneyim"],
          ].map(([num, label]) => (
            <div key={label} className="stat text-center">
              <div className="stat-num">{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="home-filter-wrapper">
        <PortfolioFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onApply={handleApply}
          onReset={handleReset}
          totalCount={filteredPortfolio.length}
        />
      </div>

      <section
        ref={featuredSectionRef}
        className="featured px-4 px-md-5 py-5 my-5"
      >
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            <p className="section-label mb-1">✦ Seçili İlanlar</p>
            <h2 className="section-title mb-0">Öne Çıkan Mülkler</h2>
          </div>
          <Link to="/portfolio" className="see-all">
            Tümünü Gör →
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="text-center py-4">Portföyler yükleniyor...</div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-4">
            Filtreye uygun ilan bulunamadı.
          </div>
        ) : (
          <div className="row g-4">
            {featuredProperties.map((item, index) => {
              const tag = getTag(item, index);

              return (
                <div key={item.id} className="col-12 col-sm-6 col-lg-3">
                  <Link
                    to={`/portfolio/${item.id}`}
                    className="featured-card-link"
                  >
                    <div className="prop-card h-100">
                      <div className="card-img-wrap">
                        <img
                          src={getImageSrc(item)}
                          alt={item.title || "Portföy"}
                        />
                        <div className="card-overlay" />

                        <div className="card-badges-wrap">
                          <div className="card-type-badge">
                            {getTypeLabel(item)}
                          </div>
                          <div className="card-property-badge">
                            {item.property_type
                              ? item.property_type.charAt(0).toUpperCase() +
                                item.property_type.slice(1)
                              : ""}
                          </div>
                        </div>

                        <div className="card-bottom px-3 pb-3">
                          <div className="card-price">
                            {formatPrice(item.price, item.listing_type)}
                          </div>
                          <div className="card-title-text">{item.title}</div>
                          <div className="card-location">
                            📍 {getLocation(item)}
                          </div>
                        </div>
                      </div>

                      <div className="card-info d-flex justify-content-between align-items-center px-3 py-3">
                        <div className="d-flex gap-3">
                          <span className="meta-item">
                            ⬜ {getArea(item)} m²
                          </span>
                          <span className="meta-item">
                            🛏 {getRooms(item)} Oda
                          </span>
                        </div>
                        <span className="card-date">
                          {getDaysAgo(item.created_date)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="why-us p-5 d-flex flex-column justify-content-center">
        <div className="text-center mb-5">
          <p className="section-label mb-1">✦ Fark Yaratan Hizmet</p>
          <h2 className="section-title mb-2">Neden Bizi Seçmelisiniz?</h2>
          <p className="why-sub mx-auto">
            Prestij Gayrimenkul olarak müşterilerimize sunduğumuz değerler ve
            ilkelerle sektörde fark yaratıyoruz.
          </p>
        </div>

        <div className="container">
          <div className="row g-4 justify-content-center">
            {whyUs.map((item) => (
              <div key={item.title} className="col-12 col-sm-6 col-lg-4 d-flex">
                <div className="why-card h-100 d-flex flex-column p-4 w-100">
                  <div className="why-icon mb-3">{item.icon}</div>
                  <h5 className="why-title mb-2">{item.title}</h5>
                  <p className="why-desc mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
