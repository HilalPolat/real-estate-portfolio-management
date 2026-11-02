import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";
import DashboardHome from "../components/dashboardHome";
import Customers from "../components/customers";
import Portfolio from "../components/dashboardPortfolio";
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [page, setPage] = useState("home");
  useEffect(() => {
    (async () => {
      try {
        await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });
        setAuthorized(true);
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Yükleniyor...</div>;
  if (!authorized) return <Navigate to="/login" replace />;

  return (
    <div className="d-flex">
      <Sidebar page={page} setPage={setPage} />

      <main className="flex-grow-1 p-4">
        {page === "home" && <DashboardHome setPage={setPage} />}
        {page === "customers" && <Customers />}
        {page === "portfolio" && <Portfolio />}
      </main>
    </div>
  );
};

export default Dashboard;
