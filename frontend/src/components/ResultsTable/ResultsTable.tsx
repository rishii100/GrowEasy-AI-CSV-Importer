'use client';

import React, { useState } from 'react';
import { CrmRecord } from '@/types';

const CRM_FIELDS: { key: keyof CrmRecord; label: string }[] = [
  { key: 'name',                        label: 'Name' },
  { key: 'email',                       label: 'Email' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'country_code',               label: 'Code' },
  { key: 'crm_status',                 label: 'Status' },
  { key: 'city',                        label: 'City' },
  { key: 'state',                       label: 'State' },
  { key: 'country',                     label: 'Country' },
  { key: 'company',                     label: 'Company' },
  { key: 'lead_owner',                  label: 'Lead Owner' },
  { key: 'data_source',                 label: 'Source' },
  { key: 'created_at',                  label: 'Created At' },
  { key: 'crm_note',                    label: 'Notes' },
  { key: 'possession_time',            label: 'Possession' },
  { key: 'description',                 label: 'Description' },
];

const STATUS_COLORS: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'badge-green',
  DID_NOT_CONNECT:     'badge-amber',
  BAD_LEAD:            'badge-red',
  SALE_DONE:           'badge-blue',
};

interface Props {
  imported: CrmRecord[];
  skipped: CrmRecord[];
}

export default function ResultsTable({ imported, skipped }: Props) {
  const [tab, setTab] = useState<'imported' | 'skipped'>('imported');

  const rows = tab === 'imported' ? imported : skipped;

  return (
    <div>
      <div className="tab-bar">
        <button
          className={`tab-btn${tab === 'imported' ? ' active' : ''}`}
          onClick={() => setTab('imported')}
          id="tab-imported"
        >
          ✅ Imported ({imported.length})
        </button>
        <button
          className={`tab-btn${tab === 'skipped' ? ' active' : ''}`}
          onClick={() => setTab('skipped')}
          id="tab-skipped"
        >
          ⏭️ Skipped ({skipped.length})
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">{tab === 'imported' ? '🎉' : '🙌'}</span>
          {tab === 'imported' ? 'No records were imported.' : 'No records were skipped — great data quality!'}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table" aria-label={`${tab} records table`}>
            <thead>
              <tr>
                <th>#</th>
                {tab === 'skipped' && <th>Skip Reason</th>}
                {CRM_FIELDS.map(({ key, label }) => (
                  <th key={key}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="muted">{i + 1}</td>
                  {tab === 'skipped' && (
                    <td style={{ color: 'var(--red)', maxWidth: '200px' }}>
                      {row.skip_reason || '—'}
                    </td>
                  )}
                  {CRM_FIELDS.map(({ key }) => (
                    <td key={key} title={row[key] ?? ''}>
                      {key === 'crm_status' && row[key] ? (
                        <span className={`badge ${STATUS_COLORS[row[key] as string] ?? 'badge-blue'}`}>
                          {row[key]}
                        </span>
                      ) : row[key] ? (
                        row[key]
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
