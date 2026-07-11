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
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000'}/api/import`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}
