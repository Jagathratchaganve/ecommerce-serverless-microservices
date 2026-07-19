import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductProvider } from "./contexts/ProductContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
              <OrderProvider>
                
                {/* Global Toast Notification Container */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "#1e293b",
                      color: "#fff",
                      fontSize: "13px",
                      borderRadius: "8px",
                      padding: "12px 16px"
                    },
                    success: {
                      iconTheme: {
                        primary: "#10b981",
                        secondary: "#fff"
                      }
                    },
                    error: {
                      iconTheme: {
                        primary: "#ef4444",
                        secondary: "#fff"
                      }
                    }
                  }}
                />

                <AppRoutes />

              </OrderProvider>
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
