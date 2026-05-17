import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, throwError } from "rxjs";
import { AuthService } from "./Auth.service";
import { filter, switchMap, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isAuthRoute = req.url.includes('/auth/');
        const accessToken = this.authService.getAccessToken();

        if (accessToken && !isAuthRoute) {
            req = this.addTokenToRequest(req, accessToken);
        }

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status !== 401 || isAuthRoute) {
                    return throwError(() => error);
                }

                if (this.isRefreshing) {
                    return this.refreshTokenSubject.pipe(
                        filter((token) => token !== null),
                        take(1),
                        switchMap((token) => next.handle(this.addTokenToRequest(req, token!)))
                    );
                }

                return this.handle401Error(req, next);
            })
        );
    }

    private handle401Error(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {

        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);

        return this.authService.refreshToken().pipe(
            switchMap((response) => {
                this.isRefreshing = false;
                this.refreshTokenSubject.next(response.accessToken);

                return next.handle(this.addTokenToRequest(request, response.accessToken));
            }),
            catchError((error) => {
                this.isRefreshing = false;
                this.authService.logout();
                return throwError(() => error);
            })
        )
    }

    private addTokenToRequest(
        request: HttpRequest<any>,
        token: string
    ): HttpRequest<any> {
        const accessToken = token || this.authService.getAccessToken();

        if (accessToken) {
            return request.clone({
                setHeaders: {
                    Authorization: `${accessToken}`
                }
            });
        }
        return request;
    }
}
