import { useEffect, useState } from "react";
import api from "../services/api";

const demoCategories = [
    { id: 1, name: "Wood-Fired" },
    { id: 2, name: "Plant-Based" },
    { id: 3, name: "Quick Bowls" },
    { id: 4, name: "Chef Specials" }
];

function AdminCategoryPage() {

    const [categories, setCategories] = useState([]);

    const [name, setName] = useState("");

    const [editingId, setEditingId] =
        useState(null);

    const loadCategories = () => {

        api.get("/category")
            .then(response => {
                setCategories(response.data.length ? response.data : demoCategories);
            })
            .catch(error => {
                console.error(error);
                setCategories(demoCategories);
            });
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const saveCategory = async () => {

        try {

            if (editingId) {

                await api.put(
                    `/admin/category/${editingId}`,
                    {
                        name
                    }
                );

            } else {

                await api.post(
                    "/admin/category",
                    {
                        name
                    }
                );
            }

            setEditingId(null);

            setName("");

            loadCategories();

        } catch (error) {
            console.error(error);
            const demoCategory = {
                id: editingId || Date.now(),
                name
            };

            setCategories(currentCategories =>
                editingId
                    ? currentCategories.map(category =>
                        category.id === editingId ? demoCategory : category
                    )
                    : [...currentCategories, demoCategory]
            );

            setEditingId(null);
            setName("");
        }
    };

    const editCategory = (category) => {

        setEditingId(category.id);

        setName(category.name);
    };

    const deleteCategory = async (id) => {

        try {

            await api.delete(
                `/admin/category/${id}`
            );

            loadCategories();

        } catch (error) {
            console.error(error);
            setCategories(currentCategories =>
                currentCategories.filter(category => category.id !== id)
            );
        }
    };

    return (

        <div className="page">

            <section className="page-heading">
                <div>
                    <h1>Category Management</h1>
                    <p>Organize menu sections for fast browsing.</p>
                </div>
            </section>

            <section className="admin-editor">
                <h2>
                    {editingId
                        ? "Edit Category"
                        : "Create Category"}
                </h2>

                <div className="form-grid single">
                    <input
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)}
                        placeholder="Category Name"
                    />

                    <button
                        onClick={saveCategory}>
                        {editingId
                            ? "Update"
                            : "Create"}
                    </button>
                </div>
            </section>

            <section className="admin-list">
                {categories.map(category => (

                    <article className="admin-card" key={category.id}>

                        <h3>
                            {category.name}
                        </h3>

                        <div className="admin-card-actions">
                            <button
                                onClick={() =>
                                    editCategory(category)}>
                                Edit
                            </button>

                            <button
                                className="danger-action"
                                onClick={() =>
                                    deleteCategory(
                                        category.id
                                    )}>
                                Delete
                            </button>
                        </div>

                    </article>

                ))}
            </section>

        </div>
    );
}

export default AdminCategoryPage;
