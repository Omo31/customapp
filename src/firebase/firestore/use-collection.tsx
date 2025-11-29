'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, startAfter, endBefore, Query, DocumentData, collectionGroup, getDocs, DocumentSnapshot, QueryConstraint } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export interface UseCollectionOptions {
    where?: [string, any, any];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
    startAfter?: DocumentSnapshot<DocumentData> | null;
    endBefore?: DocumentSnapshot<DocumentData> | null;
}

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
  const [firstDoc, setFirstDoc] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData> | null>(null);

  const queryRef = useMemoFirebase(() => {
    if (!db || !path) return null;
    
    const constraints: QueryConstraint[] = [];

    if (options.where) {
      if (options.where[2] === '' || options.where[2] === undefined) {
          return null; 
      }
      constraints.push(where(options.where[0], options.where[1], options.where[2]));
    }
    if (options.orderBy) {
        constraints.push(orderBy(options.orderBy[0], options.orderBy[1]));
    }
    if (options.limit) {
        constraints.push(limit(options.limit));
    }
    if (options.startAfter) {
        constraints.push(startAfter(options.startAfter));
    }
     if (options.endBefore) {
        constraints.push(endBefore(options.endBefore));
    }

    return query(collection(db, path), ...constraints);
  }, [db, path, JSON.stringify(options)]); // Simple deep dependency check


  useEffect(() => {
    if (!queryRef) {
      setData([]);
      setLoading(false);
      return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
      setData(docs);
      setFirstDoc(querySnapshot.docs[0] || null);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
      console.error(err);
    });

    return () => unsubscribe();
  }, [queryRef]);

  return { data, loading, error, firstDoc, lastDoc };
};

export const useCollectionGroup = <T,>(
    db: Firestore,
    path: string,
    options: UseCollectionOptions = {}
) => {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [firstDoc, setFirstDoc] = useState<DocumentSnapshot<DocumentData> | null>(null);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot<DocumentData> | null>(null);

    const queryRef = useMemoFirebase(() => {
        if (!db || !path) return null;

        const constraints: QueryConstraint[] = [];

        if (options.where) {
            constraints.push(where(options.where[0], options.where[1], options.where[2]));
        }
        if (options.orderBy) {
            constraints.push(orderBy(options.orderBy[0], options.orderBy[1]));
        }
        if (options.limit) {
            constraints.push(limit(options.limit));
        }
         if (options.startAfter) {
            constraints.push(startAfter(options.startAfter));
        }
        if (options.endBefore) {
            constraints.push(endBefore(options.endBefore));
        }
        
        return query(collectionGroup(db, path), ...constraints);
    }, [db, path, JSON.stringify(options)]);

    useEffect(() => {
        if (!queryRef) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
            const docs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as T));
            setData(docs);
            setFirstDoc(querySnapshot.docs[0] || null);
            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
            setLoading(false);
        }, (err) => {
            setError(err);
            setLoading(false);
            console.error(err);
        });

        return () => unsubscribe();
    }, [queryRef]);
    
    return { data, loading, error, firstDoc, lastDoc };
};