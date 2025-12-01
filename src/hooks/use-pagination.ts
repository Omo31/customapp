
'use client';

import { useState, useMemo } from 'react';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';

const PAGE_SIZE = 10; // Default page size

interface UsePaginationProps<T> {
  data: (T & { doc: DocumentSnapshot<DocumentData> })[] | null;
  pageSize?: number;
}

export function usePagination<T>({ data, pageSize = PAGE_SIZE }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot<DocumentData> | null)[]>([null]);

  const lastDoc = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data[data.length - 1].doc;
  }, [data]);

  const canGoNext = data ? data.length === pageSize : false;
  const canGoPrevious = currentPage > 1;

  const handleNextPage = () => {
    if (canGoNext && lastDoc) {
      setPageHistory((prev) => [...prev, lastDoc]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setPageHistory((prev) => prev.slice(0, -1));
      setCurrentPage((prev) => prev - 1);
    }
  };

  const startAfter = pageHistory[currentPage - 1];

  return {
    currentPage,
    handleNextPage,
    handlePreviousPage,
    canGoNext,
    canGoPrevious,
    startAfter,
  };
}
