import Papa from 'papaparse';

/**
 * Parse a CSV File on the client side using PapaParse.
 * Returns the headers array and an array of row objects.
 */
export function parseClientCsv(
  file: File
): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      transform: (v: string) => v.trim(),
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        resolve({ headers, rows: results.data });
      },
      error: (err: Error) => reject(err),
    });
  });
}

/**
 * Send the CSV file to the backend for AI extraction.
 */
export async function importCsvViaApi(file: File) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';
  const endpoint = `${backendUrl}/api/import`;

  console.log('[API] Calling:', endpoint);

  let res: Response;
  try {
    const formData = new FormData();
    formData.append('file', file);
    res = await fetch(endpoint, { method: 'POST', body: formData });
  } catch (networkErr) {
    // CORS or network failure — backend unreachable
    throw new Error(
      `Cannot reach backend at ${backendUrl}. ` +
      `Check that NEXT_PUBLIC_BACKEND_URL is set correctly and the backend is running. ` +
      `(${(networkErr as Error).message})`
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}
