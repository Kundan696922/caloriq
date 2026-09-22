import api from "./api";

export async function registerUser(userData) {
  const response = await api.post("/auth/register", userData);

  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post("/auth/login", credentials);

  return response.data;
}

export async function logoutUser() {
  const response = await api.post("/auth/logout");

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");

  return response.data;
}

export async function getUserProfile() {
  const response = await api.get("/users/profile");

  return response.data;
}

export async function updateUserProfile(profileData) {
  const response = await api.patch("/users/profile", profileData);

  return response.data;
}
