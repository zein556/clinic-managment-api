
import { apiRequest } from "./api";

export async function loginUser(email, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  // Save JWT token and user information
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export async function registerUser(
  username,
  email,
  password,
  phone,
  age,
  gender,
  medical_history
) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
      phone,
      age: Number(age),
      gender,
      medical_history: medical_history.trim() || null,
      role: "patient",
    }),
  });
}
