'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, startAfter, endBefore, Query, DocumentData, collectionGroup } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

interface UseCollectionOptions {
    where?: [string, any, any];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
    startAfter?: any;
    endBefore?: any;
}

// A memoization utility for Firestore queries
const useMemoFirebase = <T,>(factory: () => T | null, deps: any[]): T | null => {
  return useMemo(factory, deps);
};

export const useCollection = <T,>(
  db: Firestore,
  path: string,
  options: UseCollectionOptions = {}
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queryRef = useMemoFirebase(() => {
    if (!db || !path) return null;
    
    let q: Query<DocumentData> = collection(db, path);

    if (options.where) {
      q = query(q, where(options.where[0], options.where[1], options.where[2]));
    }
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy[0], options.orderBy[1]));
    }
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }
    if (options.endBefore) {
        q = query(q, endBefore(options.endBefore));
    }

    return q;
  }, [db, path, JSON.stringify(options)]); // Deep dependency check


  useEffect(() => {
    if (!queryRef) {
      setLoading(false);
      return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
      setData(docs);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
      console.error(err);
    });

    return () => unsubscribe();
  }, [queryRef]);

  return { data, loading, error };
};

export const useCollectionGroup = <T,>(
    db: Firestore,
    path: string,
    options: UseCollectionOptions = {}
) => {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const queryRef = useMemoFirebase(() => {
        if (!db || !path) return null;

        let q: Query<DocumentData> = collectionGroup(db, path);

        if (options.where) {
            q = query(q, where(options.where[0], options.where[1], options.where[2]));
        }
        if (options.orderBy) {
            q = query(q, orderBy(options.orderBy[0], options.orderBy[1]));
        }
        if (options.limit) {
            q = query(q, limit(options.limit));
s        }
        
        return q;
    }, [db, path, JSON.stringify(options)]);

    useEffect(() => {
        if (!queryRef) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
            const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
            setData(docs);
            setLoading(false);
        }, (err) => {
            setError(err);
            setLoading(false);
            console.error(err);
        });

        return () => unsubscribe();
    }, [queryRef]);
    
    return { data, loading, error };
};
