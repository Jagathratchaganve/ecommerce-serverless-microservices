/**
 * Formats a number as INR Currency (₹)
 * @param {number|string} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
};

/**
 * Calculates discount percentage between original price and discount price
 * @param {number} price
 * @param {number} discountPrice
 * @returns {number}
 */
export const calculateDiscountPercentage = (price, discountPrice) => {
  const p = Number(price || 0);
  const dp = Number(discountPrice || 0);
  if (p <= 0 || dp <= 0 || dp >= p) return 0;
  return Math.round(((p - dp) / p) * 100);
};

/**
 * Formats an ISO date string
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

/**
 * Returns Tailwind CSS classes for Order and Payment Status Badges
 * @param {string} status
 * @returns {string}
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
    case "DELIVERED":
    case "PLACED":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "PENDING":
    case "OUT_FOR_DELIVERY":
    case "SHIPPED":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "CANCELLED":
    case "FAILED":
    case "RETURNED":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
};
