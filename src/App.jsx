import {
    BrowserRouter,
    Navigate,
    Routes,
    Route
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminCategoryPage from "./pages/AdminCategoryPage";
import AdminRoute from "./components/AdminRoute";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/checkoutPage";
import AdminUsersPage from "./pages/AdminUserPage";


import Navbar from "./components/Navbar";

function App() {

    return (

        <BrowserRouter>

            <div className="ember-shell">
                <Navbar />

                <main className="content">
                    <Routes>

                        <Route
                            path="/"
                            element={<Navigate to="/menu" />}
                        />

                        <Route
                            path="/login"
                            element={<LoginPage />}
                        />

                        <Route
                            path="/menu"
                            element={<MenuPage />}
                        />

                        <Route
                            path="/cart"
                            element={
                                            <ProtectedRoute>
                                                <CartPage />
                                            </ProtectedRoute>
                                        }
                        />

                        <Route
                            path="/orders"
                            element={
                                            <ProtectedRoute>
                                                <OrdersPage />
                                            </ProtectedRoute>
                                        }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute>
                                    <CheckoutPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminPage />
                                </AdminRoute>
                            }
                        />

                        <Route
                            path="/admin/orders"
                            element={
                                <AdminRoute>
                                    <AdminOrdersPage />
                                </AdminRoute>
                            }
                        />

                        <Route
                            path="/admin/menu"
                            element={
                                <AdminRoute>
                                    <AdminMenuPage />
                                </AdminRoute>
                            }
                        />

                        <Route
                            path="/admin/categories"
                            element={
                                <AdminRoute>
                                    <AdminCategoryPage />
                                </AdminRoute>
                            }
                        />

                        <Route
                            path="/admin/users"
                            element={
                                <AdminRoute>
                                    <AdminUsersPage />
                                </AdminRoute>
                            }
                        />

                    </Routes>
                </main>
            </div>

        </BrowserRouter>

    );
}

export default App;
