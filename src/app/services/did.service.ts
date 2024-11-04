import { Injectable } from '@angular/core';
import { DidDht } from '@web5/dids';

@Injectable({
  providedIn: 'root'
})
export class DidService {
  private readonly didStorageKey = 'userDID';

  async createDid(): Promise<string> {
    const didDht = await DidDht.create();
    const did = didDht.uri;
    localStorage.setItem(this.didStorageKey, did);
    return did;
  }

  getDid(): string | null {
    return localStorage.getItem(this.didStorageKey);
  }

  clearDid(): void {
    localStorage.removeItem(this.didStorageKey);
  }
}
