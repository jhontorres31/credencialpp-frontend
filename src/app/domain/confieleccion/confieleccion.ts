import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfieleccionService } from '../services/confieleccion-service';
import { PartidosService } from '../services/partidos-service';
import { Partidos } from '../models/partidos-model';
import { EleccionModel } from '../models/eleccion-model';
import { TestigosService } from '../services/testigos-service';

@Component({
  selector: 'app-confieleccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confieleccion.html',
  styleUrl: './confieleccion.css',
})
export class Confieleccion implements OnInit {

  private readonly eleccionService = inject(ConfieleccionService);
  public readonly partidoService = inject(PartidosService);

  eleccionId = signal<number>(1); // ID a editar
  nombreEleccion = signal<string>('');
  loading = signal<boolean>(false);
  mensaje = signal<string | null>(null);

  nombrePartido = signal<string>('');
  cargando: boolean = false;

  partidos: Partidos = {
    id_partido:0,
    nombre_partido:''

  }



  ngOnInit(): void {
    this.cargarEleccion();
    this.cargarPartidos();

  }

  cargarPartidos(){
    this.partidoService.getPartidos().subscribe({
      next: (data) => {
        this.partidoService.allPartidos.set(data);
      },
      error: (err) => console.error('Error cargando partidos', err)
    });


  }

  guardarPartido(): void {
    if (!this.partidos.nombre_partido.trim()) return;

    this.partidoService.postPartidos(this.partidos).subscribe({
      next: (partidoCreado) => {
        // 1. Actualiza la Signal para que la lista en el HTML se refresque al instante
        this.partidoService.addPartidoToSignal(partidoCreado);

        // 2. Limpia el formulario
        this.partidos.nombre_partido = '';
      },
      error: (err) => console.error('Error al crear partido:', err)
    });
  }

  eliminarPartido(id_partido: number | undefined): void {
  if (!id_partido) return;

  this.partidoService.deletePartido(id_partido).subscribe({
    next: () => {
      // Filtramos la lista en la Signal eliminando el partido con ese id
      this.partidoService.allPartidos.update(lista =>
        lista.filter(p => p.id_partido !== id_partido)
      );
    },
    error: (err) => console.error('Error al eliminar el partido:', err)
  });
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





  guardarCambios(): void {
    if (!this.nombreEleccion().trim()) return;

    this.loading.set(true);
    const payload = { nombre_eleccion: this.nombreEleccion() };

    this.eleccionService.updateEleccion(this.eleccionId(), payload).subscribe({
      next: () => {
        this.mensaje.set('Elección actualizada correctamente.');
        this.loading.set(false);
      },
      error: (err) => {
        this.mensaje.set('Error al actualizar la elección.');
        this.loading.set(false);
      }
    });
  }
}


