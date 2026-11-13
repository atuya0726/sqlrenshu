import { describe, expect, it } from 'vitest';
import { gradeResult } from './grader';

const expected = { columns: ['id', 'amount'], rows: [{ id: 1, amount: 10 }, { id: 2, amount: 20 }] };

describe('gradeResult', () => {
  it('compares columns, rows and values', () => {
    expect(gradeResult(expected, expected, { mode:'result', compareRowOrder:true, compareColumnOrder:true, numericTolerance:0 }).correct).toBe(true);
  });
  it('can ignore row order and normalize PostgreSQL numeric strings', () => {
    const actual = { columns:['id','amount'], rows:[{id:2,amount:'20'},{id:1,amount:'10'}] };
    expect(gradeResult(actual, expected, { mode:'result', compareRowOrder:false, compareColumnOrder:true, numericTolerance:0 }).correct).toBe(true);
  });
  it('grades a table-state result as a plain result set after the user SQL has run', () => {
    const grading = { mode: 'table-state', compareRowOrder: true, compareColumnOrder: true, numericTolerance: 0, stateQuery: 'SELECT * FROM t ORDER BY id' } as const;
    expect(gradeResult(expected, expected, grading).correct).toBe(true);
    const unchanged = { columns: ['id', 'amount'], rows: [{ id: 1, amount: 10 }, { id: 2, amount: 25 }] };
    expect(gradeResult(unchanged, expected, grading).correct).toBe(false);
    expect(gradeResult({ columns: ['id', 'amount'], rows: [{ id: 1, amount: 10 }] }, expected, grading).correct).toBe(false);
  });
});
