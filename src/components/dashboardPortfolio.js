import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { getCities, getDistrictsByCityCode } from "turkey-neighbourhoods";
import "../assets/css/dashboardPortfolio.css";

const API = "http://localhost:5000";

const cities = getCities();

const heatingOptions = [
  "Yok",
  "Kombi (Doğalgaz)",
  "Merkezi Sistem",
  "Yerden Isıtma",
  "Klima",
  "Soba",
  "Elektrikli Isıtma",
];

const usageStatusOptions = ["bos", "kiracili", "mulk_sahibi"];

const titleDeedOptions = [
  "Kat Mülkiyetli",
  "Kat İrtifaklı",
  "Hisseli Tapu",
  "Müstakil Tapu",
  "Arsa Tapulu",
];

const emptyForm = {
  imageFile: null,
  imagePreview: "",
  listing_type: "satilik",
  price: "",
  property_type: "daire",
  gross_m2: "",
  room_count: "",
  city: "",
  district: "",
  heating: "Kombi (Doğalgaz)",
  in_site: "hayir",
  bathroom_count: "",
  building_age: "",
  usage_status: "bos",
  title_deed_status: "Kat Mülkiyetli",
};

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

const usageStatusLabel = (value) => {
  if (value === "bos") return "Boş";
  if (value === "kiracili") return "Kiracılı";
  if (value === "mulk_sahibi") return "Mülk Sahibi";
  return value;
};

const inSiteLabel = (value) => {
  if (value === "evet") return "Evet";
  if (value === "hayir") return "Hayır";
  return value;
};

const getPassiveStatus = (item) => {
  return item.listing_type === "kiralik" ? "kiralandi" : "satildi";
};

const getStatusLabel = (status) => {
  if (status === "satildi") return "SATILDI";
  if (status === "kiralandi") return "KİRALANDI";
  return "";
};

const getImageSrc = (pathOrUrl) => {
  if (!pathOrUrl) return "";

  if (
    pathOrUrl.startsWith("blob:") ||
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://")
  ) {
    return pathOrUrl;
  }

  return `${API}${pathOrUrl}`;
};

const clearLandSpecificFields = (prev) => ({
  ...prev,
  room_count: "",
  heating: "",
  bathroom_count: "",
  building_age: "",
});

