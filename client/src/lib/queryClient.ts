import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options?: { // Jadikan options opsional
  on401?: UnauthorizedBehavior;
}) => QueryFunction<T> =
  (options) => // Hapus destructurizing agar bisa default
    async ({ queryKey }) => {
      // Set default behavior jika tidak disediakan
      const unauthorizedBehavior = options?.on401 || "throw";

      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

// --- PERUBAHAN UTAMA DI SINI ---
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Daftarkan getQueryFn sebagai fungsi query default
      queryFn: getQueryFn({ on401: 'throw' }),
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});