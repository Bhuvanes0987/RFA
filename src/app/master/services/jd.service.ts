import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class JdService {
  constructor(
    private http : HttpClient
  ) {}

  setAndGetJDList(forceSet : boolean = false): Observable<any[]>{
    const cachedData = sessionStorage.getItem("JDList");

    if (!forceSet && cachedData) {
      console.log("Using cached JDList");
      return of(JSON.parse(cachedData)); // ✅ Return cached data as an observable
    }

    return this.http.get<any[]>(`${environment.SERVER_URL}/jd-list`).pipe(
      tap((data) => {
        console.log("Fetched JDList from backend:", data);
        sessionStorage.setItem("JDList", JSON.stringify(data));
      })
    );
  }
}
