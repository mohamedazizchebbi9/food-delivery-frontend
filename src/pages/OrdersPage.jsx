import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const demoOrders = [
    { id: 2841, totalPrice: 16, status: "PREPARING" },
    { id: 2840, totalPrice: 13.5, status: "DELIVERED" },
    { id: 2839, totalPrice: 12.5, status: "PENDING" },
    { id: 2838, totalPrice: 13, status: "DELIVERED" }
];

const steps = [
    { title: "Order Received", icon: "📝" },
    { title: "Confirmed", icon: "✓" },
    { title: "Cooking in Kitchen", icon: "🍳" },
    { title: "Out for Delivery", icon: "🚚" },
    { title: "Delivered", icon: "🎉" }
];

const getStepIndex = (status) => {
    switch (status) {
        case "PENDING": return 0;
        case "CONFIRMED": return 1;
        case "PREPARING": return 2;
        case "READY": return 3;
        case "DELIVERED": return 4;
        default: return 0;
    }
};

function OrdersPage() {

    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [trackingLive, setTrackingLive] = useState(false);
    const [filter, setFilter] = useState("ALL");
    const [favoriteDishes, setFavoriteDishes] = useState([]);
    const filteredOrders = filter === "ALL"
        ? orders
        : orders.filter(order => order.status === filter);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);


    useEffect(() => {
        window.dispatchEvent(new Event("cartUpdated"));

        const fetchOrders = () => {
            api.get("/orders")
                .then(response => {
                    setOrders(response.data.length ? response.data : demoOrders);
                })
                .catch(error => {
                    console.error(error);
                    setOrders(demoOrders);
                });
        };

        fetchOrders(); // Initial load

        // Auto-refresh every 3 seconds for live tracking!
        const intervalId = setInterval(fetchOrders, 3000);

        // Fetch favorites
        api.get("/favorites")
            .then(response => setFavoriteDishes(response.data))
            .catch(err => console.error(err));

        // Cleanup polling timer when user leaves page
        return () => clearInterval(intervalId);
    }, []);

    const viewOrderDetails = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            setSelectedOrderDetails(response.data);
        } catch (err) {
            console.error("Failed to load order details", err);
        }
    };

    const cancelOrder = async (id) => {

        try {

            await api.put(`/orders/${id}/cancel`);

            setOrders(currentOrders =>
                currentOrders.map(order =>
                    order.id === id ? { ...order, status: "CANCELLED" } : order
                )
            );

        } catch (error) {

            console.error(error);
            setOrders(currentOrders =>
                currentOrders.map(order =>
                    order.id === id ? { ...order, status: "CANCELLED" } : order
                )
            );
        }
    };

    const steps = ["Confirmed", "Cooking", "On the way", "Delivered"];

    return (
        <div className="page">

            <section className="page-heading">
                <div>
                    <h1>Good evening.</h1>
                    <p>Here's what's happening with your account.</p>
                </div>

                <button
                    className="primary-action"
                    onClick={() => navigate("/menu")}
                >
                    Order Something New
                </button>
            </section>

            <section className="stats-grid">
                <div className="stat-card">
                    <span>♙</span>
                    <strong>1,240</strong>
                    <small>Reward Points</small>
                </div>
                <div className="stat-card">
                    <span>⌑</span>
                    <strong>{orders.length}</strong>
                    <small>Active Orders</small>
                </div>
                <div className="stat-card">
                    <span>▤</span>
                    <strong>58</strong>
                    <small>Total Orders</small>
                </div>
                <div className="stat-card">
                    <span>♡</span>
                    <strong>{favoriteDishes.length}</strong>
                    <small>Favorite Dishes</small>
                </div>
            </section>

            {/* LIVE TRACKING STEPPER FOR LATEST ACTIVE ORDER */}
            {(() => {
                // Pick the newest active order (highest ID)
                const sortedOrders = [...orders].sort((a, b) => b.id - a.id);
                const activeOrder = sortedOrders.find(o => o.status !== "DELIVERED" && o.status !== "CANCELLED") || sortedOrders[0];
                if (!activeOrder) return null;

                const currentStep = getStepIndex(activeOrder.status);

                return (
                    <section className="tracking-card" style={{ background: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Live Tracking — Order #{activeOrder.id}</h3>
                                <span style={{ color: "#666", fontSize: "0.9rem" }}>Total: {Number(activeOrder.totalPrice).toFixed(2)} DT</span>
                            </div>
                            <span style={{ background: "#fef3c7", color: "#d97706", padding: "6px 14px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.85rem" }}>
                                Status: {activeOrder.status}
                            </span>
                        </div>

                        {/* STEPPER BAR */}
                        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginTop: "24px" }}>
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div key={step.title} style={{ textAlign: "center", flex: 1, position: "relative" }}>
                                        <div style={{
                                            width: "42px", height: "42px", borderRadius: "50%",
                                            background: isCompleted ? "#27ae60" : "#eee",
                                            color: isCompleted ? "#fff" : "#999",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            margin: "0 auto 8px auto", fontSize: "1.2rem", fontWeight: "bold",
                                            border: isCurrent ? "3px solid #111" : "none",
                                            boxShadow: isCurrent ? "0 0 10px rgba(39,174,96,0.4)" : "none",
                                            transition: "all 0.3s ease"
                                        }}>
                                            {step.icon}
                                        </div>
                                        <span style={{ fontSize: "0.8rem", color: isCompleted ? "#111" : "#aaa", fontWeight: isCurrent ? "bold" : "normal" }}>
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                );
            })()}
            <section className="split-panels">
                <div className="panel-list">
                    <div className="panel-title">
                        <h2>My Orders</h2>
                        <button onClick={() => navigate("/orders")}>View all</button>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                        {["ALL", "PENDING", "CONFIRMED", "PREPARING", "DELIVERED", "CANCELLED"].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    border: filter === status ? "2px solid #111" : "1px solid #ccc",
                                    background: filter === status ? "#111" : "#fff",
                                    color: filter === status ? "#fff" : "#333",
                                    cursor: "pointer",
                                    fontWeight: filter === status ? "bold" : "normal"
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {filteredOrders.length === 0 ? (
                        <p className="empty-state">No orders yet.</p>
                    ) : (
                        filteredOrders.map(order => (
                            <div className="compact-row" key={order.id}>
                                <div>
                                    <strong>Order #{order.id}</strong>
                                    <span>Status: {order.status}</span>
                                </div>
                                <b>{Number(order.totalPrice).toFixed(2)} DT</b>

                                <button
                                    onClick={() => viewOrderDetails(order.id)}
                                    style={{ marginRight: "8px" }}
                                >
                                    View Items
                                </button>

                                <button
                                    className="ghost-danger"
                                    onClick={() => cancelOrder(order.id)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ))
                    )}
                </div>

           <div className="panel-list">
               <div className="panel-title">
                   <h2>Favorite Dishes</h2>
                   <button onClick={() => navigate("/menu")}>See all</button>
               </div>
               {favoriteDishes.length === 0 ? (
                   <p className="empty-state">No favorite dishes saved yet.</p>
               ) : (
                   favoriteDishes.map((fav) => (
                       <div className="compact-row favorite-row" key={fav.favoriteId}>
                           <img
                               src={fav.imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=180&q=80"}
                               alt={fav.menuItemName}
                           />
                           <div>
                               <strong>{fav.menuItemName}</strong>
                               <span>{fav.price ? Number(fav.price).toFixed(2) + " DT" : ""}</span>
                           </div>
                       </div>
                   ))
               )}
           </div>
            </section>

            {/* ORDER DETAILS POPUP MODAL */}
            {selectedOrderDetails && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: "24px",
                            borderRadius: "12px",
                            width: "90%",
                            maxWidth: "480px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                        }}
                    >
                        <h2>Order #{selectedOrderDetails.id} Details</h2>
                        <p><strong>Status:</strong> {selectedOrderDetails.status}</p>
                        <p><strong>Total:</strong> {Number(selectedOrderDetails.totalPrice).toFixed(2)} DT</p>
                        {selectedOrderDetails.deliveryAddress && (
                            <p><strong>Delivery Address:</strong> {selectedOrderDetails.deliveryAddress}</p>
                        )}
                        {selectedOrderDetails.phoneNumber && (
                            <p><strong>Phone Number:</strong> {selectedOrderDetails.phoneNumber}</p>
                        )}

                        <h4 style={{ marginTop: "16px", marginBottom: "8px" }}>Items Ordered:</h4>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {selectedOrderDetails.items && selectedOrderDetails.items.map((item, index) => (
                                <li
                                    key={index}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "8px 0",
                                        borderBottom: "1px solid #eee"
                                    }}
                                >
                                    <span>{item.quantity}x {item.menuItemName}</span>
                                    <strong>{(item.price * item.quantity).toFixed(2)} DT</strong>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setSelectedOrderDetails(null)}
                            style={{
                                marginTop: "20px",
                                width: "100%",
                                padding: "10px",
                                background: "#111",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer"
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default OrdersPage;
