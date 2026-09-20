import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const demoCartItems = [
    { id: "demo-1", menuItemId: 1, menuItemName: "Charred Double Smash", price: 14.5, quantity: 1 },
    { id: "demo-3", menuItemId: 3, menuItemName: "Slow Butter Curry", price: 16, quantity: 2 },
    { id: "demo-6", menuItemId: 6, menuItemName: "Loaded Ember Fries", price: 9.5, quantity: 1 }
];

function CartPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const loadCart = () => {
        api.get("/cart")
            .then(response => {
                const storedCart = JSON.parse(localStorage.getItem("emberCart") || "[]");
                setCartItems(response.data.length ? response.data : storedCart);
            })
            .catch(error => {
                console.error(error);
                const storedCart = JSON.parse(localStorage.getItem("emberCart") || "[]");
                setCartItems(storedCart.length ? storedCart : demoCartItems);
            });
    };

    useEffect(() => {
        loadCart();
    }, []);

    const removeItem = async (id) => {
        try {
            await api.delete(`/cart/items/${id}`);
            window.dispatchEvent(new Event("cartUpdated"));
            loadCart();
        } catch (error) {
            const nextCart = cartItems.filter(item => item.id !== id);
            setCartItems(nextCart);
            localStorage.setItem("emberCart", JSON.stringify(nextCart));
        }
    };

    const increase = async (item) => {
        const nextQuantity = item.quantity + 1;
        try {
            await api.put(`/cart/items/${item.id}`, { quantity: nextQuantity });
            window.dispatchEvent(new Event("cartUpdated"));
            loadCart();
        } catch (error) {
            const nextCart = cartItems.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: nextQuantity } : cartItem
            );
            setCartItems(nextCart);
            localStorage.setItem("emberCart", JSON.stringify(nextCart));
        }
    };

    const decrease = async (item) => {
        if (item.quantity === 1) return;
        const nextQuantity = item.quantity - 1;
        try {
            await api.put(`/cart/items/${item.id}`, { quantity: nextQuantity });
            window.dispatchEvent(new Event("cartUpdated"));
            loadCart();
        } catch (error) {
            const nextCart = cartItems.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: nextQuantity } : cartItem
            );
            setCartItems(nextCart);
            localStorage.setItem("emberCart", JSON.stringify(nextCart));
        }
    };

    const cartTotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const proceedToPayment = () => {
        if (!deliveryAddress.trim() || !phoneNumber.trim()) {
            alert("Please enter your delivery address and phone number.");
            return;
        }

        // Save delivery info for checkout page
        localStorage.setItem("emberCheckoutInfo", JSON.stringify({
            address: deliveryAddress,
            phone: phoneNumber
        }));

        navigate("/checkout");
    };

    return (
        <div className="page" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <section className="page-heading">
                <div>
                    <h1>My Cart</h1>
                    <p>Review items before proceeding to payment.</p>
                </div>
            </section>

            <section className="cart-layout" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "28px" }}>
                <div className="panel-list" style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                    <h2>Cart Items ({cartItems.length})</h2>
                    {cartItems.length === 0 ? (
                        <div className="empty-state">
                            <strong>Your cart is empty.</strong>
                            <p>Pick a dish from the menu and it will appear here.</p>
                            <button onClick={() => navigate("/menu")}>Browse Menu</button>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div className="cart-item" key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
                                <div>
                                    <h3 style={{ fontSize: "1rem", margin: 0 }}>{item.menuItemName}</h3>
                                    <p style={{ color: "#777", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                                        {Number(item.price).toFixed(2)} DT × {item.quantity}
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <strong style={{ fontSize: "1rem" }}>{(Number(item.price) * item.quantity).toFixed(2)} DT</strong>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <button onClick={() => decrease(item)} style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #bbb", background: "#f4f4f4", fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer" }}>-</button>
                                        <span style={{ fontWeight: "bold" }}>{item.quantity}</span>
                                        <button onClick={() => increase(item)} style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #bbb", background: "#f4f4f4", fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer" }}>+</button>
                                    </div>
                                    <button className="ghost-danger" onClick={() => removeItem(item.id)} style={{ border: "none", background: "none", color: "#e74c3c", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <aside style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                    <h2 style={{ marginBottom: "16px" }}>Delivery Details</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                        <input
                            type="text"
                            placeholder="Delivery Address *"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.95rem" }}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Phone Number *"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.95rem" }}
                            required
                        />
                    </div>

                    <div style={{ borderTop: "1px solid #eee", paddingTop: "12px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#666" }}>
                            <span>Subtotal</span>
                            <span>{cartTotal.toFixed(2)} DT</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#666" }}>
                            <span>Delivery</span>
                            <span>4.00 DT</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold", marginTop: "10px" }}>
                            <span>Total</span>
                            <span style={{ color: "#e67e22" }}>{(cartTotal + 4).toFixed(2)} DT</span>
                        </div>
                    </div>

                    <button
                        onClick={proceedToPayment}
                        disabled={cartItems.length === 0}
                        style={{
                            width: "100%",
                            padding: "16px",
                            background: cartItems.length === 0 ? "#ccc" : "#111",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "1.05rem",
                            fontWeight: "bold",
                            cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                        }}
                    >
                        Proceed to Payment ➔
                    </button>
                </aside>
            </section>
        </div>
    );
}

export default CartPage;
