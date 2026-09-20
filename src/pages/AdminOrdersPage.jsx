import { useEffect, useState } from "react";
import api from "../services/api";

const filters = ["All", "Pending", "Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"];

function AdminOrdersPage() {

    const [orders, setOrders] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState("All");

    const loadOrders = () => {
        api.get("/admin/orders")
            .then(response => {
                setOrders(response.data);
            })
            .catch(error => {
                console.error("Error loading admin orders:", error);
            });
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/orders/${id}/status`, {
                status
            });

            loadOrders();
        } catch (error) {
            console.error(error);
        }
    };

    const visibleOrders = orders.filter(order => {
        if (selectedFilter === "All") return true;
        return String(order.status).toUpperCase() === selectedFilter.toUpperCase();
    });

    return (

        <div className="admin-board">

            <section className="admin-board-head">
                <h1>Orders Management</h1>
                <div className="admin-tabs">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={filter === selectedFilter ? "active" : undefined}
                            onClick={() => setSelectedFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            <section className="kitchen-grid">
                {visibleOrders.length === 0 ? (
                    <p className="empty-state">No orders found for this status.</p>
                ) : (
                    visibleOrders.map((order, index) => (

                        <article className="kitchen-card" key={order.id}>
                            <div className="kitchen-card-head">
                                <div className="guest">
                                    <img
                                        src={`https://i.pravatar.cc/96?img=${(index % 8) + 12}`}
                                        alt=""
                                    />
                                    <div>
                                        <strong>Order #{order.id}</strong>
                                        <span>Status: {order.status}</span>
                                    </div>
                                </div>
                                <span className={`status status-${String(order.status).toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="admin-card-actions" style={{ marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                                <strong>{Number(order.totalPrice).toFixed(2)} DT</strong>

                                {/* STATUS DROPDOWN SELECT */}
                                <select
                                    value={order.status}
                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: "8px",
                                        border: "1px solid #ccc",
                                        fontWeight: "bold",
                                        background: "#fff",
                                        cursor: "pointer"
                                    }}
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="CONFIRMED">CONFIRMED</option>
                                    <option value="PREPARING">PREPARING</option>
                                    <option value="READY">READY</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>
                        </article>

                    ))
                )}
            </section>

        </div>
    );
}

export default AdminOrdersPage;
