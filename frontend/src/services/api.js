import axios from "axios";
import { parseCookies } from "nookies";
import { AuthTokenError } from "./errors/AuthTokenError";
import { signOut } from "../contexts/AuthContext";

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "https://strix-backend.onrender.com",
    headers: {
      Authorization: `Bearer ${cookies["@nextauth.token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        // Qualquer erro 401 (não autorizado) devemos deslogar o usuário
        if (typeof window !== undefined) {
          // Deslogar o usuário
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}
