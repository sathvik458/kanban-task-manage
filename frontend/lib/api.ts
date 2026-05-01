// Single axios instance used by every page/component to call the backend.
// withCredentials sends/receives the auth cookie automatically.
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true,
});
