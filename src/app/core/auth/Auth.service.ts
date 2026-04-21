import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
import { AuthResponse, LoginRequest, User } from "./Auth.model";

@Injectable({
    providedIn: "root",
})

export class AuthService {
    private apiUrl = "http://localhost:8080";

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(
        this.hasValidToken()
    );

    public isAuthenticaded$ = this.isAuthenticatedSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable;

    constructor(private http: HttpClient) { };

    public login(email: string, password: string): Observable<AuthResponse> {
        const request: LoginRequest = { email, password };

        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request)
            .pipe(
                tap((response) => {
                    this.saveTokens(response.accessToken, response.refreshToken);
                    this.isAuthenticatedSubject.next(true);
                }),
                catchError((error) => {
                    console.error("Login error", error)
                    return throwError(() => error)
                })
            );
    }

    public logout():void {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
    }

    public refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            return throwError(() => new Error('No refresh token avaible'))
        }

        return this.http.post<AuthResponse>(
            `${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
                tap((response) => {
                    this.saveTokens(response.accessToken, response.refreshToken);
                }), catchError((error) => {
                    this.logout();
                    return throwError(() => error)
                })
            )
        }
    /**
    * Verifica se tem um token válido no Local Storage
    */
    public hasValidToken(): boolean {
        return !!localStorage.getItem("accessToken");
    }

    /**
    * Retorna o access token do Local Storage
    */
    public getAccessToken(): string | null {
        return localStorage.getItem("accessToken");
    }

    /**
     * Retorna o refresh token do Local Storage
     */
    public getRefreshToken(): string | null {
        return localStorage.getItem("refreshToken");
    }

    /**
     * Salva tokens no Local Storage
     */
    private saveTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken)
    }

    /**
   * Define o usuário logado
   * (chamado depois de buscar dados do usuário com GET /user)
   */
    public setCurrentUser(user: User): void {
        this.currentUserSubject.next(user);
    }
}
