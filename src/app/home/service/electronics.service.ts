import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Banner {
  bannerId: string;
  hyperlink: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ElectronicsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBanners(category: 'all' | 'genex' | 'chunlan' | 'polytron'): Observable<{ success: boolean; message: Banner[] }> {
    return this.http.get<{ success: boolean; message: Banner[] }>(`${this.apiUrl}banner/${category}`);
  }
}
