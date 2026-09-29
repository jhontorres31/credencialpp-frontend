import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Testigos } from '../models/testigos-model';

@Injectable({
  providedIn: 'root',
})
export class CargaIndividualService {

  private http = inject(HttpClient);
  private url = 'http://localhost:8000/testigos/';

  inscribir(data:Testigos){
    return this.http.post(this.url, data);
  }
}
