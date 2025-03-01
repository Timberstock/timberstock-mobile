import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type WriteOperation = 'set' | 'update' | 'delete';

export class OfflineWritingFirestoreService {
  /**
   * Waits for a write operation to be persisted to the local cache before resolving.
   * This is useful for offline-first applications where you need to ensure the data
   * is available locally before proceeding.
   */
  static async writeAndWaitForLocalPersistence<T>(
    docRef: FirebaseFirestoreTypes.DocumentReference,
    operation: WriteOperation,
    data?: T,
    options?: FirebaseFirestoreTypes.SetOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let hasWriteStarted = false;

        // Start the write operation
        const writePromise =
          operation === 'set'
            ? options
              ? docRef.set(data as any, options)
              : docRef.set(data as any)
            : operation === 'update'
              ? docRef.update(data as any)
              : docRef.delete();

        // Set up a one-time snapshot listener to detect when the write is available
        // THIS LISTENER IS SPECIFIC FOR THE DOCREF THAT THE DATA IS BEING WRITTEN TO
        const unsubscribe = docRef.onSnapshot(
          {
            includeMetadataChanges: true, // We need this to get metadata changes like changes in fromCache
          },
          (snapshot) => {
            console.log('📝 [OfflineWritingFirestoreService] Snapshot:', {
              fromCache: snapshot.metadata.fromCache,
              hasPendingWrites: snapshot.metadata.hasPendingWrites,
              exists: snapshot.exists,
              hasWriteStarted,
            });

            // Skip the initial snapshot (before our write)
            if (!hasWriteStarted) {
              hasWriteStarted = true;
              return;
            }

            // At this point, we've gotten a snapshot after our write started
            // This means the write has reached the local cache
            console.log(
              '✅ [OfflineWritingFirestoreService] Write confirmed in local cache'
            );
            unsubscribe();
            resolve();
          },
          (error) => {
            console.error('❌ [OfflineWritingFirestoreService] Error:', error);
            unsubscribe();
            reject(error);
          }
        );

        // Handle write operation errors
        writePromise.catch((error) => {
          console.error('❌ [OfflineWritingFirestoreService] Write error:', error);
          unsubscribe();
          reject(error);
        });
      } catch (error) {
        console.error('❌ [OfflineWritingFirestoreService] Unexpected error:', error);
        reject(error);
      }
    });
  }

  /**
   * Helper method specifically for set operations
   */
  static async setAndWaitForLocalPersistence<T>(
    docRef: FirebaseFirestoreTypes.DocumentReference,
    data: T,
    options?: FirebaseFirestoreTypes.SetOptions
  ): Promise<void> {
    return this.writeAndWaitForLocalPersistence(docRef, 'set', data, options);
  }

  /**
   * Helper method specifically for update operations
   */
  static async updateAndWaitForLocalPersistence<T>(
    docRef: FirebaseFirestoreTypes.DocumentReference,
    data: Partial<T>
  ): Promise<void> {
    return this.writeAndWaitForLocalPersistence(docRef, 'update', data);
  }

  /**
   * Helper method specifically for delete operations
   */
  static async deleteAndWaitForLocalPersistence(
    docRef: FirebaseFirestoreTypes.DocumentReference
  ): Promise<void> {
    return this.writeAndWaitForLocalPersistence(docRef, 'delete');
  }
}
