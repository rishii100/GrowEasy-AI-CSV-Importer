const { parseCsvBuffer } = require('../services/csv.service');
const { extractCrmRecords } = require('../services/ai.service');

/**
 * POST /api/import
 * Accepts a CSV file, runs AI extraction, returns CRM records.
 */
async function importCsv(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    // 1. Parse CSV buffer → raw rows (array of plain objects)
    const rawRows = await parseCsvBuffer(req.file.buffer);

    if (rawRows.length === 0) {
      return res.status(422).json({ error: 'CSV file contains no data rows.' });
    }

    // 2. AI extraction with batching
    const { imported, skipped } = await extractCrmRecords(rawRows);

    return res.json({
      success: true,
      summary: {
        total_rows: rawRows.length,
        total_imported: imported.length,
        total_skipped: skipped.length,
      },
      imported,
      skipped,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { importCsv };
