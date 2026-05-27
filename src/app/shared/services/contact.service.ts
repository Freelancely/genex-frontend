import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactApiResponse {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly endpoint = `${environment.apiUrl}contact/send`;

  constructor(private http: HttpClient) {}

  sendMessage(payload: ContactMessagePayload): Observable<ContactApiResponse> {
    return this.http.post<ContactApiResponse>(this.endpoint, payload);
  }
}
