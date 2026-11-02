import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import "../assets/css/dashboardHome.css";

const API = "http://localhost:5000";

const chartColors = ["#423021", "#63503e", "#c7b5a3", "#8a7562", "#d6c6b6"];

const typeLabel = (type) => {
  if (type === "daire") return "Daire";
  if (type === "villa") return "Villa";
  if (type === "arsa") return "Arsa";
  if (type === "ofis") return "Ofis";
  return type || "Belirtilmemiş";
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

const DashboardHome = ({ setPage }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPortfolio: 0,
    totalPortfolioValue: 0,
  });

  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentPortfolio, setRecentPortfolio] = useState([]);
  const [allPortfolio, setAllPortfolio] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [customersRes, portfolioRes] = await Promise.all([
          axios.get(`${API}/api/customers`, { withCredentials: true }),
          axios.get(`${API}/api/portfolio`, { withCredentials: true }),
        ]);

        const customers = customersRes.data.customers || [];
        const portfolio = portfolioRes.data.portfolio || [];

        const totalValue = portfolio.reduce(
          (sum, item) => sum + (Number(item.price) || 0),
          0
        );

        setStats({
          totalCustomers: customers.length,
          totalPortfolio: portfolio.length,
          totalPortfolioValue: totalValue,
        });

        setAllPortfolio(portfolio);
        setRecentCustomers([...customers].slice(0, 4));
        setRecentPortfolio([...portfolio].slice(0, 4));
      } catch (err) {
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const cityChartData = useMemo(() => {
    const cityCounts = {};

    allPortfolio.forEach((item) => {
      const city = item.city || "Belirtilmemiş";
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    return Object.entries(cityCounts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [allPortfolio]);

  const typeChartData = useMemo(() => {
    const typeCounts = {};

    allPortfolio.forEach((item) => {
      const type = typeLabel(item.property_type);
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [allPortfolio]);

  if (loading) {
    return <div className="dh-loading">Yükleniyor...</div>;
  }

  return (
    <div className="container-fluid py-4 px-4">
      <div className="dh-header mb-4">
        <div>
          <h2 className="dh-title fw-bold mb-1">Genel Bakış</h2>
          <p className="dh-subtitle mb-0">
            Hoş geldiniz. İşte güncel özet bilgiler.
          </p>
        </div>
      </div>

      {error && <div className="dh-alert-danger mb-4">{error}</div>}

      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="dh-stat-card">
            <div className="dh-stat-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="dh-stat-info">
              <div className="dh-stat-value">{stats.totalCustomers}</div>
              <div className="dh-stat-label">Toplam Müşteri</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="dh-stat-card">
            <div className="dh-stat-icon">
              <i className="bi bi-briefcase-fill"></i>
            </div>
            <div className="dh-stat-info">
              <div className="dh-stat-value">{stats.totalPortfolio}</div>
              <div className="dh-stat-label">Toplam Portföy</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="dh-stat-card">
            <div className="dh-stat-icon">
              <i className="bi bi-currency-exchange"></i>
            </div>
            <div className="dh-stat-info">
              <div className="dh-stat-value">
                {stats.totalPortfolioValue > 0
                  ? `${(stats.totalPortfolioValue / 1_000_000).toFixed(1)}M ₺`
                  : "—"}
              </div>
              <div className="dh-stat-label">Toplam Portföy Değeri</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div className="dh-section-card">
            <div className="dh-section-header">
              <div className="dh-section-title">
                <i className="bi bi-person-lines-fill"></i> Son Müşteriler
              </div>
              <button
                className="dh-section-link"
                onClick={() => setPage("customers")}
              >
                Tümünü Gör <i className="bi bi-arrow-right"></i>
              </button>
            </div>

            {recentCustomers.length === 0 ? (
              <div className="dh-empty">Henüz müşteri eklenmemiş.</div>
            ) : (
              <div className="dh-customer-list">
                {recentCustomers.map((c) => (
                  <div className="dh-customer-row" key={c.id}>
                    <div className="dh-customer-avatar">
                      {c.first_name?.charAt(0)}
                      {c.last_name?.charAt(0)}
                    </div>
                    <div className="dh-customer-info">
                      <div className="dh-customer-name">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="dh-customer-meta">{c.email}</div>
                    </div>
                    <div className="dh-customer-budget">
                      {c.budget_max
                        ? `${Number(c.budget_max).toLocaleString("tr-TR")} ₺`
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="dh-section-card">
            <div className="dh-section-header">
              <div className="dh-section-title">
                <i className="bi bi-house-fill"></i> Son Portföyler
              </div>
              <button
                className="dh-section-link"
                onClick={() => setPage("portfolio")}
              >
                Tümünü Gör <i className="bi bi-arrow-right"></i>
              </button>
            </div>

            {recentPortfolio.length === 0 ? (
              <div className="dh-empty">Henüz portföy eklenmemiş.</div>
            ) : (
              <div className="dh-portfolio-list">
                {recentPortfolio.map((item) => (
                  <div className="dh-portfolio-row" key={item.id}>
                    {item.image_path ? (
                      <img
                        src={getImageSrc(item.image_path)}
                        alt="portföy"
                        className="dh-portfolio-thumb"
                      />
                    ) : (
                      <div className="dh-portfolio-thumb-placeholder">
                        <i className="bi bi-image"></i>
                      </div>
                    )}

                    <div className="dh-portfolio-info">
                      <div className="dh-portfolio-name">
                        {typeLabel(item.property_type)} — {item.city}/
                        {item.district}
                      </div>
                      <div className="dh-portfolio-meta">
                        {item.gross_m2} m² · {item.room_count || "-"}
                      </div>
                    </div>

                    <div className="dh-portfolio-price">
                      {Number(item.price).toLocaleString("tr-TR")} ₺
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dh-analytics-title mb-3">
        <h5 className="fw-bold mb-1">Portföy Analizleri</h5>
        <p className="mb-0">
          Portföylerin şehir ve emlak tipine göre dağılımı.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="dh-section-card dh-chart-card">
            <div className="dh-section-header">
              <div className="dh-section-title">
                <i className="bi bi-pie-chart-fill"></i> İllere Göre Dağılım
              </div>
            </div>

            {cityChartData.length === 0 ? (
              <div className="dh-empty">Grafik için veri bulunamadı.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={cityChartData}
                      dataKey="value" //Dilim büyüklüğünü hangi alana göre belirle
                      nameKey="name" //Dilimin adını hangi alandan al
                      cx="50%" //Grafiği yatayda ortala
                      cy="50%" //Grafiği dikeyde ortala
                      outerRadius={90} //Dışarıdan yarıçap 90px
                      innerRadius={45} //İçeriden yarıçap 45px → ortası boş donut görünümü
                      paddingAngle={3} //Dilimler arası 3 derecelik boşluk
                      label //Dilimin üzerine değer yazar
                    >
                      {cityChartData.map((entry, index) => (
                        <Cell
                          key={`city-${entry.name}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="dh-city-breakdown">
                  {cityChartData.map((city, index) => (
                    <div className="dh-city-row" key={city.name}>
                      <div className="dh-city-left">
                        <span
                          className="dh-city-dot"
                          style={{
                            backgroundColor:
                              chartColors[index % chartColors.length],
                          }}
                        ></span>
                        <span className="dh-city-name">{city.name}</span>
                      </div>

                      <span className="dh-city-count">
                        {city.value} portföy
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="dh-section-card dh-chart-card">
            <div className="dh-section-header">
              <div className="dh-section-title">
                <i className="bi bi-bar-chart-fill"></i> Emlak Tipine Göre
                Dağılım
              </div>
            </div>

            {typeChartData.length === 0 ? (
              <div className="dh-empty">Grafik için veri bulunamadı.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={typeChartData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {typeChartData.map((entry, index) => (
                        <Cell
                          key={`type-${entry.name}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="dh-type-breakdown">
                  {typeChartData.map((type, index) => (
                    <div className="dh-type-row" key={type.name}>
                      <div className="dh-type-left">
                        <span
                          className="dh-type-dot"
                          style={{
                            backgroundColor:
                              chartColors[index % chartColors.length],
                          }}
                        ></span>
                        <span className="dh-type-name">{type.name}</span>
                      </div>

                      <span className="dh-type-count">
                        {type.value} portföy
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;