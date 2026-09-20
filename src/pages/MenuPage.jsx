import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const dishPhotos = [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1603046891744-76e6300f82ef?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80"
];

const demoCategories = [
    { id: 1, name: "Wood-Fired" },
    { id: 2, name: "Plant-Based" },
    { id: 3, name: "Quick Bowls" },
    { id: 4, name: "Chef Specials" },
    { id: 5, name: "Fresh Bakes" },
    { id: 6, name: "Gluten-Free" }
];

const demoItems = [
    { id: 1, name: "Charred Double Smash", description: "Smoked cheddar, ember sauce, pickles.", price: 14.5, categoryId: 4 },
    { id: 2, name: "Heirloom Avocado Toast", description: "Tomato relish, lemon, toasted seeds.", price: 11, categoryId: 2 },
    { id: 3, name: "Slow Butter Curry", description: "Creamy tomato curry with fragrant rice.", price: 16, categoryId: 3 },
    { id: 4, name: "Wood-Fired Margherita", description: "Basil, mozzarella, blistered crust.", price: 13.5, categoryId: 1 },
    { id: 5, name: "Truffle Mushroom Tagliatelle", description: "Wild mushrooms and parmesan cream.", price: 15.5, categoryId: 4 },
    { id: 6, name: "Loaded Ember Fries", description: "Crisp fries, aioli, herbs, and crunch.", price: 9.5, categoryId: 3 }
];

