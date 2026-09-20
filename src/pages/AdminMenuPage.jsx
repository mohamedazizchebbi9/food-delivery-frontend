import { useEffect, useState } from "react";
import api from "../services/api";

const demoMenuItems = [
    { id: 1, name: "Charred Double Smash", description: "Smoked cheddar, ember sauce, pickles.", price: 14.5, categoryId: 4 },
    { id: 2, name: "Heirloom Avocado Toast", description: "Tomato relish, lemon, toasted seeds.", price: 11, categoryId: 2 },
    { id: 3, name: "Slow Butter Curry", description: "Creamy tomato curry with fragrant rice.", price: 16, categoryId: 3 }
];

function AdminMenuPage() {

    const [menuItems, setMenuItems] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [categories, setCategories] = useState([]);

    const loadMenuItems = () => {

        api.get("/menuItem")
            .then(response => {
                setMenuItems(response.data.length ? response.data : demoMenuItems);
            })
            .catch(error => {
                console.error(error);
                setMenuItems(demoMenuItems);
            });
    };

    useEffect(() => {
        loadMenuItems();

        api.get("/category")
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error("Error loading categories:", error);
            });
    }, []);

    const saveMenuItem = async () => {

        const payload = {
            name,
            description,
            price: Number(price),
            available: true,
            categoryId: Number(categoryId),
            imageUrl
        };

        try {

            if (editingId) {

                await api.put(
                    `/admin/menuItem/${editingId}`,
                    payload
                );

            } else {

                await api.post(
                    "/admin/menuItem",
                    payload
                );
            }

            setEditingId(null);

            setName("");
            setDescription("");
            setPrice("");
            setCategoryId("");
            setImageUrl("");

            loadMenuItems();

        } catch (error) {
            console.error(error);
            const demoItem = {
                id: editingId || Date.now(),
                ...payload
            };

            setMenuItems(currentItems =>
                editingId
                    ? currentItems.map(item =>
                        item.id === editingId ? demoItem : item
                    )
                    : [...currentItems, demoItem]
            );

            setEditingId(null);
            setName("");
            setDescription("");
            setPrice("");
            setCategoryId("");
            setImageUrl("");
        }
    };

    const editMenuItem = (item) => {

        setEditingId(item.id);

        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setCategoryId(item.categoryId);
        setImageUrl(item.imageUrl || "");
    };

    const deleteMenuItem = async (id) => {

        try {

            await api.delete(
                `/admin/menuItem/${id}`
            );

            loadMenuItems();

        } catch (error) {
            console.error(error);
            setMenuItems(currentItems =>
                currentItems.filter(item => item.id !== id)
            );
        }
    };

    return (

        <div className="page">

            <section className="page-heading">
                <div>
                    <h1>Menu Management</h1>
                    <p>Create, price, and tune dishes for the guest menu.</p>
                </div>
            </section>

            <section className="admin-editor">
                <h2>
                    {editingId
                        ? "Edit Menu Item"
                        : "Create Menu Item"}
                </h2>

                <div className="form-grid">
                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)}
                    />

                    <input
                        placeholder="Description"
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)}
                    />

                    <input
                        placeholder="Price"
                        value={price}
                        onChange={(e) =>
                            setPrice(e.target.value)}
                    />

                    <input
                        placeholder="Image URL (http://...)"
                        value={imageUrl}
                        onChange={(e) =>
                            setImageUrl(e.target.value)}
                    />

                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button onClick={saveMenuItem}>
                    {editingId
                        ? "Update"
                        : "Create"}
                </button>
            </section>

            <section className="admin-list">
                {menuItems.map(item => (

                    <article className="admin-card" key={item.id}>

                        <h3>{item.name}</h3>

                        <p>
                            {item.price} DT
                        </p>

                        <div className="admin-card-actions">
                            <button
                                onClick={() =>
                                    editMenuItem(item)}>
                                Edit
                            </button>

                            <button
                                className="danger-action"
                                onClick={() =>
                                    deleteMenuItem(item.id)}>
                                Delete
                            </button>
                        </div>

                    </article>

                ))}
            </section>

        </div>
    );
}

export default AdminMenuPage;
