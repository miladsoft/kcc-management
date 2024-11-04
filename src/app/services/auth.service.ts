import { Injectable } from '@angular/core';
import { Observable, Subject, of, tap } from 'rxjs';
import { DidService } from '../services/did.service';
import { SignUp } from '../models/SignUp.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject: Subject<boolean> = new Subject<boolean>();
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  isLoggedIn: boolean = false;
  redirectUrl: string | null = null;
  private readonly LS_KEY = 'authState';

  constructor(private didService: DidService) {
    const savedState = localStorage.getItem(this.LS_KEY);
    if (savedState) {
      const { isLoggedIn, redirectUrl } = JSON.parse(savedState);
      this.isLoggedIn = isLoggedIn;
      this.redirectUrl = redirectUrl;
    }
  }

  /**
   * Logs in the user by generating or retrieving a DID.
   * @returns {Observable<boolean>} An observable that emits the login status.
   */
  logIn(): Observable<boolean> {
    return of(true).pipe(
      tap(async () => {
        try {
          const did = await this.didService.createDid();
          this.isLoggedIn = !!did;
          this.saveStateToLocalStorage(did);
          this.isLoggedInSubject.next(this.isLoggedIn);
        } catch (error) {
          console.error('Failed to log in with DID:', error);
        }
      })
    );
  }

  /**
   * Saves the current authentication state to local storage.
   * @param did - The DID of the logged-in user.
   */
  private saveStateToLocalStorage(did?: string): void {
    const authState = JSON.stringify({
      isLoggedIn: this.isLoggedIn,
      redirectUrl: this.redirectUrl,
      did: this.isLoggedIn ? did : undefined,
    });
    localStorage.setItem(this.LS_KEY, authState);
  }

  /**
   * Logs out the user and clears the authentication state.
   */
  logOut(): void {
    this.isLoggedIn = false;
    this.saveStateToLocalStorage();
    this.isLoggedInSubject.next(this.isLoggedIn);
    this.didService.logout();
  }

  /**
   * Retrieves the logged-in user's information based on the stored DID.
   * @returns {SignUp | undefined} The user information if found, otherwise undefined.
   */
  getLoggedUser(): SignUp | undefined {
    const savedState = localStorage.getItem(this.LS_KEY);
    if (savedState) {
      const { isLoggedIn, did } = JSON.parse(savedState);
      if (isLoggedIn && did) {
        const localUsers = localStorage.getItem('appUsers');
        const users: SignUp[] = localUsers ? JSON.parse(localUsers) : [];
        return users.find((user) => user.did === did);
      }
    }
    return undefined;
  }

  /**
   * Updates user information based on their DID.
   * @param user - The user information to update.
   */
  updateUser(user: SignUp): void {
    const localUsers = localStorage.getItem('appUsers');
    let users: SignUp[] = localUsers ? JSON.parse(localUsers) : [];

    users = users.map((u) => (u.did === user.did ? user : u));

    localStorage.setItem('appUsers', JSON.stringify(users));
  }
}
