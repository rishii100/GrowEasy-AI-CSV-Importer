const { parseCsvBuffer } = require('../src/services/csv.service');

describe('parseCsvBuffer', () => {
  it('parses a simple CSV with headers', async () => {
    const csv = `name,email,mobile\nJohn Doe,john@example.com,9876543210\nJane Smith,jane@example.com,9876543211`;
    const rows = await parseCsvBuffer(Buffer.from(csv));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ name: 'John Doe', email: 'john@example.com' });
  });

  it('trims whitespace from headers and values', async () => {
    const csv = `  name  ,  email  \n  Alice  ,  alice@example.com  `;
    const rows = await parseCsvBuffer(Buffer.from(csv));
    expect(rows[0].name).toBe('Alice');
    expect(rows[0].email).toBe('alice@example.com');
  });

  it('returns empty array for header-only CSV', async () => {
    const csv = `name,email,mobile`;
    const rows = await parseCsvBuffer(Buffer.from(csv));
    expect(rows).toHaveLength(0);
  });

  it('handles different column names (non-standard CSV)', async () => {
    const csv = `Full Name,Contact Email,Phone\nBob Builder,bob@build.com,1234567890`;
    const rows = await parseCsvBuffer(Buffer.from(csv));
    expect(rows[0]['Full Name']).toBe('Bob Builder');
    expect(rows[0]['Contact Email']).toBe('bob@build.com');
  });
});
