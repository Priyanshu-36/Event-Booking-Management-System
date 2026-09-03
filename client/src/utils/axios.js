import axios from "axios";

// Create one Axios instance for communicating with our backend
const api = axios.create({
  // Base URL of our backend
  // So api.post("/login") becomes:
  // http://localhost:5001/api/v1/login
  baseURL: "http://localhost:5001/api/v1",

  // VERY IMPORTANT when using cookies for authentication.
  // This tells the browser to send cookies with requests
  // to our backend.
  withCredentials: true,

  // Tell backend that we are sending JSON data
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
// const formData = new FormData();

// formData.append("name", name);
// formData.append("avatar", imageFile);

// await api.post("/users/update-profile", formData);

// Axios/browser automatically sets:

// Content-Type: multipart/form-data; boundary=....
