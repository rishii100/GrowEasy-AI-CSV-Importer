'use client';

import React from 'react';

interface Props {
  headers: string[];
  rows: Record<string, string>[];
  maxRows?: number;
}

export default function PreviewTable({ headers, rows, maxRows = 200 }: Props) {
  const displayRows = rows.slice(0, maxRows);

  if (!headers.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📋</span>
        No data to preview yet.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table" aria-label="CSV preview table">
        <thead>
          <tr>
            <th style={{ color: 'var(--text-muted)' }}>#</th>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr key={i}>
              <td className="muted">{i + 1}</td>
              {headers.map((h) => (
                <td key={h} title={row[h] || ''}>
                  {row[h] || <span className="muted">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
          Showing first {maxRows} of {rows.length} rows. All {rows.length} rows will be sent for AI processing.
        </div>
      )}
    </div>
  );
}
