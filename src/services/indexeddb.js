import { openDB } from 'idb';

const DB_NAME = 'timer-app-db';
const DB_VERSION = 1;
const FILE_STORE = 'files';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(FILE_STORE)) {
      db.createObjectStore(FILE_STORE);
    }
  }
});

export async function saveFileBlob(id, blob) {
  const db = await dbPromise;
  return db.put(FILE_STORE, blob, id);
}

export async function getFileBlob(id) {
  const db = await dbPromise;
  return db.get(FILE_STORE, id);
}

export async function deleteFileBlob(id) {
  const db = await dbPromise;
  return db.delete(FILE_STORE, id);
}

export async function clearAllFileBlobs() {
  const db = await dbPromise;
  return db.clear(FILE_STORE);
}

export async function listFileKeys() {
  const db = await dbPromise;
  return db.getAllKeys(FILE_STORE);
}

const indexedDBService = {
  saveFileBlob,
  getFileBlob,
  deleteFileBlob,
  clearAllFileBlobs,
  listFileKeys
};

export default indexedDBService;
