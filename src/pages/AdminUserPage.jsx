import { useEffect, useState } from "react";
import api from "../services/api";

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/admin/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error loading users:", err));
    }, []);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <section className="page-heading">
                <div>
                    <h1>Registered Users</h1>
                    <p>View all customers and accounts.</p>
                </div>
            </section>

            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: "12px 16px", width: "100%", maxWidth: "400px",
                        borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.95rem"
                    }}
                />
            </div>

            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #eee", textAlign: "left", color: "#555" }}>
                            <th style={{ padding: "12px" }}>ID</th>
                            <th style={{ padding: "12px" }}>Name</th>
                            <th style={{ padding: "12px" }}>Email</th>
                            <th style={{ padding: "12px" }}>Phone</th>
                            <th style={{ padding: "12px" }}>Address</th>
                            <th style={{ padding: "12px" }}>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                <td style={{ padding: "12px", fontWeight: "bold" }}>#{user.id}</td>
                                <td style={{ padding: "12px" }}>👤 {user.name}</td>
                                <td style={{ padding: "12px" }}>{user.email}</td>
                                <td style={{ padding: "12px" }}>{user.phone || "Not set"}</td>
                                <td style={{ padding: "12px" }}>{user.address || "Not set"}</td>
                                <td style={{ padding: "12px" }}>
                                    <span style={{
                                        padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold",
                                        background: user.role === "ADMIN" ? "#fef3c7" : "#e0f2fe",
                                        color: user.role === "ADMIN" ? "#d97706" : "#0369a1"
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUsersPage;