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
        const isPublicRoute = req.url.includes('/auth/');

        if (this.authService.hasValidToken() && !isPublicRoute) {
            req = this.addTokenToRequest(req);
        }

        if (this.authService.hasValidToken()) {
            req = this.addTokenToRequest(req);
        }
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {

                if (error.status === 401 && !this.isRefreshing) {
                    return this.handle401Error(req, next);
                }

                if (error.status === 401 && this.isRefreshing) {
                    return this.refreshTokenSubject.pipe(
                        filter((token) => token !== null),
                        take(1),
                        switchMap((token) => {
                            req = this.addTokenToRequest(req, token!);
                            return next.handle(req);
                        })
                    );
                }

                return throwError(() => error);
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

                request = this.addTokenToRequest(request, response.accessToken);
                return next.handle(request);
            }),
            catchError((error) => {
                this.isRefreshing = false;
                this.authService.logout;
                return throwError(() => error);
            })
        )
    }

    private addTokenToRequest(
        request: HttpRequest<any>,
        token?: string
    ): HttpRequest<any> {
        const accessToken = token || this.authService.getAccessToken();

        if (accessToken) {
            return request.clone({
                setHeaders: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
        }
        return request;
    }
}