import { useEffect, useState } from "react";
import api from "../services/api";

const demoDashboard = {
    totalOrders: 342,
    pendingOrders: 12,
    completedOrders: 280,
    deliveredOrders: 250,
    totalUsers: 128,
    totalRevenue: 8420
};

function AdminPage() {
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        api.get("/admin/dashboard")
            .then(response => {
                setDashboard(response.data);
            })
            .catch(error => {
                console.error(error);
                setDashboard(demoDashboard);
            });
    }, []);

    if (!dashboard) {
        return <h1>Loading...</h1>;
    }

    return (
        <div className="page">
            <section className="page-heading">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Live kitchen overview and revenue pulse.</p>
                </div>
            </section>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h2>📦 Total Orders</h2>
                    <h1>{dashboard.totalOrders}</h1>
                </div>

                <div className="dashboard-card">
                    <h2>⏳ Pending</h2>
                    <h1>{dashboard.pendingOrders}</h1>
                </div>

                <div className="dashboard-card">
                    <h2>✅ Completed</h2>
                    <h1>{dashboard.completedOrders}</h1>
                </div>

                <div className="dashboard-card">
                    <h2>🚚 Delivered</h2>
                    <h1>{dashboard.deliveredOrders}</h1>
                </div>

                <div className="dashboard-card">
                    <h2>👥 Total Users</h2>
                    <h1>{dashboard.totalUsers}</h1>
                </div>

                <div className="dashboard-card">
                    <h2>💰 Revenue</h2>
                    <h1>{Number(dashboard.totalRevenue).toFixed(2)} DT</h1>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;
