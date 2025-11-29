'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

// A memoization utility for Firestore references
const useMemoFirebase = <T,>(factory: () => T | null, deps: any[]): T | null => {
  return useMemo(factory, deps);
};

export const useDoc = <T,>(db: Firestore, path: string, docId?: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const docRef = useMemoFirebase(() => {
    if (!db || !path || !docId) return null;
    return doc(db, path, docId) as DocumentReference<T>;
  }, [db, path, docId]);

  useEffect(() => {
    if (!docRef) {
        setData(null);
        setLoading(false);
        return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
      console.error(`Error fetching doc: ${err}`);
    });

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error, docRef };
};
