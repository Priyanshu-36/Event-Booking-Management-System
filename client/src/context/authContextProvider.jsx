import React from "react";
import AuthContext from "./authContext.js";
import api from "../utils/axios.js";

const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
    const handleAuthLogout = () => {
      setUser(null);
      localStorage.removeItem("userInfo");
    };
    //Whenever the browser receives an auth:logout event, execute handleAuthLogout
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  const login = async (email, password) => {
    try {
      // Send email and password to backend.
      //
      // Backend route:
      // POST /api/v1/auth/login
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Your backend response looks like:
      //
      // {
      //   statusCode: 200,
      //   data: {
      //      ...user information
      //   },
      //   message: "Login successful",
      //   success: true
      // }
      //
      // Therefore:
      //
      // response.data
      //       ↓
      // ApiResponse object
      //
      // response.data.data
      //       ↓
      // Actual data sent by backend
      const userData = response.data.data;

      // Store user information in React state.
      //
      // This causes components using `user`
      // to re-render.
      setUser(userData);

      // Save user information so that after refreshing
      // the browser we still know who the user is.
      //
      // IMPORTANT:
      // We are NOT storing accessToken or refreshToken.
      localStorage.setItem("userInfo", JSON.stringify(userData));

      // Return user information to the component
      // that called login().
      return userData;
    } catch (error) {
      // If backend sends an error,
      // extract the useful message.
      throw error.response?.data?.message || "Login failed";
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  };
  const verifyOTP = async (email, otp) => {
    try {
      // Backend route:
      // POST /api/v1/auth/verifyOTP
      const response = await api.post("/auth/verifyOTP", {
        email,
        otp,
      });

      // Get actual data from ApiResponse.
      const userData = response.data.data;

      // Store logged-in user in React state.
      setUser(userData);

      // Store only user information locally.
      //
      // DO NOT store accessToken/refreshToken.
      localStorage.setItem("userInfo", JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw error.response?.data?.message || "OTP verification failed";
    }
  };

  const logout = async () => {
    try {
      // Backend route:
      // POST /api/v1/auth/logout
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Remove user from React state.
      //
      // This makes the frontend consider
      // the user logged out.
      setUser(null);

      // Remove stored user information.
      localStorage.removeItem("userInfo");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        verifyOTP,
        loading,
      }}
    >
      {/* 
        Don't render the application until we finish
        checking localStorage for an existing user.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