const DashboardPortfolio = () => {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activatingId, setActivatingId] = useState(null);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const isLandForm = form.property_type === "arsa";
  const isLandEditForm = editForm.property_type === "arsa";

  const selectedCityCode = useMemo(() => {
    return cities.find((c) => c.name === form.city)?.code || "";
  }, [form.city]);

  const availableDistricts = useMemo(() => {
    return selectedCityCode ? getDistrictsByCityCode(selectedCityCode) : [];
  }, [selectedCityCode]);

  const selectedEditCityCode = useMemo(() => {
    return cities.find((c) => c.name === editForm.city)?.code || "";
  }, [editForm.city]);

  const availableEditDistricts = useMemo(() => {
    return selectedEditCityCode
      ? getDistrictsByCityCode(selectedEditCityCode)
      : [];
  }, [selectedEditCityCode]);

  const fetchPortfolio = async () => {
    setError("");
    setSuccess("");

    try {
      const res = await axios.get(`${API}/api/portfolio`, {
        withCredentials: true,
      });

      setPortfolio(res.data.portfolio || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Portföyler alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return portfolio;

    return portfolio.filter(
      (item) =>
        (item.city || "").toLowerCase().includes(s) ||
        (item.district || "").toLowerCase().includes(s) ||
        (item.property_type || "").toLowerCase().includes(s) ||
        (item.room_count || "").toLowerCase().includes(s) ||
        (item.listing_type || "").toLowerCase().includes(s) ||
        (item.heating || "").toLowerCase().includes(s) ||
        (item.title_deed_status || "").toLowerCase().includes(s) ||
        (item.status || "").toLowerCase().includes(s)
    );
  }, [portfolio, q]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setForm((prev) => ({
        ...prev,
        city: value,
        district: "",
      }));
      return;
    }

    if (name === "property_type") {
      setForm((prev) => {
        const updated = { ...prev, property_type: value };
        return value === "arsa" ? clearLandSpecificFields(updated) : updated;
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setEditForm((prev) => ({
        ...prev,
        city: value,
        district: "",
      }));
      return;
    }

    if (name === "property_type") {
      setEditForm((prev) => {
        const updated = { ...prev, property_type: value };
        return value === "arsa" ? clearLandSpecificFields(updated) : updated;
      });
      return;
    }

    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: preview,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: preview,
      }));
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      const isLand = form.property_type === "arsa";

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      formData.append("listing_type", form.listing_type);
      formData.append("price", Number(form.price));
      formData.append("property_type", form.property_type);
      formData.append("gross_m2", Number(form.gross_m2));
      formData.append("city", form.city);
      formData.append("district", form.district);
      formData.append("in_site", form.in_site);
      formData.append("usage_status", form.usage_status);
      formData.append("title_deed_status", form.title_deed_status);

      formData.append("room_count", isLand ? "" : form.room_count);
      formData.append("heating", isLand ? "" : form.heating);
      formData.append(
        "bathroom_count",
        isLand || form.bathroom_count === "" ? "" : Number(form.bathroom_count)
      );
      formData.append(
        "building_age",
        isLand || form.building_age === "" ? "" : Number(form.building_age)
      );

      const res = await axios.post(`${API}/api/portfolio`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }, //Dosya yükleme varsa kullanılıyor
      });

      setPortfolio((prev) => [res.data.portfolioItem, ...prev]);
      setSuccess("Portföy başarıyla eklendi ✅");
      setForm(emptyForm);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Portföy eklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (item) => {
    setError("");
    setSuccess("");

    setEditId(item.id);
    setEditForm({
      imageFile: null,
      imagePreview: item.image_path ? getImageSrc(item.image_path) : "",
      listing_type: item.listing_type || "satilik",
      price: item.price ?? "",
      property_type: item.property_type || "daire",
      gross_m2: item.gross_m2 ?? "",
      room_count: item.room_count || "",
      city: item.city || "",
      district: item.district || "",
      heating: item.heating || "Kombi (Doğalgaz)",
      in_site: item.in_site || "hayir",
      bathroom_count: item.bathroom_count ?? "",
      building_age: item.building_age ?? "",
      usage_status: item.usage_status || "bos",
      title_deed_status: item.title_deed_status || "Kat Mülkiyetli",
    });

    setIsEditOpen(true);
  };

  const closeEdit = () => {
    if (savingEdit) return;

    setIsEditOpen(false);
    setEditId(null);
    setEditForm(emptyForm);

    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editId) return;

    setSavingEdit(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      const isLand = editForm.property_type === "arsa";

      if (editForm.imageFile) {
        formData.append("image", editForm.imageFile);
      }

      formData.append("listing_type", editForm.listing_type);
      formData.append("price", Number(editForm.price));
      formData.append("property_type", editForm.property_type);
      formData.append("gross_m2", Number(editForm.gross_m2));
      formData.append("city", editForm.city);
      formData.append("district", editForm.district);
      formData.append("in_site", editForm.in_site);
      formData.append("usage_status", editForm.usage_status);
      formData.append("title_deed_status", editForm.title_deed_status);

      formData.append("room_count", isLand ? "" : editForm.room_count);
      formData.append("heating", isLand ? "" : editForm.heating);
      formData.append(
        "bathroom_count",
        isLand || editForm.bathroom_count === ""
          ? ""
          : Number(editForm.bathroom_count)
      );
      formData.append(
        "building_age",
        isLand || editForm.building_age === ""
          ? ""
          : Number(editForm.building_age)
      );

      const res = await axios.put(`${API}/api/portfolio/${editId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data.portfolioItem;

      setPortfolio((prev) =>
        prev.map((item) => (item.id === editId ? updated : item))
      );

      setSuccess("Portföy güncellendi ✅");
      setIsEditOpen(false);
      setEditId(null);
      setEditForm(emptyForm);

      if (editFileInputRef.current) {
        editFileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Güncelleme başarısız");
    } finally {
      setSavingEdit(false);
    }
  };

  const openDelete = (item) => {
    setError("");
    setSuccess("");
    setDeleteTarget(item);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleting) return;

    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const newStatus = getPassiveStatus(deleteTarget);

      const res = await axios.patch(
        `${API}/api/portfolio/${deleteTarget.id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      const updated = res.data.portfolioItem;

      setPortfolio((prev) =>
        prev.map((item) => (item.id === deleteTarget.id ? updated : item))
      );

      setSuccess(
        newStatus === "satildi"
          ? "Portföy satıldı olarak işaretlendi ✅"
          : "Portföy kiralandı olarak işaretlendi ✅"
      );

      closeDelete();
    } catch (err) {
      setError(err?.response?.data?.message || "Durum güncellenemedi");
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async (item) => {
    setActivatingId(item.id);
    setError("");
    setSuccess("");

    try {
      const res = await axios.patch(
        `${API}/api/portfolio/${item.id}/status`,
        { status: "aktif" },
        { withCredentials: true }
      );

      const updated = res.data.portfolioItem;

      setPortfolio((prev) => prev.map((p) => (p.id === item.id ? updated : p)));

      setSuccess("Portföy tekrar aktif hale getirildi ✅");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Portföy aktif hale getirilemedi"
      );
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="portfolio-page-title fw-bold mb-1">Portföy</h2>
          <p className="portfolio-page-subtitle mb-0">
            Yeni portföy ekleyin ve mevcut portföyleri yönetin.
          </p>
        </div>

        <div style={{ maxWidth: 320 }} className="w-100">
          <input
            className="portfolio-search"
            placeholder="🔍 İl, ilçe, emlak tipi, oda sayısı..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="portfolio-alert-danger mb-3">{error}</div>}
      {success && <div className="portfolio-alert-success mb-3">{success}</div>}

      <div className="portfolio-card mb-4">
        <div className="portfolio-card-title">
          <i className="bi bi-plus-circle"></i> Yeni Portföy Ekle
        </div>

        <form onSubmit={handleAdd}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="portfolio-label">Görsel</label>
              <div className="portfolio-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => onFileChange(e, false)}
                  required={!form.imagePreview}
                />

                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
                    alt="Önizleme"
                    className="portfolio-upload-preview"
                  />
                ) : (
                  <>
                    <div className="portfolio-upload-icon">
                      <i className="bi bi-cloud-arrow-up"></i>
                    </div>
                    <div className="portfolio-upload-text">
                      Görsel yüklemek için tıklayın
                    </div>
                    <div className="portfolio-upload-hint">
                      JPG, PNG, WEBP — Maks. 5MB
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="portfolio-label">Satılık / Kiralık</label>
                  <select
                    name="listing_type"
                    value={form.listing_type}
                    onChange={onChange}
                    className="portfolio-select"
                    required
                  >
                    <option value="satilik">Satılık</option>
                    <option value="kiralik">Kiralık</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="portfolio-label">Fiyat (₺)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={onChange}
                    className="portfolio-input"
                    placeholder="Örn: 4500000"
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="portfolio-label">Emlak Tipi</label>
                  <select
                    name="property_type"
                    value={form.property_type}
                    onChange={onChange}
                    className="portfolio-select"
                    required
                  >
                    <option value="daire">Daire</option>
                    <option value="villa">Villa</option>
                    <option value="arsa">Arsa</option>
                    <option value="ofis">Ofis</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="portfolio-label">m² (Brüt)</label>
                  <input
                    type="number"
                    name="gross_m2"
                    value={form.gross_m2}
                    onChange={onChange}
                    className="portfolio-input"
                    placeholder="Örn: 145"
                    min="1"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="portfolio-label">Oda Sayısı</label>
                  <input
                    name="room_count"
                    value={form.room_count}
                    onChange={onChange}
                    className="portfolio-input"
                    placeholder={
                      isLandForm ? "Arsa için gerekli değil" : "Örn: 3+1"
                    }
                    required={!isLandForm}
                    disabled={isLandForm}
                  />
                </div>

                <div className="col-md-6">
                  <label className="portfolio-label">İl</label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    className="portfolio-select"
                    required
                  >
                    <option value="">İl seçiniz</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="portfolio-label">İlçe</label>
                  <select
                    name="district"
                    value={form.district}
                    onChange={onChange}
                    className="portfolio-select"
                    required
                    disabled={!form.city}
                  >
                    <option value="">İlçe seçiniz</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="portfolio-label">Isıtma</label>
                  <select
                    name="heating"
                    value={isLandForm ? "" : form.heating}
                    onChange={onChange}
                    className="portfolio-select"
                    required={!isLandForm}
                    disabled={isLandForm}
                  >
                    {isLandForm ? (
                      <option value="">Arsa için gerekli değil</option>
                    ) : (
                      heatingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="portfolio-label">Site İçerisinde</label>
                  <select
                    name="in_site"
                    value={form.in_site}
                    onChange={onChange}
                    className="portfolio-select"
                    required
                  >
                    <option value="evet">Evet</option>
                    <option value="hayir">Hayır</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="portfolio-label">Banyo Sayısı</label>
                  <input
                    type="number"
                    name="bathroom_count"
                    value={form.bathroom_count}
                    onChange={onChange}
                    className="portfolio-input"
                    placeholder={
                      isLandForm ? "Arsa için gerekli değil" : "Örn: 2"
                    }
                    min="0"
                    required={!isLandForm}
                    disabled={isLandForm}
                  />
                </div>

                <div className="col-md-4">
                  <label className="portfolio-label">Bina Yaşı</label>
                  <input
                    type="number"
                    name="building_age"
                    value={form.building_age}
                    onChange={onChange}
                    className="portfolio-input"
                    placeholder={
                      isLandForm ? "Arsa için gerekli değil" : "Örn: 5"
                    }
                    min="0"
                    required={!isLandForm}
                    disabled={isLandForm}
                  />
                </div>

                <div className="col-md-4">
                  <label className="portfolio-label">Kullanım Durumu</label>
                  <select
                    name="usage_status"
                    value={form.usage_status}
                    onChange={onChange}
                    className="portfolio-select"
                    required
                  >
                    {usageStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {usageStatusLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="portfolio-label">Tapu Durumu</label>
                  <select
                    name="title_deed_status"
                    value={form.title_deed_status}
                    onChange={onChange}
                    className="portfolio-select"
                    required
                  >
                    {titleDeedOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 mt-2">
              <button
                type="button"
                className="btn-portfolio-secondary"
                onClick={() => {
                  setForm(emptyForm);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Temizle
              </button>

              <button
                type="submit"
                className="btn-portfolio-primary"
                disabled={uploading}
              >
                <i className="bi bi-plus-lg me-1"></i>
                {uploading ? "Yükleniyor..." : "Portföy Ekle"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold mb-0" style={{ color: "var(--dark)" }}>
          Tüm Portföyler
        </h5>
        <span className="portfolio-count">{filtered.length} kayıt</span>
      </div>

      {loading ? (
        <div className="portfolio-alert-empty">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="portfolio-alert-empty">
          <i className="bi bi-search me-2"></i> Portföy bulunamadı.
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((item) => {
            const isPassive = item.status && item.status !== "aktif";

            return (
              <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                <div className="portfolio-item-card">
                  <div className="portfolio-item-img-wrap">
                    {item.image_path ? (
                      <img
                        src={getImageSrc(item.image_path)}
                        alt={typeLabel(item.property_type)}
                        className={`portfolio-item-img ${
                          isPassive ? "portfolio-item-img-passive" : ""
                        }`}
                      />
                    ) : (
                      <div className="portfolio-item-img-placeholder">
                        <i className="bi bi-image"></i>
                      </div>
                    )}

                    {isPassive && (
                      <div className="portfolio-status-overlay">
                        {getStatusLabel(item.status)}
                      </div>
                    )}
                  </div>

                  <div className="portfolio-item-body">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="portfolio-item-price">
                          {Number(item.price).toLocaleString("tr-TR")} ₺
                        </div>

                        <div className="d-flex gap-2 flex-wrap mt-2">
                          <span className="portfolio-type-badge">
                            {typeLabel(item.property_type)}
                          </span>

                          <span className="portfolio-listing-badge">
                            {listingTypeLabel(item.listing_type)}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-2">
                        <button
                          className="btn-card-edit"
                          onClick={() => openEdit(item)}
                        >
                          <i className="bi bi-pencil me-1"></i>Düzenle
                        </button>

                        {!isPassive ? (
                          <button
                            className="btn-card-delete"
                            onClick={() => openDelete(item)}
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            {item.listing_type === "kiralik"
                              ? "Kiralandı"
                              : "Satıldı"}
                          </button>
                        ) : (
                          <button
                            className="btn-card-edit"
                            onClick={() => handleActivate(item)}
                            disabled={activatingId === item.id}
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            {activatingId === item.id
                              ? "Aktifleştiriliyor..."
                              : "Tekrar Aktif Yap"}
                          </button>
                        )}
                      </div>
                    </div>

                    <hr className="portfolio-item-divider" />

                    <div className="d-flex flex-column gap-2">
                      <div>
                        <span className="portfolio-info-label">
                          m² (Brüt){" "}
                        </span>
                        <span className="portfolio-info-value">
                          {item.gross_m2} m²
                        </span>
                      </div>

                      <div>
                        <span className="portfolio-info-label">
                          Oda Sayısı{" "}
                        </span>
                        <span className="portfolio-info-value">
                          {item.room_count || "-"}
                        </span>
                      </div>

                      <div>
                        <span className="portfolio-info-label">Konum </span>
                        <span className="portfolio-info-value">
                          {item.city} / {item.district}
                        </span>
                      </div>

                      <div>
                        <span className="portfolio-info-label">Isıtma </span>
                        <span className="portfolio-info-value">
                          {item.heating || "-"}
                        </span>
                      </div>

                      <div>
                        <span className="portfolio-info-label">
                          Site İçerisinde{" "}
                        </span>
                        <span className="portfolio-info-value">
                          {item.in_site ? inSiteLabel(item.in_site) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isEditOpen && (
        <>
          <div
            className="modal fade show portfolio-modal"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-pencil-square me-2"></i>Portföy Düzenle
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeEdit}
                  />
                </div>

                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="portfolio-label">
                          Görsel (değiştirmek için seçin)
                        </label>
                        <div className="portfolio-upload-area">
                          <input
                            type="file"
                            accept="image/*"
                            ref={editFileInputRef}
                            onChange={(e) => onFileChange(e, true)}
                          />
                          {editForm.imagePreview ? (
                            <img
                              src={editForm.imagePreview}
                              alt="Önizleme"
                              className="portfolio-modal-preview"
                            />
                          ) : (
                            <>
                              <div className="portfolio-upload-icon">
                                <i className="bi bi-cloud-arrow-up"></i>
                              </div>
                              <div className="portfolio-upload-text">
                                Yeni görsel seçmek için tıklayın
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="portfolio-label">
                          Satılık / Kiralık
                        </label>
                        <select
                          name="listing_type"
                          value={editForm.listing_type}
                          onChange={onEditChange}
                          className="portfolio-select"
                          required
                        >
                          <option value="satilik">Satılık</option>
                          <option value="kiralik">Kiralık</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="portfolio-label">Fiyat (₺)</label>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={onEditChange}
                          className="portfolio-input"
                          min="0"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="portfolio-label">Emlak Tipi</label>
                        <select
                          name="property_type"
                          value={editForm.property_type}
                          onChange={onEditChange}
                          className="portfolio-select"
                          required
                        >
                          <option value="daire">Daire</option>
                          <option value="villa">Villa</option>
                          <option value="arsa">Arsa</option>
                          <option value="ofis">Ofis</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="portfolio-label">m² (Brüt)</label>
                        <input
                          type="number"
                          name="gross_m2"
                          value={editForm.gross_m2}
                          onChange={onEditChange}
                          className="portfolio-input"
                          min="1"
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="portfolio-label">Oda Sayısı</label>
                        <input
                          name="room_count"
                          value={editForm.room_count}
                          onChange={onEditChange}
                          className="portfolio-input"
                          placeholder={
                            isLandEditForm
                              ? "Arsa için gerekli değil"
                              : "Örn: 3+1"
                          }
                          required={!isLandEditForm}
                          disabled={isLandEditForm}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="portfolio-label">İl</label>
                        <select
                          name="city"
                          value={editForm.city}
                          onChange={onEditChange}
                          className="portfolio-select"
                          required
                        >
                          <option value="">İl seçiniz</option>
                          {cities.map((city) => (
                            <option key={city.code} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="portfolio-label">İlçe</label>
                        <select
                          name="district"
                          value={editForm.district}
                          onChange={onEditChange}
                          className="portfolio-select"
                          required
                          disabled={!editForm.city}
                        >
                          <option value="">İlçe seçiniz</option>
                          {availableEditDistricts.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="portfolio-label">Isıtma</label>
                        <select
                          name="heating"
                          value={isLandEditForm ? "" : editForm.heating}
                          onChange={onEditChange}
                          className="portfolio-select"
                          required={!isLandEditForm}
                          disabled={isLandEditForm}
                        >
                          {isLandEditForm ? (
                            <option value="">Arsa için gerekli değil</option>
                          ) : (
                            heatingOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="portfolio-label">
                          Site İçerisinde
                        </label>
                        <select
                          name="in_site"
                          value={editForm.in_site}
                          onChange={onEditChange}
                          className="portfolio-select"
                          required
                        >
                          <option value="evet">Evet</option>
                          <option value="hayir">Hayır</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="portfolio-label">Banyo Sayısı</label>
                        <input
                          type="number"
                          name="bathroom_count"
                          value={editForm.bathroom_count}
                          onChange={onEditChange}
                          className="portfolio-input"
                          placeholder={
                            isLandEditForm
                              ? "Arsa için gerekli değil"
                              : "Örn: 2"
                          }
                          min="0"
                          required={!isLandEditForm}
                          disabled={isLandEditForm}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="portfolio-label">Bina Yaşı</label>
                        <input
                          type="number"
                          name="building_age"
                          value={editForm.building_age}
                          onChange={onEditChange}
                          className="portfolio-input"
                          placeholder={
                            isLandEditForm
                              ? "Arsa için gerekli değil"
                              : "Örn: 5"
                          }
                          min="0"
                          required={!isLandEditForm}
                          disabled={isLandEditForm}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="portfolio-label">
                          Kullanım Durumu
                        </label>
                        <select
                          name="usage_status"
                          value={editForm.usage_status}
                          onChange={onEditChange}
                          className="portfolio-select"
                          required
                        >
                          {usageStatusOptions.map((option) => (
                            <option key={option} value={option}>
                              {usageStatusLabel(option)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="portfolio-label">Tapu Durumu</label>
                        <select
                          name="title_deed_status"
                          value={editForm.title_deed_status}
                          onChange={onEditChange}
                          className="portfolio-select"
                          required
                        >
                          {titleDeedOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer gap-2">
                    <button
                      type="button"
                      className="btn-portfolio-secondary"
                      onClick={closeEdit}
                      disabled={savingEdit}
                    >
                      Vazgeç
                    </button>

                    <button
                      type="submit"
                      className="btn-portfolio-primary"
                      disabled={savingEdit}
                    >
                      {savingEdit ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" onClick={closeEdit} />
        </>
      )}

      {isDeleteOpen && deleteTarget && (
        <>
          <div
            className="modal fade show portfolio-modal"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-check-circle me-2"></i>Portföy Durumunu
                    Güncelle
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDelete}
                  />
                </div>

                <div className="modal-body">
                  <p className="mb-3" style={{ color: "var(--dark)" }}>
                    <strong>
                      {listingTypeLabel(deleteTarget.listing_type)}{" "}
                      {typeLabel(deleteTarget.property_type)} —{" "}
                      {deleteTarget.city}/{deleteTarget.district}
                    </strong>{" "}
                    portföyünü{" "}
                    {deleteTarget.listing_type === "kiralik"
                      ? "kiralandı"
                      : "satıldı"}{" "}
                    olarak işaretlemek istediğine emin misin?
                  </p>

                  <div className="delete-warning">
                    <i className="bi bi-info-circle me-2"></i>
                    Bu işlem ilanı silmez, sadece pasif duruma alır.
                  </div>
                </div>

                <div className="modal-footer gap-2">
                  <button
                    type="button"
                    className="btn-portfolio-secondary"
                    onClick={closeDelete}
                    disabled={deleting}
                  >
                    Vazgeç
                  </button>

                  <button
                    type="button"
                    className="btn-modal-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Güncelleniyor..." : "Evet, İşaretle"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" onClick={closeDelete} />
        </>
      )}
    </div>
  );
};

export default DashboardPortfolio;