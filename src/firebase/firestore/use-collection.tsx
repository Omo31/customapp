
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, startAfter, endBefore, Query, DocumentData, collectionGroup, getDocs, DocumentSnapshot, QueryConstraint, QueryDocumentSnapshot } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export interface UseCollectionOptions {
    where?: [string, any, any];
    orderBy?: [string, 'asc' | 'desc'];
    limit?: number;
    startAfter?: DocumentSnapshot<DocumentData> | null;
    endBefore?: DocumentSnapshot<DocumentData> | null;
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
    if (!db || !path) return null;
    
    const constraints: QueryConstraint[] = [];

    if (options.where) {
      if (Array.isArray(options.where[2]) && options.where[2].length === 0) {
        return null;
      }
      if (options.where[2] === '' || options.where[2] === undefined || options.where[2] === null) {
          return null; 
      }
      constraints.push(where(options.where[0], options.where[1], options.where[2]));
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
  }, [db, path, JSON.stringify(options), ...deps]); // Simple deep dependency check


  useEffect(() => {
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
  }, [queryRef, path]);

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
        if (!db || !path) return null;

        const constraints: QueryConstraint[] = [];

	if (options.where) {
         if (options.where[2] === '' || options.where[2] === undefined) {
          return null; 
         }


        if (options.where) {
            constraints.push(where(options.where[0], options.where[1], options.where[2]));
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
      }
    }, [db, path, JSON.stringify(options)]);

    useEffect(() => {
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
    }, [queryRef, path]);
    
    return { data, loading, error };
};