function MenuPage() {

    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [search, setSearch] = useState("");
    const [sortMode, setSortMode] = useState("Popular");
    const [favorites, setFavorites] = useState([]);
    const [lastAddedId, setLastAddedId] = useState(null);

    useEffect(() => {

        // Load menu items
        api.get("/menuItem")
            .then(response => {
                setMenuItems(response.data.length ? response.data : demoItems);
            })
            .catch(error => {
                console.error("Error loading menu:", error);
                setMenuItems(demoItems);
            });

        // Load categories
        api.get("/category")
            .then(response => {
                setCategories(response.data.length ? response.data : demoCategories);
            })
            .catch(error => {
                console.error("Error loading categories:", error);
                setCategories(demoCategories);
            });

        // Load user's favorites from backend
            api.get("/favorites")
                .then(response => {
                    setFavorites(response.data.map(fav => fav.menuItemId));
                })
                .catch(error => {
                    console.error("Error loading favorites:", error);
                });

    }, []);

    const addToCart = async (menuItemId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in or sign up to add items to your cart.");
            navigate("/login");
            return;
        }

        try {
            await api.post("/cart/items", {
                menuItemId: menuItemId,
                quantity: 1
            });
            setLastAddedId(menuItemId);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Error adding to cart:", error);
        }


    };

    const reorderFeatured = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        if (!featured) return;
        await addToCart(featured.id);
        navigate("/cart");
    };

    const toggleFavorite = async (menuItemId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in or sign up to save favorites.");
            navigate("/login");
            return;
        }

        const isFav = favorites.includes(menuItemId);
        try {
            if (isFav) {
                await api.delete(`/favorites/${menuItemId}`);
                setFavorites(current => current.filter(id => id !== menuItemId));
            } else {
                await api.post(`/favorites/${menuItemId}`);
                setFavorites(current => [...current, menuItemId]);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const toggleSort = () => {
        setSortMode(currentSort =>
            currentSort === "Popular" ? "Price" : "Popular"
        );
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("");
    };

    // Filter menu items
    const filteredItems = menuItems
        .filter(item =>
            selectedCategory === "" ||
            Number(item.categoryId) === Number(selectedCategory)
        )
        .filter(item =>
            item.name
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .sort((left, right) => {
            if (sortMode === "Price") return Number(left.price) - Number(right.price);
            return Number(left.id) - Number(right.id);
        });

    const featured = filteredItems[0] || menuItems[0];

    return (

        <div className="page menu-page">

            <section className="page-heading">
                <div>
                    <h1>Order Menu</h1>
                    <p>
                        Browse and reorder from any of our six kitchens.
                    </p>
                </div>

                <button
                    className="primary-action"
                    onClick={() => navigate("/cart")}
                >
                    View Cart (3)
                </button>
            </section>

            <section className="reorder-card">
                <div className="reorder-icon">○</div>
                <div>
                    <strong>Reorder your last meal</strong>
                    <span>
                        {featured
                            ? `${featured.name} · Jun 28 · ${featured.price} DT`
                            : "Slow Butter Curry · Jun 28 · 16.00 DT"}
                    </span>
                </div>
                <button onClick={reorderFeatured}>Reorder Instantly</button>
            </section>


            {/* SEARCH */}

            <div className="menu-tools">
                <label className="search-box">
                    <span>⌕</span>
                    <input
                        type="text"
                        placeholder="Search dishes, ingredients or kitchens..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>

                <button
                    className="round-tool"
                    aria-label="Clear filters"
                    onClick={clearFilters}
                >
                    ≡
                </button>
                <button className="sort-button" onClick={toggleSort}>
                    Sort: {sortMode}⌄
                </button>
            </div>


            {/* CATEGORIES */}

            <div className="category-bar">

                <button
                    onClick={() => setSelectedCategory("")}
                >
                    All Dishes
                </button>

                {categories.map(category => (

                    <button
                        key={category.id}
                        onClick={() =>
                            setSelectedCategory(category.id)
                        }
                    >
                        {category.name}
                    </button>

                ))}

            </div>


            {/* MENU */}

            <div className="menu-grid">

                {filteredItems.length === 0 ? (

                    <p className="empty-state">No menu items found.</p>

                ) : (

                    filteredItems.map((item, index) => (

                        <div
                            key={item.id}
                            className="menu-card"
                        >
                            <div className="dish-image">
                                <img
                                    src={item.imageUrl || dishPhotos[index % dishPhotos.length]}
                                    alt={item.name}
                                />
                                <span>{index === 0 ? "Chef's Pick" : index === 1 ? "New" : "Fresh"}</span>
                                <button
                                    className={favorites.includes(item.id) ? "saved" : undefined}
                                    aria-label={`Save ${item.name}`}
                                    onClick={() => toggleFavorite(item.id)}
                                >
                                    {favorites.includes(item.id) ? "♥" : "♡"}
                                </button>
                            </div>

                            <div className="dish-info">
                                <div>
                                    <h3>
                                        {item.name}
                                    </h3>

                                    <p>
                                        {item.description || "Crafted fresh in the Ember kitchen."}
                                    </p>
                                </div>

                                <strong>
                                    {Number(item.price).toFixed(2)} DT
                                </strong>
                            </div>

                            <div className="dish-meta">
                                <span>◷ {12 + index * 3} min</span>
                                <span>♧ {index % 2 === 0 ? "Mild" : "Veg"}</span>
                            </div>

                            <div className="dish-footer">
                                <span>★ {(4.9 - (index % 4) * 0.1).toFixed(1)}</span>

                                <button
                                    onClick={() =>
                                        addToCart(item.id)
                                    }
                                >
                                    {lastAddedId === item.id ? "Added" : "+ Add"}
                                </button>
                            </div>

                        </div>

                    ))

                )}

            </div>

            <section className="info-grid">
                <article id="about" className="info-panel">
                    <h2>About Ember</h2>
                    <p>
                        Seasonal comfort food from small kitchens, packed for quick delivery and easy reorders.
                    </p>
                </article>

                <article id="locations" className="info-panel">
                    <h2>Locations</h2>
                    <p>
                        Riverside Kitchen, Millbrook Station, Port Kitchen, and three pickup counters across town.
                    </p>
                </article>

                <article id="faq" className="info-panel">
                    <h2>FAQ</h2>
                    <p>
                        Orders can be tracked live, cancelled before preparation, and reordered from your account page.
                    </p>
                </article>
            </section>

        </div>

    );
}

export default MenuPage;
