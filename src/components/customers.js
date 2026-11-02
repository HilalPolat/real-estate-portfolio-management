import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../assets/css/customers.css";

const API = "http://localhost:5000";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  budget_max: "",
  notes: "",
};

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await axios.get(`${API}/api/customers`, {
        withCredentials: true,
      });
      setCustomers(res.data.customers || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Müşteriler alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(s),
    );
  }, [customers, q]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault(); // formun sayfayı yenilemesini engelliyor
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        budget_max: form.budget_max === "" ? null : Number(form.budget_max),
        notes: form.notes?.trim() ? form.notes : null,
      };
      const res = await axios.post(`${API}/api/customers`, payload, {
        withCredentials: true,
      });
      setCustomers((prev) => [res.data.customer, ...prev]);
      setSuccess("Müşteri başarıyla eklendi ✅");
      setForm(emptyForm);
    } catch (err) {
      setError(err?.response?.data?.message || "Müşteri eklenemedi");
    }
  };

  const openEdit = (customer) => {
    setError("");
    setSuccess("");
    setEditId(customer.id);
    setEditForm({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      budget_max: customer.budget_max ?? "",
      notes: customer.notes ?? "",
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    if (savingEdit) return;
    setIsEditOpen(false);
    setEditId(null);
    setEditForm(emptyForm);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editId) return;
    setSavingEdit(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...editForm,
        budget_max:
          editForm.budget_max === "" ? null : Number(editForm.budget_max),
        notes: editForm.notes?.trim() ? editForm.notes : null,
      };
      const res = await axios.put(`${API}/api/customers/${editId}`, payload, {
        withCredentials: true,
      });
      const updated = res.data.customer;
      setCustomers((prev) => prev.map((c) => (c.id === editId ? updated : c)));
      setSuccess("Müşteri güncellendi ✅");
      setIsEditOpen(false);
      setEditId(null);
      setEditForm(emptyForm);
    } catch (err) {
      setError(err?.response?.data?.message || "Güncelleme başarısız");
    } finally {
      setSavingEdit(false);
    }
  };

  const openDelete = (customer) => {
    setError("");
    setSuccess("");
    setDeleteTarget(customer);
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
      await axios.delete(`${API}/api/customers/${deleteTarget.id}`, {
        withCredentials: true,
      });
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setSuccess("Müşteri silindi ✅");
      closeDelete();
    } catch (err) {
      setError(err?.response?.data?.message || "Silme başarısız");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="customers-page-title fw-bold mb-1">Müşteriler</h2>
          <p className="customers-page-subtitle mb-0">
            Müşteri ekleyin ve yönetin.
          </p>
        </div>
        <div style={{ maxWidth: 320 }} className="w-100">
          <input
            className="customers-search w-100"
            placeholder="🔍  Ad veya soyad ara..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      {error && <div className="customers-alert-danger mb-3">{error}</div>}
      {success && <div className="customers-alert-success mb-3">{success}</div>}

      <div className="customers-card mb-4">
        <div className="customers-card-title">
          <i className="bi bi-person-plus"></i> Yeni Müşteri Ekle
        </div>

        <form onSubmit={handleAdd}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="customers-label">Ad</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={onChange}
                className="customers-input"
                placeholder="Örn: Ahmet"
                required
              />
            </div>

            <div className="col-md-4">
              <label className="customers-label">Soyad</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={onChange}
                className="customers-input"
                placeholder="Örn: Yılmaz"
                required
              />
            </div>

            <div className="col-md-4">
              <label className="customers-label">E-posta</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="customers-input"
                placeholder="ornek@mail.com"
                required
              />
            </div>

            <div className="col-md-4">
              <label className="customers-label">Telefon</label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className="customers-input"
                placeholder="05555555555"
                required
              />
              <div className="customers-form-text">Sadece rakam</div>
            </div>

            <div className="col-md-4">
              <label className="customers-label">Maks. Bütçe (₺)</label>
              <input
                type="number"
                name="budget_max"
                value={form.budget_max}
                onChange={onChange}
                className="customers-input"
                placeholder="Örn: 3500000"
                min="0"
              />
            </div>

            <div className="col-md-4">
              <label className="customers-label">Not (opsiyonel)</label>
              <input
                name="notes"
                value={form.notes}
                onChange={onChange}
                className="customers-input"
                placeholder="Örn: Çankaya'da 2+1 daire bakıyor..."
              />
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 mt-2">
              <button
                type="button"
                className="btn-customers-secondary"
                onClick={() => setForm(emptyForm)}
              >
                Temizle
              </button>
              <button type="submit" className="btn-customers-primary">
                <i className="bi bi-plus-lg me-1"></i> Müşteri Ekle
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold mb-0" style={{ color: "var(--dark)" }}>
          Tüm Müşteriler
        </h5>
        <span className="customers-count">{filtered.length} kayıt</span>
      </div>

      {loading ? (
        <div className="customers-alert-empty">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="customers-alert-empty">
          <i className="bi bi-search me-2"></i> Müşteri bulunamadı.
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((c) => (
            <div className="col-12 col-md-6 col-xl-4" key={c.id}>
              <div className="customer-card">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div className="customer-card-name">
                      {c.first_name} {c.last_name}
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <button
                      className="btn-card-edit"
                      onClick={() => openEdit(c)}
                    >
                      <i className="bi bi-pencil me-1"></i>Düzenle
                    </button>
                    <button
                      className="btn-card-delete"
                      onClick={() => openDelete(c)}
                    >
                      <i className="bi bi-trash me-1"></i>Sil
                    </button>
                  </div>
                </div>

                <hr className="customer-card-divider" />

                <div className="d-flex flex-column gap-2">
                  <div>
                    <span className="customer-info-label">E-posta </span>
                    <span className="customer-info-value">{c.email}</span>
                  </div>
                  <div>
                    <span className="customer-info-label">Telefon </span>
                    <span className="customer-info-value">{c.phone}</span>
                  </div>
                  <div>
                    <span className="customer-info-label">Maks. Bütçe </span>
                    <span className="customer-info-value">
                      {c.budget_max
                        ? `${Number(c.budget_max).toLocaleString("tr-TR")} ₺`
                        : "—"}
                    </span>
                  </div>
                  {c.notes && (
                    <div className="customer-notes-box">
                      <div className="customer-notes-label">Not</div>
                      <div className="customer-notes-text">{c.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditOpen && (
        <>
          <div
            className="modal fade show customers-modal"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-pencil-square me-2"></i>Müşteri Düzenle
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
                      <div className="col-md-6">
                        <label className="customers-label">Ad</label>
                        <input
                          name="first_name"
                          value={editForm.first_name}
                          onChange={onEditChange}
                          className="customers-input"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="customers-label">Soyad</label>
                        <input
                          name="last_name"
                          value={editForm.last_name}
                          onChange={onEditChange}
                          className="customers-input"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="customers-label">E-posta</label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={onEditChange}
                          className="customers-input"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="customers-label">Telefon</label>
                        <input
                          name="phone"
                          value={editForm.phone}
                          onChange={onEditChange}
                          className="customers-input"
                          required
                        />
                        <div className="customers-form-text">
                          Sadece rakam (10-15 hane).
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="customers-label">
                          Maks. Bütçe (₺)
                        </label>
                        <input
                          type="number"
                          name="budget_max"
                          value={editForm.budget_max}
                          onChange={onEditChange}
                          className="customers-input"
                          min="0"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="customers-label">
                          Not (opsiyonel)
                        </label>
                        <input
                          name="notes"
                          value={editForm.notes}
                          onChange={onEditChange}
                          className="customers-input"
                          placeholder="Örn: Keçiören'de daire bakıyor..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer gap-2">
                    <button
                      type="button"
                      className="btn-customers-secondary"
                      onClick={closeEdit}
                      disabled={savingEdit}
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="btn-customers-primary"
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
            className="modal fade show customers-modal"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-trash me-2"></i>Müşteriyi Sil
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
                      {deleteTarget.first_name} {deleteTarget.last_name}
                    </strong>{" "}
                    müşterisini silmek istediğinize emin misiniz?
                  </p>
                  <div className="delete-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>Bu işlem
                    geri alınamaz.
                  </div>
                </div>
                <div className="modal-footer gap-2">
                  <button
                    type="button"
                    className="btn-customers-secondary"
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
                    {deleting ? "Siliniyor..." : "Evet, Sil"}
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

export default Customers;
