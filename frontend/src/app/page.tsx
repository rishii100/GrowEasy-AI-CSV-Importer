'use client';

import React, { useState, useCallback } from 'react';
import StepIndicator from '@/components/StepIndicator/StepIndicator';
import UploadZone from '@/components/UploadZone/UploadZone';
import PreviewTable from '@/components/PreviewTable/PreviewTable';
import ResultsTable from '@/components/ResultsTable/ResultsTable';
import SummaryCard from '@/components/SummaryCard/SummaryCard';
import { parseClientCsv, importCsvViaApi } from '@/lib/csvUtils';
import { CrmRecord, ImportResponse, ImportSummary, Step } from '@/types';

// ── Helper ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ imported: CrmRecord[]; skipped: CrmRecord[]; summary: ImportSummary } | null>(null);

  // ── Step 1 → 2: parse CSV client-side ─────────────────────────────────────
  const handleFileSelected = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    try {
      const { headers: h, rows } = await parseClientCsv(f);
      setHeaders(h);
      setPreviewRows(rows);
      setStep(2);
    } catch (e) {
      setError('Failed to parse CSV. Please ensure the file is a valid CSV.');
    }
  }, []);

  // ── Step 2 → 3 ─────────────────────────────────────────────────────────────
  const handleGoToConfirm = () => {
    setStep(3);
  };

  // ── Step 3 → 4: call backend API ───────────────────────────────────────────
  const handleConfirmImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setStep(4);
    try {
      const data: ImportResponse = await importCsvViaApi(file);
      setResults({
        imported: data.imported,
        skipped: data.skipped,
        summary: data.summary,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setPreviewRows([]);
    setResults(null);
    setError(null);
    setLoading(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="page-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="logo-mark" aria-hidden>🌱</div>
        <div className="header-text">
          <h1>GrowEasy AI CSV Importer</h1>
          <p>Intelligently extract CRM leads from any CSV format using AI</p>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator current={step} />

      {/* ── Error alert ── */}
      {error && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <div>
            <strong>Error: </strong>{error}
          </div>
        </div>
      )}

      {/* ══════ STEP 1: UPLOAD ══════ */}
      {step === 1 && (
        <section className="card" aria-labelledby="step1-title">
          <div className="section-header">
            <h2 id="step1-title">📤 Upload your CSV</h2>
          </div>
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>💡</span>
            <span>Works with any CSV format — Facebook leads, Google Ads, Excel exports, real estate CRMs, and more.</span>
          </div>
          <UploadZone onFileSelected={handleFileSelected} />
        </section>
      )}

      {/* ══════ STEP 2: PREVIEW ══════ */}
      {step === 2 && file && (
        <section className="card" aria-labelledby="step2-title">
          <div className="section-header">
            <h2 id="step2-title">🔍 CSV Preview</h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="file-info-pill">
                📄 <strong>{file.name}</strong>
                <span>{formatBytes(file.size)}</span>
                <span>·</span>
                <span>{previewRows.length} rows · {headers.length} columns</span>
              </div>
              <button className="btn btn-ghost" onClick={handleReset} id="btn-upload-new">
                ↩ Upload new
              </button>
            </div>
          </div>

          <PreviewTable headers={headers} rows={previewRows} />

          <div style={{ marginTop: '1.5rem' }}>
            <div className="confirm-section">
              <p>
                Previewing <strong>{previewRows.length} rows</strong> with <strong>{headers.length} columns</strong>.
                Click <em>Continue</em> to proceed to AI import.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-ghost" onClick={handleReset} id="btn-back-from-preview">Back</button>
                <button className="btn btn-primary" onClick={handleGoToConfirm} id="btn-continue-to-confirm">
                  Continue →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════ STEP 3: CONFIRM ══════ */}
      {step === 3 && file && (
        <section className="card" aria-labelledby="step3-title">
          <div className="section-header">
            <h2 id="step3-title">🤖 Confirm AI Import</h2>
          </div>

          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>🧠</span>
            <div>
              The AI will intelligently map your columns to GrowEasy CRM fields, extract statuses, notes, 
              and contact details — even from messy or ambiguous CSV formats.
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
            <div className="summary-card">
              <div className="sc-label">File</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem', wordBreak: 'break-all' }}>{file.name}</div>
            </div>
            <div className="summary-card blue">
              <div className="sc-label">Total rows to process</div>
              <div className="sc-value">{previewRows.length}</div>
            </div>
            <div className="summary-card">
              <div className="sc-label">Columns detected</div>
              <div className="sc-value" style={{ color: 'var(--accent-secondary)' }}>{headers.length}</div>
            </div>
          </div>

          <div className="confirm-section">
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Ready to import {previewRows.length} records?</p>
              <p>This will call the AI API. Processing may take a few seconds.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)} id="btn-back-from-confirm">Back</button>
              <button className="btn btn-primary" onClick={handleConfirmImport} id="btn-confirm-import">
                🚀 Confirm Import
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════ STEP 4: RESULTS (loading or done) ══════ */}
      {step === 4 && (
        <section className="card" aria-labelledby="step4-title">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner-wrap">
                <div className="spinner" />
                <div className="spinner-inner" />
              </div>
              <div>
                <p className="loading-label" style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  AI is extracting CRM records…
                </p>
                <p className="loading-sub">Mapping fields, inferring statuses, validating records</p>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" />
              </div>
              <p className="loading-sub">This may take 10–30 seconds depending on CSV size</p>
            </div>
          ) : results ? (
            <>
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <h2 id="step4-title">✅ Import Complete</h2>
                <button className="btn btn-secondary" onClick={handleReset} id="btn-import-another">
                  + Import Another
                </button>
              </div>

              <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                <span>🎉</span>
                <span>Successfully processed <strong>{results.summary.total_rows}</strong> rows — 
                  <strong> {results.summary.total_imported}</strong> imported, 
                  <strong> {results.summary.total_skipped}</strong> skipped.</span>
              </div>

              <SummaryCard summary={results.summary} />

              <ResultsTable imported={results.imported} skipped={results.skipped} />
            </>
          ) : null}
        </section>
      )}
    </main>
  );
}
