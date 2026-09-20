import { Navigate }
from "react-router-dom";

function AdminRoute({ children }) {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");

    if (!token) {

        return (
            <Navigate to="/login" />
        );
    }

    if (role !== "ADMIN") {

        return (
            <Navigate to="/menu" />
        );
    }

    return children;
}

export default AdminRoute;