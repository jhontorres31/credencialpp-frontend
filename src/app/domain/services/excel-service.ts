import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { Testigos } from '../models/testigos-model';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {

  private http = inject(HttpClient);
  private API_URL = 'http://localhost:8000/testigos/bulk';

  private COLUMN_MAP: Record<string, keyof Testigos> = {
    'nom departamento (opcional)': 'nom_departamento',
    'nom_departamento': 'nom_departamento',
    'nom municipio (opcional)': 'nom_municipio',
    'nom_municipio': 'nom_municipio',
    'nombre': 'nombre',
    'primer nombre': 'nombre',
    'segundo nombre': 'segundo_nombre',
    'apellido': 'apellido',
    'primer apellido': 'apellido',
    'segundo apellido': 'segundo_apellido',
    'numero de documento': 'num_documento',
    'número de documento': 'num_documento',
    'documento': 'num_documento',
    'nº documento': 'num_documento',
    'n° documento': 'num_documento',
    'tipo testigo': 'tipo_testigo',
    'tipo_testigo': 'tipo_testigo',
    'organizacion': 'organizacion',
    'nombre organización': 'organizacion',
    'partido': 'organizacion',
    'celular': 'celular',
    'celular (opcional) / de ser diligenciado se somete a tratamiento de datos personales': 'celular',
    'correo': 'correo',
    'correo electrónico (opcional) / de ser diligenciado se somete a tratamiento de datos personales': 'correo',
    'correo electronico (opcional) / de ser diligenciado se somete a tratamiento de datos personales': 'correo',
    'zona': 'zona',
    'mesa (opcional)': 'mesa',
    'mesa': 'mesa',
    'nom puesto (opcional)': 'nom_puesto',
    'nom_puesto': 'nom_puesto',
    'cod departamento': 'cod_departamento',
    'cod municipio': 'cod_municipio',
    'cod puesto': 'cod_puesto',
    'credencial': 'tipo_credencial',
    'resolucion': 'resolucion',
    'comision' : 'comision'
  };

  guardarTestigos(testigos: Testigos[]): Observable<any> {
    return this.http.post(this.API_URL, testigos);
  }

  parseFile(file: File): Promise<{ data: Testigos[]; errors: string[] }> {
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
          const testigos: Testigos[] = [];

          rows.forEach((row, index) => {
            const mapped: Partial<Testigos> = {};

            Object.keys(row).forEach(key => {
              const normalizedKey = key.toLowerCase().trim();
              const field = this.COLUMN_MAP[normalizedKey];
              if (field) {
                mapped[field] = String(row[key]).trim();
              }
            });

            const missing: string[] = [];
            const required: (keyof Testigos)[] = [
              'nom_departamento', 'nom_municipio', 'nombre', 'apellido',
              'num_documento', 'organizacion', 'tipo_testigo','tipo_credencial','resolucion'
            ];

            required.forEach(f => {
              if (!mapped[f]) missing.push(f);
            });

            if (missing.length > 0) {
              errors.push(`Fila ${index + 2}: Campos obligatorios faltantes: ${missing.join(', ')}`);
            }

            testigos.push({
              id_testigo: undefined as any,
              cod_departamento: mapped.cod_departamento || '',
              cod_municipio: mapped.cod_municipio || '',
              zona: mapped.zona || '',
              cod_puesto: mapped.cod_puesto || '',
              nom_departamento: mapped.nom_departamento || '',
              nom_municipio: mapped.nom_municipio || '',
              nom_puesto: mapped.nom_puesto || '',
              mesa: mapped.mesa || '',
              organizacion: mapped.organizacion || '',
              tipo_testigo: mapped.tipo_testigo || '',
              num_documento: mapped.num_documento || '',
              nombre: mapped.nombre || '',
              segundo_nombre: mapped.segundo_nombre || '',
              apellido: mapped.apellido || '',
              segundo_apellido: mapped.segundo_apellido || '',
              celular: mapped.celular || '',
              correo: mapped.correo || '',
              tipo_credencial: mapped.tipo_credencial || '',
              resolucion: mapped.resolucion || '',
              comision: mapped.comision || '',
            });
          });

          resolve({ data: testigos, errors });
        } catch (err) {
          reject(new Error('No se pudo leer el archivo Excel.'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsArrayBuffer(file);
    });
  }
}
