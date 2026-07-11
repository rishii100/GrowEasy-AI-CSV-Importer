'use client';

import React from 'react';
import { ImportSummary } from '@/types';

interface Props {
  summary: ImportSummary;
}

export default function SummaryCard({ summary }: Props) {
  const successRate =
    summary.total_rows > 0
      ? Math.round((summary.total_imported / summary.total_rows) * 100)
      : 0;

  return (
    <div className="summary-grid">
      <div className="summary-card blue">
        <div className="sc-label">Total Rows</div>
        <div className="sc-value">{summary.total_rows}</div>
      </div>
      <div className="summary-card green">
        <div className="sc-label">Imported</div>
        <div className="sc-value">{summary.total_imported}</div>
      </div>
      <div className="summary-card red">
        <div className="sc-label">Skipped</div>
        <div className="sc-value">{summary.total_skipped}</div>
      </div>
      <div className="summary-card">
        <div className="sc-label">Success Rate</div>
        <div className="sc-value" style={{ color: successRate >= 80 ? 'var(--green)' : 'var(--amber)' }}>
          {successRate}%
        </div>
      </div>
    </div>
  );
}
