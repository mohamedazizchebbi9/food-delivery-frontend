import { useEffect, useState } from "react";
import api from "../services/api";

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", address: "" });
    const [message, setMessage] = useState("");

    // Change password state
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [pwMessage, setPwMessage] = useState("");

    useEffect(() => {
        api.get("/users/me")
            .then(res => {
                setProfile(res.data);
                setForm({
                    name: res.data.name || "",
                    phone: res.data.phone || "",
                    address: res.data.address || ""
                });
            })
            .catch(err => console.error(err));
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put("/users/profile", form);
            setProfile(res.data);
            setEditing(false);
            setMessage("Profile updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setMessage("Failed to update profile");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await api.put("/users/change-password", {
                oldPassword,
                newPassword
            });
            setPwMessage("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setTimeout(() => setPwMessage(""), 3000);
        } catch (err) {
            setPwMessage(err.response?.data?.message || "Old password is incorrect");
        }
    };

    if (!profile) return <h1>Loading...</h1>;

    return (
        <div className="page">
            <section className="page-heading">
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your account information.</p>
                </div>
            </section>

            {message && (
                <div style={{
                    padding: "12px", background: "#d4edda",
                    color: "#155724", borderRadius: "8px", marginBottom: "16px"
                }}>
                    {message}
                </div>
            )}

            {/* PROFILE CARD */}
            <div style={{
                background: "#fff", borderRadius: "12px",
                padding: "24px", marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}>
                <h2 style={{ marginBottom: "16px" }}>👤 Account Info</h2>

                {!editing ? (
                    <div>
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Phone:</strong> {profile.phone || "Not set"}</p>
                        <p><strong>Address:</strong> {profile.address || "Not set"}</p>
                        <p><strong>Role:</strong> {profile.role}</p>
                        <button
                            onClick={() => setEditing(true)}
                            style={{
                                marginTop: "16px", padding: "10px 24px",
                                background: "#111", color: "#fff",
                                border: "none", borderRadius: "8px", cursor: "pointer"
                            }}
                        >
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: "12px" }}>
                            <label>Name</label><br />
                            <input
                                type="text" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            />
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                            <label>Phone</label><br />
                            <input
                                type="text" value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            />
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                            <label>Address</label><br />
                            <input
                                type="text" value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: "10px 24px", background: "#111", color: "#fff",
                                border: "none", borderRadius: "8px", cursor: "pointer", marginRight: "8px"
                            }}
                        >
                            Save
                        </button>
                        <button
                            type="button" onClick={() => setEditing(false)}
                            style={{
                                padding: "10px 24px", background: "#eee", color: "#333",
                                border: "none", borderRadius: "8px", cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                    </form>
                )}
            </div>

            {/* CHANGE PASSWORD CARD */}
            <div style={{
                background: "#fff", borderRadius: "12px",
                padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}>
                <h2 style={{ marginBottom: "16px" }}>🔒 Change Password</h2>

                {pwMessage && (
                    <div style={{
                        padding: "12px", marginBottom: "12px", borderRadius: "8px",
                        background: pwMessage.includes("success") ? "#d4edda" : "#f8d7da",
                        color: pwMessage.includes("success") ? "#155724" : "#721c24"
                    }}>
                        {pwMessage}
                    </div>
                )}

                <form onSubmit={handleChangePassword}>
                    <div style={{ marginBottom: "12px" }}>
                        <label>Current Password</label><br />
                        <input
                            type="password" value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                        <label>New Password</label><br />
                        <input
                            type="password" value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            required minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: "10px 24px", background: "#c0392b", color: "#fff",
                            border: "none", borderRadius: "8px", cursor: "pointer"
                        }}
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;