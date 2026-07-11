const { Readable } = require('stream');
const csvParser = require('csv-parser');

/**
 * Parse a Buffer containing CSV data into an array of plain objects.
 * Works with any header names — does not assume fixed columns.
 *
 * @param {Buffer} buffer
 * @returns {Promise<Array<Record<string, string>>>}
 */
function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const readable = Readable.from(buffer.toString('utf8'));

    readable
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim(),
          mapValues: ({ value }) => (value ? value.trim() : ''),
          skipEmptyLines: true,
        })
      )
      .on('data', (row) => {
        // Only keep rows that have at least one non-empty value
        const hasContent = Object.values(row).some((v) => v !== '');
        if (hasContent) rows.push(row);
      })
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

module.exports = { parseCsvBuffer };
