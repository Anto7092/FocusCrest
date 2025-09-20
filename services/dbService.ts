const DB_NAME = 'FocusCrestDB';
const DB_VERSION = 1;
const STORE_NAME = 'customBackground';
const KEY = 'userBackground';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject("IndexedDB error");
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveCustomBackground = async (blob: Blob): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, KEY);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getCustomBackground = async (): Promise<Blob | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(KEY);
    
    request.onsuccess = () => {
        resolve(request.result ? request.result as Blob : null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteCustomBackground = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
