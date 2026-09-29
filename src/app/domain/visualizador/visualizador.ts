import { Component, OnInit, inject, signal } from '@angular/core';
import { TestigosService } from '../services/testigos-service';
import { Testigos } from '../models/testigos-model';
import { PartidosService } from '../services/partidos-service';
import { Partidos } from '../models/partidos-model';
import { ConfieleccionService } from '../services/confieleccion-service';
import { Confieleccion } from '../confieleccion/confieleccion';

@Component({
  selector: 'app-visualizador',
  imports: [],
  templateUrl: './visualizador.html',
  styleUrl: './visualizador.css',
})
export class Visualizador {

  public testigosService = inject(TestigosService);
  public partidoService = inject(PartidosService);
  public eleccionService = inject (ConfieleccionService);

  eleccionId = signal<number>(1); // ID a editar
  nombreEleccion = signal<string>('');
  loading = signal<boolean>(false);
  mensaje = signal<string | null>(null);


  imprimirFiltro() {
  window.print();
}

  ngOnInit(): void {
    this.cargarDatos();

    this.cargarEleccion();
    this.cargarPartidos();
  }

  cargarEleccion(): void {
    this.loading.set(true);
    this.eleccionService.getEleccionById(this.eleccionId()).subscribe({
      next: (data) => {
        this.nombreEleccion.set(data.nombre_eleccion);
        this.loading.set(false);
      },
      error: (err) => {
        this.mensaje.set('Error al cargar la elección');
        this.loading.set(false);
      }
    });
  }

   cargarPartidos(){
     this.partidoService.getPartidos().subscribe({
      next: (data) => {
         this.partidoService.allPartidos.set(data);
       },
       error: (err) => console.error('Error cargando partidos', err)
     });


   }

  cargarDatos() {
    this.testigosService.getTestigos().subscribe({
      next: (data) => {
        this.testigosService.allTestigos.set(data);
      },
      error: (err) => console.error('Error cargando testigos', err)
    });
  }


  seleccionarOrganizacion(organizacion: string) {

    if (this.testigosService.organizacionSeleccionada() === organizacion) {
      this.testigosService.organizacionSeleccionada.set('');
    } else {
      this.testigosService.organizacionSeleccionada.set(organizacion);
    }
  }
}
