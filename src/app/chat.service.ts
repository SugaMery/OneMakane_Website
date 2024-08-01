import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'https://api.onemakan.com/v1';
  private accessToken =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJvbmVtYWthbiIsInN1YiI6NDMsImlhdCI6MTcxNjQ1MTMyNCwiZXhwIjoxNzE2NDg3MzI0fQ.cxGhCYqCs2TOqYGb3iLACbOUvljLYTLrxtrvlGuMUidJ9T_wIAesC38d-HKcrsXv9v3reWfhGjaUnuCL7LSPRhv5aoEAB_Jw4gAXWhPmdFXQ5hjXxO60eKac-w9U8N7lp8PbouBB-sN-bmf1WpRvppNJoOFzwsBO6lscW6d-8go'; // Replace with the actual access token

  constructor(private http: HttpClient) {}

  getMessages(conversationId: number, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get<any>(`${this.apiUrl}/conversations/${conversationId}/messages`, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  sendMessage(
    conversationId: number,
    senderId: number,
    content: string,
    accessToken: string
  ): Observable<any> {
    const body = {
      conversation_id: conversationId,
      sender_id: senderId,
      content: content,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.post(`${this.apiUrl}/messages`, body, { headers });
  }

  createConversation(
    adId: number,
    buyerId: number,
    accessToken: string
  ): Observable<any> {
    const body = {
      ad_id: adId,
      buyer_id: buyerId,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.post(`${this.apiUrl}/conversations`, body, { headers });
  }
}
