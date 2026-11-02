import React, { useMemo } from "react";
import { getCities, getDistrictsByCityCode } from "turkey-neighbourhoods";
import "../assets/css/portfolioFilter.css";

const cities = getCities();

const PortfolioFilter = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
  totalCount,
}) => {
  const selectedCityCode = useMemo(() => {
    return cities.find((city) => city.name === filters.city)?.code || "";
  }, [filters.city]);

  const availableDistricts = useMemo(() => {
    return selectedCityCode ? getDistrictsByCityCode(selectedCityCode) : [];
  }, [selectedCityCode]);

  return (
    <div className="pf-filter-bar">
      <div className="container">
        <div className="pf-filter-top">
          <div className="pf-toggle-wrap">
            <button
              type="button"
              className={`pf-toggle-btn ${
                filters.listingType === "" ? "active" : ""
              }`}
              onClick={() => onFilterChange("listingType", "")}
            >
              Tümü
            </button>

            <button
              type="button"
              className={`pf-toggle-btn ${
                filters.listingType === "satilik" ? "active" : ""
              }`}
              onClick={() => onFilterChange("listingType", "satilik")}
            >
              Satılık
            </button>

            <button
              type="button"
              className={`pf-toggle-btn ${
                filters.listingType === "kiralik" ? "active" : ""
              }`}
              onClick={() => onFilterChange("listingType", "kiralik")}
            >
              Kiralık
            </button>
          </div>

          <div className="pf-fields-wrap">
            <div className="row g-0 pf-fields-row">
              <div className="col-12 col-sm-6 col-lg field-col">
                <label className="pf-label">Emlak Tipi</label>
                <select
                  className="pf-select"
                  value={filters.propertyType}
                  onChange={(e) =>
                    onFilterChange("propertyType", e.target.value)
                  }
                >
                  <option value="">Tümü</option>
                  <option value="daire">Daire</option>
                  <option value="villa">Villa</option>
                  <option value="arsa">Arsa</option>
                  <option value="ofis">Ofis</option>
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg field-col">
                <label className="pf-label">İl</label>
                <select
                  className="pf-select"
                  value={filters.city}
                  onChange={(e) => {
                    onFilterChange("city", e.target.value);
                    onFilterChange("district", "");
                  }}
                >
                  <option value="">Tüm İller</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg field-col">
                <label className="pf-label">İlçe</label>
                <select
                  className="pf-select"
                  value={filters.district}
                  onChange={(e) => onFilterChange("district", e.target.value)}
                  disabled={!filters.city}
                >
                  <option value="">Tüm İlçeler</option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg field-col">
                <label className="pf-label">Oda Sayısı</label>
                <select
                  className="pf-select"
                  value={filters.roomCount || ""}
                  onChange={(e) => onFilterChange("roomCount", e.target.value)}
                >
                  <option value="">Tümü</option>
                  <option value="1+0">1+0</option>
                  <option value="1+1">1+1</option>
                  <option value="2+1">2+1</option>
                  <option value="3+1">3+1</option>
                  <option value="4+1">4+1</option>
                  <option value="5+1">5+1</option>
                  <option value="6+1">6+1</option>
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg field-col">
                <label className="pf-label">Maksimum Fiyat</label>
                <input
                  type="number"
                  className="pf-input"
                  placeholder="Örn: 5000000"
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                  min="0"
                />
              </div>

              <div className="col-12 col-sm-6 col-lg field-col field-col--last">
                <label className="pf-label">Sıralama</label>
                <select
                  className="pf-select"
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange("sortBy", e.target.value)}
                >
                  <option value="newest">En Yeni</option>
                  <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="m2_desc">En Büyük m²</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pf-actions">
            <button type="button" className="pf-search-btn" onClick={onApply}>
              <i className="bi bi-search"></i> Ara
            </button>

            <button type="button" className="pf-reset-btn" onClick={onReset}>
              <i className="bi bi-x-circle"></i> Temizle
            </button>
          </div>
        </div>

        <div className="pf-filter-result-count">
          <span>{totalCount}</span> ilan listeleniyor
        </div>
      </div>
    </div>
  );
};

export default PortfolioFilter;