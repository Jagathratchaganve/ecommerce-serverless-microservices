import { jwtDecode } from "jwt-decode";

/**
 * Parses and decodes a JWT token safely
 * @param {string} token
 * @returns {object|null}
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Extracts user info and roles from decoded Cognito Token
 * @param {string} accessToken
 * @param {string} idToken
 * @returns {object}
 */
export const extractUserFromTokens = (accessToken, idToken) => {
  const decodedAccess = decodeToken(accessToken);
  const decodedId = decodeToken(idToken);

  const groups = decodedAccess?.["cognito:groups"] || decodedId?.["cognito:groups"] || [];
  const isAdmin = groups.includes("Admin");
  const role = isAdmin ? "Admin" : "User";

  return {
    userId: decodedAccess?.sub || decodedId?.sub || "",
    username: decodedAccess?.username || decodedId?.["cognito:username"] || decodedId?.email || "",
    email: decodedId?.email || decodedAccess?.username || "",
    name: decodedId?.name || decodedId?.email?.split("@")[0] || "User",
    groups,
    role,
    isAdmin
  };
};
