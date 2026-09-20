import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function Navbar() {

    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);

    useEffect(() => {
        const fetchCounts = () => {
            const token = localStorage.getItem("token");
            if (token) {
                // Fetch logged-in user profile
                api.get("/users/me")
                    .then(res => setCurrentUser(res.data))
                    .catch(err => console.error("Error fetching user:", err));

                // Fetch live cart item count
                api.get("/cart")
                    .then(res => setCartCount(res.data.length))
                    .catch(err => console.error("Error fetching cart:", err));

        const role = localStorage.getItem("role");
        const isAdminUser = role === "ADMIN";
        const ordersEndpoint = isAdminUser ? "/admin/orders" : "/orders";

        api.get(ordersEndpoint)
            .then(res => setOrdersCount(res.data.length))
            .catch(err => console.error("Error fetching orders:", err));
            }
        };

        fetchCounts(); // Fetch on initial load

        // Listen for instant cart & order updates!
        window.addEventListener("cartUpdated", fetchCounts);
        return () => window.removeEventListener("cartUpdated", fetchCounts);
    }, []);

    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";
    const links = isAdmin
        ? [
            { to: "/admin", label: "Dashboard", icon: "☰" },
            { to: "/admin/orders", label: "Orders", icon: "▣", badge: ordersCount > 0 ? String(ordersCount) : undefined },
            { to: "/admin/users", label: "Users", icon: "👥" },
            { to: "/admin/menu", label: "Menu", icon: "≡" },
            { to: "/admin/categories", label: "Categories", icon: "◇" }
        ]
        : [
            { to: "/menu", label: "Order Menu", icon: "▤" },
            { to: "/cart", label: "Cart", icon: "⌑", badge: cartCount > 0 ? String(cartCount) : undefined },
            { to: "/orders", label: "My Orders", icon: "▣", badge: ordersCount > 0 ? String(ordersCount) : undefined },
            { to: "/profile", label: "Profile", icon: "⌾" }
        ];

    return (

        <>
            <header className="topbar">
                <div className="brand">
                    <span className="brand-mark">≋</span>
                    <span>EMBER</span>
                </div>

                <nav className="topnav">
                    <NavLink to={isAdmin ? "/admin" : "/menu"}>Home</NavLink>
                    <NavLink to={isAdmin ? "/admin/menu" : "/menu"}>Menu</NavLink>
                    <a href="#about">About</a>
                    <a href="#locations">Locations</a>
                    <a href="#faq">FAQ</a>
                </nav>

                <div className="top-actions">
                    <button
                        className="icon-button"
                        aria-label="Search"
                        onClick={() => navigate(isAdmin ? "/admin/menu" : "/menu")}
                    >
                        ⌕
                    </button>
                    <button
                        className="icon-button with-badge"
                        aria-label="Cart"
                        onClick={() => {
                            const token = localStorage.getItem("token");
                            if (!token && !isAdmin) {
                                navigate("/login");
                            } else {
                                navigate(isAdmin ? "/admin/orders" : "/cart");
                            }
                        }}
                    >
                        ⌑
                        <span>{cartCount}</span>
                    </button>
                    <button
                        className="avatar-button"
                        aria-label="Account"
                        onClick={() => {
                            const token = localStorage.getItem("token");
                            if (!token && !isAdmin) {
                                navigate("/login");
                            } else {
                                navigate(isAdmin ? "/admin" : "/profile");
                            }
                        }}
                    >
                        ⌾
                    </button>
                </div>
            </header>

            <aside className={isAdmin ? "sidebar admin-sidebar" : "sidebar"}>
                <div className="profile-card">
                    <div className="profile-avatar">⌾</div>
                    <strong>{isAdmin ? "Club Grub" : (currentUser ? currentUser.name : "Guest")}</strong>
                    <small>{isAdmin ? "Kitchen operations" : (currentUser ? currentUser.email : "")}</small>
                    <span className="tier-pill">⚿ Gold Tier · 1,240 pts</span>
                </div>

                <nav className="side-nav">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                isActive ? "active" : undefined
                            }
                        >
                            <span>{link.icon}</span>
                            {link.label}
                            {link.badge && <em>{link.badge}</em>}
                        </NavLink>
                    ))}
                </nav>

                <button
                    className="logout-link"
                    onClick={() => {
                        const token = localStorage.getItem("token");
                        if (!token) {
                            navigate("/login");
                        } else {
                            localStorage.removeItem("token");
                            localStorage.removeItem("role");
                            window.location.href = "/login";
                        }
                    }}
                >
                    {localStorage.getItem("token") ? "↪ Log Out" : "🔑 Log In"}
                </button>
            </aside>
        </>
    );
}

export default Navbar;
