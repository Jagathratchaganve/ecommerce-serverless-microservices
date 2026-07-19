import axios from "axios";
import toast from "react-hot-toast";

// Environment URLs with fallbacks
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const AUTH_URL = import.meta.env.VITE_AUTH_API_URL || (BASE_URL ? `${BASE_URL}/auth` : "http://localhost:3006");
const PRODUCT_URL = import.meta.env.VITE_PRODUCT_API_URL || (BASE_URL ? `${BASE_URL}/products` : "http://localhost:3001");
const INVENTORY_URL = import.meta.env.VITE_INVENTORY_API_URL || (BASE_URL ? `${BASE_URL}/inventory` : "http://localhost:3002");
const CART_URL = import.meta.env.VITE_CART_API_URL || (BASE_URL ? `${BASE_URL}/cart` : "http://localhost:3003");
const ORDER_URL = import.meta.env.VITE_ORDER_API_URL || (BASE_URL ? `${BASE_URL}/orders` : "http://localhost:3004");
const PAYMENT_URL = import.meta.env.VITE_PAYMENT_API_URL || (BASE_URL ? `${BASE_URL}/payments` : "http://localhost:3005");

/**
 * Creates an Axios instance equipped with JWT Request & Response Interceptors
 */
const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json"
    },
    timeout: 15000
  });

  // Request Interceptor: Attach Bearer Token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Handle Common Status Codes
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || "An unexpected error occurred.";

      if (status === 401) {
        // Token expired or invalid
        const currentToken = localStorage.getItem("accessToken");
        if (currentToken) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("idToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("authUser");
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
      } else if (status === 403) {
        toast.error("Access Denied: You do not have permission for this action.");
      } else if (status === 500) {
        toast.error(`Server Error: ${message}`);
      } else if (error.code === "ECONNABORTED") {
        toast.error("Request timed out. Please check your backend connection.");
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const authApi = createApiInstance(AUTH_URL);
export const productApi = createApiInstance(PRODUCT_URL);
export const inventoryApi = createApiInstance(INVENTORY_URL);
export const cartApi = createApiInstance(CART_URL);
export const orderApi = createApiInstance(ORDER_URL);
export const paymentApi = createApiInstance(PAYMENT_URL);

export { AUTH_URL, PRODUCT_URL, INVENTORY_URL, CART_URL, ORDER_URL, PAYMENT_URL };
