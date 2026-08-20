/**
 * Fine calculation logic.
 * Kept in one place so the "money" rule only ever lives in one file.
 */

const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 5; // currency units per overdue day
const BORROW_PERIOD_DAYS = Number(process.env.BORROW_PERIOD_DAYS) || 14;

/** Returns the due date, N days after the borrow date. */
export function calculateDueDate(borrowDate: Date): Date {
  const due = new Date(borrowDate);
  due.setDate(due.getDate() + BORROW_PERIOD_DAYS);
  return due;
}

/**
 * Calculates the fine owed for a borrow record.
 * @param dueDate      the date the book was due back
 * @param compareDate  return date if returned, otherwise "now" (for a live, still-borrowed record)
 */
export function calculateFine(dueDate: Date, compareDate: Date = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor(
    (compareDate.getTime() - new Date(dueDate).getTime()) / msPerDay
  );

  if (diffDays <= 0) return 0;
  return diffDays * FINE_PER_DAY;
}

export function isOverdue(dueDate: Date, returnDate: Date | null): boolean {
  const compare = returnDate ?? new Date();
  return compare.getTime() > new Date(dueDate).getTime();
}

export { FINE_PER_DAY, BORROW_PERIOD_DAYS };