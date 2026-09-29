import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Testigos } from '../models/testigos-model';

@Injectable({
  providedIn: 'root',
})
export class TestigosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/testigos';


  allTestigos = signal<Testigos[]>([]);
  searchQuery = signal<string>('');
  organizacionSeleccionada = signal<string>('');


  getTestigos(): Observable<Testigos[]> {
    return this.http.get<Testigos[]>(this.apiUrl);
  }


  listaOrganizaciones = computed(() => {
    const orgs = this.allTestigos().map(t => t.organizacion);
    return [...new Set(orgs)];
  });


  private formatearRangosMesas(mesas: string[]): string {
    const numeros = mesas
      .map(m => parseInt(m, 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    if (numeros.length === 0) return '';

    const rangos: string[] = [];
    let inicio = numeros[0];
    let fin = numeros[0];

    for (let i = 1; i < numeros.length; i++) {
      if (numeros[i] === fin + 1) {
        fin = numeros[i];
      } else {
        rangos.push(inicio === fin ? `${inicio}` : `${inicio} - ${fin}`);
        inicio = numeros[i];
        fin = numeros[i];
      }
    }
    rangos.push(inicio === fin ? `${inicio}` : `${inicio} - ${fin}`);

    return rangos.join(', ');
  }


  filteredTestigos = computed(() => {
    let testigos = this.allTestigos();


    const orgFiltro = this.organizacionSeleccionada();
    if (orgFiltro) {
      testigos = testigos.filter(t => t.organizacion === orgFiltro);
    }


    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      testigos = testigos.filter(t =>
        t.nombre?.toLowerCase().includes(query) ||
        t.apellido?.toLowerCase().includes(query) ||
        t.num_documento?.includes(query)
      );
    }

    const agrupadosMap = new Map<string, { registro: Testigos; mesas: string[] }>();

    for (const item of testigos) {
      const tipoCred = item.tipo_credencial ? item.tipo_credencial.trim().toUpperCase() : 'GENERAL';

      const puesto = item.nom_puesto ? item.nom_puesto.trim().toUpperCase() : 'SIN_PUESTO';


      const claveUnica = `${item.num_documento}_${tipoCred}_${puesto}`;
      const nuevaMesa = item.mesa?.toString().trim();

      if (!agrupadosMap.has(claveUnica)) {
        const arrayMesas = nuevaMesa ? [nuevaMesa] : [];

        agrupadosMap.set(claveUnica, {
          registro: { ...item },
          mesas: arrayMesas
        });
      } else {
        const grupo = agrupadosMap.get(claveUnica)!;


        if (nuevaMesa && !grupo.mesas.includes(nuevaMesa)) {
          grupo.mesas.push(nuevaMesa);
        }
      }
    }


    return Array.from(agrupadosMap.values()).map(grupo => {
      const testigoFinal = grupo.registro;
      if (grupo.mesas.length > 0) {
        testigoFinal.mesa = this.formatearRangosMesas(grupo.mesas);
      }
      return testigoFinal;
    });
  });
}


