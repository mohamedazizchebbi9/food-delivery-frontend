import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CheckoutPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [deliveryInfo, setDeliveryInfo] = useState({ address: "", phone: "" });

    // Payment Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");

    const [loading, setLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        // Load pending checkout details saved from Cart page
        const savedInfo = JSON.parse(localStorage.getItem("emberCheckoutInfo") || "{}");
        if (!savedInfo.address || !savedInfo.phone) {
            navigate("/cart");
            return;
        }
        setDeliveryInfo(savedInfo);

        // Load cart items
        api.get("/cart")
            .then(res => setCartItems(res.data))
            .catch(() => {
                const storedCart = JSON.parse(localStorage.getItem("emberCart") || "[]");
                setCartItems(storedCart);
            });
    }, [navigate]);

    const cartTotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 16);
        const formatted = val.replace(/(.{4})/g, "$1 ").trim();
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (val.length >= 3) {
            setExpiry(`${val.slice(0, 2)} / ${val.slice(2)}`);
        } else {
            setExpiry(val);
        }
    };

    const handlePayAndOrder = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        // 1. Validate Required Fields
        if (!cardNumber.trim() || !expiry.trim() || !cvc.trim() || !firstName.trim() || !lastName.trim()) {
            setErrorMsg("Please fill in all credit card fields.");
            return;
        }

        // 2. Validate Card Number Length (Must be 16 digits)
        const cleanCard = cardNumber.replace(/\s/g, "");
        if (cleanCard.length < 16) {
            setErrorMsg("Invalid Card Number: Card number must be 16 digits.");
            return;
        }

        // 3. Validate CVC (MUST BE 3 OR 4 DIGITS)
        const cleanCvc = cvc.trim();
        if (cleanCvc.length < 3 || cleanCvc.length > 4 || !/^\d+$/.test(cleanCvc)) {
            setErrorMsg("Invalid CVV: Security code must be 3 digits (or 4 for Amex).");
            return;
        }

        // 4. Validate Expiration Date (MM / YY)
        const parts = expiry.replace(/\s/g, "").split("/");
        if (parts.length < 2 || parts[0].length !== 2 || parts[1].length !== 2) {
            setErrorMsg("Please enter a valid expiration date (MM / YY).");
            return;
        }

        const expMonth = parseInt(parts[0], 10);
        const expYearShort = parseInt(parts[1], 10);

        if (isNaN(expMonth) || isNaN(expYearShort) || expMonth < 1 || expMonth > 12) {
            setErrorMsg("Invalid expiration month. Please use MM / YY (01 - 12).");
            return;
        }

        // Convert 2-digit year to 4-digit year (e.g. 23 -> 2023, 26 -> 2026)
        const fullExpYear = 2000 + expYearShort;
        const today = new Date();
        const fullCurrentYear = today.getFullYear(); // e.g. 2026
        const currentMonth = today.getMonth() + 1;    // 1 to 12

        // Strictly check if card is expired
        if (fullExpYear < fullCurrentYear || (fullExpYear === fullCurrentYear && expMonth < currentMonth)) {
            setErrorMsg(`Card Expired: Expiration date (${expiry}) is in the past.`);
            return;
        }

        // 5. Test Declined Card Check (cards starting with 4000 or 0000)
        if (cleanCard.startsWith("4000") || cleanCard.startsWith("0000")) {
            setErrorMsg("Card Declined: Your bank refused the transaction. Please try another card.");
            return;
        }

        setLoading(true);

        try {
            // Call Spring Boot backend Stripe endpoint
            await api.post("/payments/create-payment-intent", {
                amount: cartTotal + 4.0
            });

            setPaymentSuccess(true);

            setTimeout(async () => {
                try {
                    await api.post("/orders/checkout", {
                        deliveryAddress: deliveryInfo.address,
                        phoneNumber: deliveryInfo.phone
                    });

                    // Instantly notify Navbar to update Cart & Orders badges!
                    window.dispatchEvent(new Event("cartUpdated"));
                } catch (err) {
                    console.error("Checkout error:", err);
                }
                localStorage.removeItem("emberCart");
                localStorage.removeItem("emberCheckoutInfo");
                navigate("/orders");
            }, 1200);

        } catch (error) {
            console.error("Payment error:", error);
            setLoading(false);
            setPaymentSuccess(false);
            setErrorMsg(
                error.message ||
                error.response?.data?.message ||
                "Payment Failed: Transaction was declined by the payment gateway."
            );
        }
    };

    return (
        <div style={{ maxWidth: "680px", margin: "40px auto", padding: "0 20px" }}>
            <button
                onClick={() => navigate("/cart")}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.95rem", marginBottom: "20px" }}
            >
                ← Back to Cart
            </button>

            <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
                border: "1px solid #e2e8f0"
            }}>
                {/* HEADER: TOTAL */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: "20px", borderBottom: "1px solid #e0e0e0", marginBottom: "28px" }}>
                    <div>
                        <span style={{ fontSize: "1.8rem", color: "#222", fontWeight: "300" }}>Payment</span>
                        <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
                            Delivering to: <strong>{deliveryInfo.address}</strong> ({deliveryInfo.phone})
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "2.2rem", fontWeight: "300", color: "#222" }}>DT {(cartTotal + 4).toFixed(2)}</span>
                        <span style={{ fontSize: "0.9rem", color: "#888", marginLeft: "6px", textTransform: "uppercase" }}>TND</span>
                    </div>
                </div>

                {errorMsg && (
                    <div style={{ color: "#d9534f", background: "#fdf7f7", padding: "12px 16px", borderRadius: "8px", fontSize: "0.95rem", fontWeight: "600", marginBottom: "16px", border: "1px solid #ebccd1" }}>
                        ⚠️ {errorMsg}
                    </div>
                )}

                {paymentSuccess && (
                    <div style={{ color: "#27ae60", background: "#eafaf1", padding: "16px", borderRadius: "8px", fontSize: "1.05rem", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
                        🎉 Payment Authorized! Redirecting to orders...
                    </div>
                )}

                {/* PAYMENT FORM */}
                <form onSubmit={handlePayAndOrder} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* ROW 1: FIRST NAME & LAST NAME */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="First name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                style={{
                                    width: "100%", padding: "14px 16px", borderRadius: "8px",
                                    border: "1px solid #dcdcdc", fontSize: "1.05rem", color: "#333",
                                    boxSizing: "border-box", outline: "none"
                                }}
                                required
                            />
                            <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#ccc", background: "#f0f0f0", borderRadius: "4px", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>✓</span>
                        </div>

                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                style={{
                                    width: "100%", padding: "14px 16px", borderRadius: "8px",
                                    border: "1px solid #dcdcdc", fontSize: "1.05rem", color: "#333",
                                    boxSizing: "border-box", outline: "none"
                                }}
                                required
                            />
                            <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#ccc", background: "#f0f0f0", borderRadius: "4px", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>✓</span>
                        </div>
                    </div>

                    {/* ROW 2: CARD NUMBER & CVC */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px" }}>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem" }}>💳</span>
                            <input
                                type="text"
                                placeholder="Card number"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                minLength={19}
                                maxLength={19}
                                style={{
                                    width: "100%", padding: "14px 16px 14px 44px", borderRadius: "8px",
                                    border: "1px solid #dcdcdc", fontSize: "1.05rem", color: "#333",
                                    boxSizing: "border-box", outline: "none"
                                }}
                                required
                            />
                            <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#ccc", background: "#f0f0f0", borderRadius: "4px", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>✓</span>
                        </div>

                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem" }}>🔒</span>
                            <input
                                type="password"
                                placeholder="CVV"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                minLength={3}
                                maxLength={4}
                                style={{
                                    width: "100%", padding: "14px 16px 14px 44px", borderRadius: "8px",
                                    border: "1px solid #dcdcdc", fontSize: "1.05rem", color: "#333",
                                    boxSizing: "border-box", outline: "none"
                                }}
                                required
                            />
                            <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#ccc", background: "#f0f0f0", borderRadius: "4px", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>✓</span>
                        </div>
                    </div>

                    {/* ROW 3: BRAND LOGOS (LEFT) & MM/YY (RIGHT) */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ padding: "4px 8px", background: "#ebf5ff", color: "#0056b3", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>MC</span>
                            <span style={{ padding: "4px 8px", background: "#e8f4f8", color: "#1a1f71", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>VISA</span>
                            <span style={{ padding: "4px 8px", background: "#e6f7ff", color: "#006fcf", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>AMEX</span>
                            <span style={{ padding: "4px 8px", background: "#f0f0f0", color: "#555", borderRadius: "4px", fontSize: "0.75rem" }}>Maestro</span>
                            <span style={{ padding: "4px 8px", background: "#fff0f0", color: "#c0392b", borderRadius: "4px", fontSize: "0.75rem" }}>JCB</span>
                        </div>

                        <div style={{ width: "130px" }}>
                            <input
                                type="text"
                                placeholder="MM / YY"
                                value={expiry}
                                onChange={handleExpiryChange}
                                minLength={7}
                                maxLength={7}
                                style={{
                                    width: "100%", padding: "14px", borderRadius: "8px",
                                    border: "1px solid #dcdcdc", fontSize: "1.05rem", color: "#333",
                                    textAlign: "center", boxSizing: "border-box", outline: "none"
                                }}
                                required
                            />
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                        type="submit"
                        disabled={loading || paymentSuccess}
                        style={{
                            marginTop: "16px",
                            width: "100%",
                            padding: "18px",
                            background: loading ? "#95a5a6" : "#90c671",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "1.15rem",
                            fontWeight: "600",
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 12px rgba(144,198,113,0.35)",
                            transition: "all 0.2s"
                        }}
                    >
                        {loading ? "Processing..." : "SUBMIT PAYMENT"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CheckoutPage;