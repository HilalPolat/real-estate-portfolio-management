import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PortfolioCard from "../components/portfolioCards";
import PortfolioFilter from "../components/portfolioFilter";
import "../assets/css/portfolio.css";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

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

const typeLabel = (type) => {
  if (type === "daire") return "Daire";
  if (type === "villa") return "Villa";
  if (type === "arsa") return "Arsa";
  if (type === "ofis") return "Ofis";
  return type || "-";
};

const listingTypeLabel = (type) => {
  if (type === "satilik") return "Satılık";
  if (type === "kiralik") return "Kiralık";
  return type || "-";
};

const usageLabel = (val) => {
  if (val === "bos") return "Boş";
  if (val === "kiracili") return "Kiracılı";
  if (val === "mulk_sahibi") return "Mülk Sahibi";
  return val || "-";
};

const inSiteLabel = (val) => {
  if (val === "evet") return "Evet";
  if (val === "hayir") return "Hayır";
  return val || "-";
};

const formatPrice = (price, listingType) => {
  const formatted = Number(price || 0).toLocaleString("tr-TR");
  return listingType === "kiralik" ? `${formatted} ₺ / ay` : `${formatted} ₺`;
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  return `${API}${imagePath}`;
};

const imageToBase64 = async (url) => {
  if (!url) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");

        const maxWidth = 300;
        const maxHeight = 220;

        let width = img.width;
        let height = img.height;

        if (width > height && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      } catch (error) {
        console.error("Görsel PDF formatına çevrilemedi:", error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.error("Görsel yüklenemedi:", url);
      resolve(null);
    };

    img.src = url;
  });
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(`${API}/api/portfolio`);
        setPortfolio(res.data.portfolio || []);
      } catch (err) {
        setError("İlanlar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const filtered = useMemo(() => {
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
        result.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }

    return result;
  }, [portfolio, appliedFilters]);

  const handleDownloadPdf = async () => {
    if (filtered.length === 0) {
      alert("PDF oluşturmak için listelenen ilan bulunamadı.");
      return;
    }

    setPdfLoading(true);

    try {
      const rowsWithImages = await Promise.all(
        filtered.map(async (item) => {
          const imageBase64 = await imageToBase64(getImageUrl(item.image_path));

          return [
            imageBase64
              ? {
                  image: imageBase64,
                  width: 65,
                  height: 45,
                  fit: [65, 45],
                }
              : { text: "Görsel yok", fontSize: 6 },
            listingTypeLabel(item.listing_type),
            typeLabel(item.property_type),
            `${item.city || "-"} / ${item.district || "-"}`,
            formatPrice(item.price, item.listing_type),
            item.gross_m2 ? `${item.gross_m2} m²` : "-",
            item.room_count || "-",
            item.bathroom_count || "-",
            item.building_age || "-",
            item.heating || "-",
            inSiteLabel(item.in_site),
            usageLabel(item.usage_status),
            item.title_deed_status || "-",
          ];
        }),
      );

      const tableBody = [
        [
          "Görsel",
          "İlan Tipi",
          "Emlak Tipi",
          "Konum",
          "Fiyat",
          "m²",
          "Oda",
          "Banyo",
          "Bina Yaşı",
          "Isıtma",
          "Site",
          "Kullanım",
          "Tapu",
        ],
        ...rowsWithImages,
      ];

      const docDefinition = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [18, 25, 18, 25],

        content: [
          {
            text: "Prestij Gayrimenkul",
            fontSize: 18,
            bold: true,
            color: "#423021",
            margin: [0, 0, 0, 4],
          },
          {
            text: "Filtrelenen İlanlar PDF Raporu",
            fontSize: 12,
            color: "#63503e",
            margin: [0, 0, 0, 12],
          },
          {
            columns: [
              {
                text: `Toplam İlan: ${filtered.length}`,
                bold: true,
                color: "#423021",
              },
              {
                text: `Oluşturulma Tarihi: ${formatDate(new Date())}`,
                alignment: "right",
                color: "#63503e",
              },
            ],
            margin: [0, 0, 0, 14],
          },
          {
            table: {
              headerRows: 1,
              widths: [
                70,
                "auto",
                "auto",
                "*",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
              ],
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex) => {
                if (rowIndex === 0) return "#423021";
                return rowIndex % 2 === 0 ? "#f7f3ef" : null;
              },
              hLineColor: () => "#d8c9ba",
              vLineColor: () => "#d8c9ba",
              paddingLeft: () => 4,
              paddingRight: () => 4,
              paddingTop: () => 5,
              paddingBottom: () => 5,
            },
          },
        ],

        defaultStyle: {
          fontSize: 7,
        },
      };

      docDefinition.content[3].table.body[0] =
        docDefinition.content[3].table.body[0].map((cell) => ({
          text: cell,
          bold: true,
          color: "white",
        }));

      pdfMake
        .createPdf(docDefinition)
        .download(`prestij-gayrimenkul-ilanlar-${Date.now()}.pdf`);
    } catch (error) {
      console.error(error);
      alert("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <section className="pf-hero">
        <div className="container">
          <div className="pf-breadcrumb">
            Ana Sayfa <span>›</span> İlanlar
          </div>

          <h1 className="pf-hero-title">Tüm İlanlar</h1>

          <p className="pf-hero-subtitle">
            Türkiye'nin seçkin satılık ve kiralık gayrimenkullerini keşfedin.
          </p>
        </div>
      </section>

      <PortfolioFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApply}
        onReset={handleReset}
        totalCount={filtered.length}
      />

      <section className="pf-list-section">
        <div className="container">
          {error && <div className="pf-alert-danger">{error}</div>}

          {!loading && filtered.length > 0 && (
            <div className="pf-pdf-actions">
              <div className="pf-pdf-info">
                <strong>{filtered.length}</strong> ilan listeleniyor.
              </div>

              <button
                className="pf-pdf-btn"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                <i className="bi bi-file-earmark-pdf"></i>
                {pdfLoading ? "PDF Hazırlanıyor..." : "PDF Olarak İndir"}
              </button>
            </div>
          )}

          {loading ? (
            <div className="pf-loading">
              <div className="pf-loading-spinner"></div>
              <span>İlanlar yükleniyor...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="pf-empty">
              <i className="bi bi-search"></i>
              <p>Filtrelere uygun ilan bulunamadı.</p>
              <button className="pf-empty-reset" onClick={handleReset}>
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((item) => (
                <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                  <PortfolioCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Portfolio;
