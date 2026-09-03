import React from "react";
import AuthContext from "./authContext.js";
import api from "../utils/axios.js";

const AuthProvider = ({ children }) => {
  // Stores the currently logged-in user's information.
  //
  // Initially there is no user.
  // Example:
  // user = {
  //   _id: "123",
  //   name: "Priyanshu",
  //   email: "abc@gmail.com"
  // }
  const [user, setUser] = React.useState(null);

  // Used while the application is checking
  // whether a user was already logged in.
  //
  // true  -> still checking
  // false -> checking completed
  const [loading, setLoading] = React.useState(true);

  // Runs once when AuthProvider is mounted.
  React.useEffect(() => {
    // Get previously stored user information.
    //
    // IMPORTANT:
    // We are NOT storing the JWT token here.
    // We only store user information.
    const storedUser = localStorage.getItem("userInfo");

    // If user information exists in localStorage,
    // convert JSON string back into a JavaScript object.
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // We have finished checking localStorage.
    setLoading(false);
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (email, password) => {
    try {
      // Send email and password to backend.
      //
      // Backend:
      // POST /login
      //
      // Backend will:
      // 1. Verify email/password
      // 2. Generate access token
      // 3. Generate refresh token
      // 4. Store tokens in cookies
      // 5. Send user data in response
      const response = await api.post("/login", {
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

  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (name, email, password) => {
    try {
      // Send registration data to backend.
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      // Because backend uses ApiResponse:
      //
      // response.data       -> ApiResponse
      // response.data.data  -> actual backend data
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  };

  // =========================================================
  // VERIFY OTP
  // =========================================================

  const verifyOTP = async (email, otp) => {
    try {
      // Send OTP to backend.
      //
      // Backend verifies the OTP.
      //
      // If verification is successful,
      // backend can generate tokens and send them
      // as cookies.
      const response = await api.post("/auth/verify-otp", {
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

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async () => {
    try {
      // Tell backend that the user wants to logout.
      //
      // Backend will:
      // 1. Clear refresh token from database
      // 2. Clear authentication cookies
      await api.post("/logout");
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

  // =========================================================
  // PROVIDE AUTH DATA TO ENTIRE APPLICATION
  // =========================================================

  return (
    <AuthContext.Provider
      value={{
        // Current logged-in user
        user,

        // Authentication functions
        login,
        logout,
        register,
        verifyOTP,

        // Used to know whether auth restoration is complete
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
