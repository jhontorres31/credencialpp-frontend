import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { ObservadoresModel } from '../models/observadores-model';

@Injectable({
  providedIn: 'root',
})
export class ObservadoresService {

  private http = inject(HttpClient);
  private url = 'http://localhost:8000/observadores/bulk';
  private apiUrl = 'http://localhost:8000/observadores';

   getObservadores(): Observable<ObservadoresModel[]> {
    return this.http.get<ObservadoresModel[]>(this.apiUrl);
  }


  private COLUMN_MAP: Record<string, keyof ObservadoresModel> ={

    'nombres': 'nombres',
    'apellidos': 'apellidos',
    'documento':'documento',
    'departamento': 'departamento',
    'municipio':'municipio',
    'resolucion': 'resolucion'
  };

  guardarObservadores(observadores: ObservadoresModel[]):Observable<any>{
    return this.http.post(this.url, observadores);
  }

   parseFile(file: File): Promise<{ data: ObservadoresModel[]; errors: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

          if (rows.length === 0) {
            resolve({ data: [], errors: ['El archivo está vacío o no tiene datos válidos.'] });
            return;
          }

          const errors: string[] = [];
          const observadores: ObservadoresModel[] = [];

          rows.forEach((row, index) => {
            const mapped: Partial<ObservadoresModel> = {};

            Object.keys(row).forEach(key => {
              const normalizedKey = key.toLowerCase().trim();
              const field = this.COLUMN_MAP[normalizedKey];
              if (field) {
                mapped[field] = String(row[key]).trim();
              }
            });

            const missing: string[] = [];
            const required: (keyof ObservadoresModel)[] = [
              'nombres', 'apellidos', 'documento', 'departamento',
              'municipio','resolucion'
            ];

            required.forEach(f => {
              if (!mapped[f]) missing.push(f);
            });

            if (missing.length > 0) {
              errors.push(`Fila ${index + 2}: Campos obligatorios faltantes: ${missing.join(', ')}`);
            }

            observadores.push({
              id_observador: undefined as any,
              nombres: mapped.nombres || '',
              apellidos: mapped.apellidos || '',
              documento: mapped.documento || '',
              departamento: mapped.departamento || '',
              municipio: mapped.municipio || '',
              resolucion: mapped.resolucion || '',

            });
          });

          resolve({ data: observadores, errors });
        } catch (err) {
          reject(new Error('No se pudo leer el archivo Excel.'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsArrayBuffer(file);
    });
  }



}
