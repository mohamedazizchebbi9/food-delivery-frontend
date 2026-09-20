import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState("");

   const handleSubmit = async () => {
       setError("");
       try {
           if (isSignUp) {
               // 1. Create the account via POST /users
               await api.post("/users", { name, email, password });
               // 2. Automatically log in after registration
           }

           const response = await api.post("/users/login", { email, password });
           localStorage.setItem("token", response.data.token);
           localStorage.setItem("role", response.data.role);

           const user = await api.get("/users/me");
           localStorage.setItem("role", user.data.role);

           navigate(user.data.role === "ADMIN" ? "/admin" : "/menu");
       } catch (err) {
           console.error(err);
           setError(isSignUp ? "Failed to create account. Email might exist." : "Invalid email or password.");
       }
   };

        return (
            <div className="login-panel">
                <div className="brand login-brand">
                    <span className="brand-mark">≋</span>
                    <span>EMBER</span>
                </div>

                {/* Dynamic heading based on mode */}
                <h1>{isSignUp ? "Create an Account" : "Welcome back"}</h1>
                <p>{isSignUp ? "Sign up to start ordering." : "Sign in to manage your orders."}</p>

                {error && <div className="error-message">{error}</div>}

                {/* Show Name input only when signing up */}
                {isSignUp && (
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Submit button changes text based on mode */}
                <button onClick={handleSubmit}>
                    {isSignUp ? "Sign Up" : "Login"}
                </button>

                {/* Toggle link to switch between Login and Sign Up */}
                <p
                    style={{ marginTop: "1rem", cursor: "pointer", textAlign: "center", textDecoration: "underline" }}
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError("");
                    }}
                >
                    {isSignUp
                        ? "Already have an account? Log In"
                        : "Don't have an account? Sign Up"}
                </p>

            </div>
        );
}

export default LoginPage;
