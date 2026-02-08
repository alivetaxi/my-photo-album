import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
import { Me } from './me';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private firebaseAuth = inject(Auth);

  // --- internal state ---
  private readonly _me = signal<Me>({ role: 'GUEST' });
  private readonly _loaded = signal(false);

  // --- public state ---
  readonly me = this._me.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly isAuthenticated = computed(() => !!this._me().uid);
  readonly isAdmin = computed(() => this._me().role === 'ADMIN');
  readonly isFamily = computed(() =>
    this._me().role === 'FAMILY' || this._me().role === 'ADMIN'
  );

  constructor() {
    this.loadMe();
  }

  // --- data loading ---

  private loadMe(): void {
    this.http.get<Me>('/api/me').subscribe({
      next: me => this._me.set(me),
      error: () => this._me.set({ role: 'GUEST' }),
      complete: () => this._loaded.set(true),
    });
  }

  // --- auth actions ---

  async login(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.firebaseAuth, provider);
    this.loadMe();
  }

  async logout(): Promise<void> {
    await signOut(this.firebaseAuth);
    this._me.set({ role: 'GUEST' });
  }
}
