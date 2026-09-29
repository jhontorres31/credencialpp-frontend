import { Component, inject, computed, OnInit } from '@angular/core';
import { PartidosService } from '../services/partidos-service';
import { TestigosService } from '../services/testigos-service';

export interface ResumenPartido {
  nombre: string;
  totalTestigosUnicos: number; // Personas físicas únicas
  totalCredenciales: number;
}
@Component({
  selector: 'app-analisis-de-datos',
  imports: [],
  templateUrl: './analisis-de-datos.html',
  styleUrl: './analisis-de-datos.css',
})
export class AnalisisDeDatos implements OnInit {

  private partidosService = inject(PartidosService);
  private testigosService = inject(TestigosService);

 ngOnInit(): void {
    this.partidosService.getPartidos().subscribe({
      next: (datos) => this.partidosService.allPartidos.set(datos),
      error: (err) => console.error('Error al cargar partidos:', err)
    });

    this.testigosService.getTestigos().subscribe({
      next: (datos) => this.testigosService.allTestigos.set(datos),
      error: (err) => console.error('Error al cargar testigos:', err)
    });
  }

  // 1. Total de registros / credenciales físicas en la BD
  public totalCredenciales = computed(() => {
    return this.testigosService.allTestigos().length;
  });

  // 2. Total de personas físicas ÚNICAS (contando documentos únicos)
  public totalTestigosUnicos = computed(() => {
    const testigos = this.testigosService.allTestigos();
    const documentosUnicos = new Set(
      testigos
        .map(t => t.num_documento?.toString().trim())
        .filter(doc => doc && doc !== '')
    );
    return documentosUnicos.size;
  });

  // 3. Conteo de Testigos Únicos y Credenciales agrupados por Partido
  public testigosPorPartido = computed<ResumenPartido[]>(() => {
    const testigos = this.testigosService.allTestigos();
    const partidos = this.partidosService.allPartidos();

    // Estructura para llevar el conteo doble por partido
    const conteoMap = new Map<string, { docs: Set<string>; credenciales: number }>();

    // Inicializamos con los partidos existentes en la BD
    for (const p of partidos) {
      if (p.nombre_partido) {
        conteoMap.set(p.nombre_partido.trim(), { docs: new Set(), credenciales: 0 });
      }
    }

    // Procesamos cada registro
    for (const t of testigos) {
      const nombreOrg = t.organizacion?.trim() || 'Sin Organización';
      const doc = t.num_documento?.toString().trim();

      if (!conteoMap.has(nombreOrg)) {
        conteoMap.set(nombreOrg, { docs: new Set(), credenciales: 0 });
      }

      const info = conteoMap.get(nombreOrg)!;
      info.credenciales += 1; // Cada fila cuenta como una credencial

      if (doc) {
        info.docs.add(doc); // Set evita contar la misma cédula más de una vez
      }
    }

    // Transformamos el mapa al arreglo de salida
    return Array.from(conteoMap.entries())
      .map(([nombre, data]) => ({
        nombre,
        totalTestigosUnicos: data.docs.size,
        totalCredenciales: data.credenciales
      }))
      .sort((a, b) => b.totalTestigosUnicos - a.totalTestigosUnicos);
  });

}
