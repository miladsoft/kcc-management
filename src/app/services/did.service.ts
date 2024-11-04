import { Injectable } from '@angular/core';
import { Web5 } from '@web5/api';

@Injectable({
  providedIn: 'root'
})
export class DidService {
  private readonly didKey = 'userDid';

  constructor() {}

  /**
   * Creates a new DID using Web5 and stores it in local storage.
   * @returns A promise with the created DID string.
   */
  async createDid(): Promise<string> {
    try {
      // Assuming `did` is returned directly as a string
      const { did } = await Web5.connect();
      localStorage.setItem(this.didKey, did);  // Store the DID directly
      return did;
    } catch (error) {
      console.error('Failed to create DID:', error);
      throw new Error('Could not create DID.');
    }
  }

  /**
   * Retrieves the DID from local storage if it exists.
   * @returns The stored DID string or null if none exists.
   */
  getStoredDid(): string | null {
    return localStorage.getItem(this.didKey);
  }

  /**
   * Checks if a DID is stored in local storage, indicating the user is logged in.
   * @returns A boolean indicating authentication status.
   */
  async isAuthenticated(): Promise<boolean> {
    return !!this.getStoredDid();
  }

  /**
   * Logs out by clearing the DID from local storage.
   */
  logout(): void {
    localStorage.removeItem(this.didKey);
  }
}
