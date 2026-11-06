import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_STORAGE_KEY = "@imperio-dog/token";
export const ROLE_STORAGE_KEY = "@imperio-dog/role";
let unauthorizedHandler;

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

async function request(path, options = {}) {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error(
      "Configure a variável EXPO_PUBLIC_API_URL para conectar à API.",
    );
  }

  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(
    `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`,
    {
      ...options,
      headers,
    },
  );
  if (response.ok && options.responseType === "blob") return response.blob();
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (response.status === 401) {
    if (unauthorizedHandler) {
      await unauthorizedHandler();
    } else {
      await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, ROLE_STORAGE_KEY]);
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.fields
          ? Object.values(data.fields).join("\n")
          : data?.message ||
            data?.error ||
            `A API respondeu com status ${response.status}.`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export const api = {
  put(path, body) {
    return request(path, { method: "PUT", body: JSON.stringify(body) });
  },
  delete(path) {
    return request(path, { method: "DELETE" });
  },
  get(path, options = {}) {
    return request(path, options);
  },
  post(path, body, options = {}) {
    return request(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

export { TOKEN_STORAGE_KEY };
