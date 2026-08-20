export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  totalCopies: number;
}

export interface CreateMemberInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface BorrowBookInput {
  bookId: string;
  memberId: string;
}

export interface ReturnBookInput {
  recordId: string;
}