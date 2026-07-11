const { chunkArray, sleep } = require('../src/utils/helpers');

describe('chunkArray', () => {
  it('splits an array into equal chunks', () => {
    const result = chunkArray([1, 2, 3, 4, 5, 6], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
  });

  it('handles a remainder chunk', () => {
    const result = chunkArray([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns empty array for empty input', () => {
    expect(chunkArray([], 5)).toEqual([]);
  });

  it('handles chunk size larger than array', () => {
    expect(chunkArray([1, 2], 10)).toEqual([[1, 2]]);
  });
});

describe('sleep', () => {
  it('resolves after the given delay', async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });
});
