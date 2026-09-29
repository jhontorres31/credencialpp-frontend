import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EleccionModel } from '../models/eleccion-model';

@Injectable({
  providedIn: 'root',
})
export class ConfieleccionService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/eleccion';

  getEleccionById(id: number): Observable<EleccionModel>{

    return this.http.get<EleccionModel>(`${this.apiUrl}/${id}`);
  }

  updateEleccion(id: number, nombre_eleccion: Partial<EleccionModel>):Observable<EleccionModel>{

    return this.http.put<EleccionModel>(`${this.apiUrl}/${id}`, nombre_eleccion);
  }

}



