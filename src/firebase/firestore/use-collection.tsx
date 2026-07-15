'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, startAfter, endBefore, Query, DocumentData, collectionGroup, getDocs, DocumentSnapshot, QueryConstraint, QueryDocumentSnapshot } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export interface UseCollectionOptions {
    where?: [string, any, any] | [string, any, any][];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
    startAfter?: DocumentSnapshot<DocumentData> | null;
    endBefore?: DocumentSnapshot<DocumentData> | null;
    disabled?: boolean;
}

// Add a 'doc' property to the generic type T to hold the snapshot
type WithDoc<T> = T & { doc: QueryDocumentSnapshot<DocumentData> };


const useMemoFirebase = <T,>(factory: () => T | null, deps: any[]): T | null => {
  return useMemo(factory, deps);
};

export const useCollection = <T,>(
  db: Firestore,
  path: string,
  options: UseCollectionOptions = {},
  deps: any[] = []
) => {
  const [data, setData] = useState<WithDoc<T>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const queryRef = useMemoFirebase(() => {
    // If the query is explicitly disabled, don't run it.
    if (options.disabled) return null;
    
    if (!db || !path) return null;
    
    const constraints: QueryConstraint[] = [];

    // Check for empty 'in' or 'array-contains-any' queries
    if (options.where) {
        const whereConditions = Array.isArray(options.where[0]) ? options.where as [string, any, any][] : [options.where as [string, any, any]];
        for (const condition of whereConditions) {
            const [field, op, value] = condition;
            if (['in', 'array-contains-any'].includes(op) && (!Array.isArray(value) || value.length === 0)) {
                return null; // Firestore 'in' queries cannot have an empty array.
            }
             if (value === '' || value === undefined || value === null) {
                if (op !== '==' && op !== '!=') {
                    // Only allow null/empty checks for simple equality
                } else {
                    return null;
                }
            }
            constraints.push(where(field, op, value));
        }
    }

    if (options.orderBy) {
        constraints.push(orderBy(options.orderBy[0], options.orderBy[1]));
    }
    if (options.startAfter) {
        constraints.push(startAfter(options.startAfter));
    }
     if (options.endBefore) {
        constraints.push(endBefore(options.endBefore));
    }
    if (options.limit) {
        constraints.push(limit(options.limit));
    }

    return query(collection(db, path), ...constraints);
  }, [db, path, JSON.stringify(options), ...deps]);


  useEffect(() => {
    if (options.disabled) {
      setData([]);
      setLoading(false);
      return;
    }
    
    if (queryRef === null) {
      setData([]);
      setLoading(false);
      return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), doc } as unknown as WithDoc<T>));
      setData(docs);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
      const permissionError = new FirestorePermissionError({
        path: path,
        operation: 'list'
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsubscribe();
  }, [queryRef, path, options.disabled]);

  return { data, loading, error };
};

export const useCollectionGroup = <T,>(
    db: Firestore,
    path: string,
    options: UseCollectionOptions = {}
) => {
    const [data, setData] = useState<WithDoc<T>[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const queryRef = useMemoFirebase(() => {
        if (options.disabled) return null;
        if (!db || !path) return null;

        const constraints: QueryConstraint[] = [];
        
        if (options.where) {
            const whereConditions = Array.isArray(options.where[0]) ? options.where as [string, any, any][] : [options.where as [string, any, any]];
            for (const condition of whereConditions) {
                const [field, op, value] = condition;
                 if (['in', 'array-contains-any'].includes(op) && (!Array.isArray(value) || value.length === 0)) {
                    return null;
                }
                constraints.push(where(field, op, value));
            }
        }

        if (options.orderBy) {
            constraints.push(orderBy(options.orderBy[0], options.orderBy[1]));
        }
        if (options.startAfter) {
            constraints.push(startAfter(options.startAfter));
        }
        if (options.endBefore) {
            constraints.push(endBefore(options.endBefore));
        }
        if (options.limit) {
            constraints.push(limit(options.limit));
        }
        
        return query(collectionGroup(db, path), ...constraints);
    }, [db, path, JSON.stringify(options)]);

    useEffect(() => {
        if (options.disabled) {
            setData([]);
            setLoading(false);
            return;
        }

        if (!queryRef) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
            const docs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, doc } as unknown as WithDoc<T>));
            setData(docs);
            setLoading(false);
        }, (err) => {
            setError(err);
            setLoading(false);
            const permissionError = new FirestorePermissionError({
                path: path,
                operation: 'list'
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        return () => unsubscribe();
    }, [queryRef, path, options.disabled]);
    
    return { data, loading, error };
};
