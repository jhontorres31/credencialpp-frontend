import { Observable } from 'rxjs';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Testigos } from '../models/testigos-model';

@Injectable({
  providedIn: 'root',
})
export class EditcredencialService {

 private readonly apiUrl = 'http://localhost:8000/testigos/';
private readonly http = inject(HttpClient);


  public allTestigos = signal<Testigos[]>([]);


  getTestigos(): Observable<Testigos[]> {
    return this.http.get<Testigos[]>(this.apiUrl);
  }


  createTestigo(testigo: Testigos): Observable<Testigos> {
    return this.http.post<Testigos>(this.apiUrl, testigo);
  }


  updateTestigo(id_testigo: string | number, testigo: Testigos): Observable<Testigos> {
    return this.http.put<Testigos>(`${this.apiUrl}${id_testigo}`, testigo);
  }

  updateTestigoInSignal(testigoActualizado: Testigos): void {
  this.allTestigos.update(lista =>
    lista.map(t => {
      const idActual = t.id_testigo || t.id_testigo;
      const idNuev = testigoActualizado.id_testigo|| testigoActualizado.id_testigo;
      return String(idActual) === String(idNuev) ? testigoActualizado : t;
    })
  );
}

  deleteTestigo(id_testigo: string | number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}${id_testigo}`);
}


}
