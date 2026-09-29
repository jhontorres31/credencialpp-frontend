import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Partidos } from '../models/partidos-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PartidosService {

  private apiUrl = 'http://localhost:8000/partidos/';
  private http = inject(HttpClient);

  allPartidos = signal<Partidos[]>([]);


  getPartidos(): Observable<Partidos[]> {
      return this.http.get<Partidos[]>(this.apiUrl);
    }

  postPartidos(data:Partidos): Observable<Partidos>{
       return this.http.post<Partidos>(this.apiUrl, data);
     }

  addPartidoToSignal(nuevoPartido: Partidos): void {
    this.allPartidos.update((listaActual) => [...listaActual, nuevoPartido]);
  }

  deletePartido(id_partido: number): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(`${this.apiUrl}${id_partido}`);
}
}



