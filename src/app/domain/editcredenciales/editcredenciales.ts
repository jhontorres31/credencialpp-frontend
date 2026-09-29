import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditcredencialService } from '../services/editcredencial-service';
import { Testigos } from '../models/testigos-model';


@Component({
  selector: 'app-editcredenciales',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editcredenciales.html',
  styleUrl: './editcredenciales.css',
})
export class  Editcredenciales implements OnInit  {

  public readonly testigosService = inject(EditcredencialService);

  public registrosEncontrados: Testigos[] = [];

  ngOnInit(): void {
    // 🟢 Carga los testigos desde FastAPI al iniciar la pantalla
    this.testigosService.getTestigos().subscribe({
      next: (datos) => {
        this.testigosService.allTestigos.set(datos);
        console.log('Testigos cargados desde la BD:', datos);
      },
      error: (err) => console.error('Error al cargar testigos:', err)
    });
  }

  // Variable de búsqueda
  public numDocumentoBusqueda: string = '';

  // Guardamos el ID en formato string
  public idEditando: string | null = null;

  // Objeto enlazado a los campos del formulario
  public testigoEditando: Testigos = {} as Testigos;

  // 1. Buscar testigo por número de documento en la Signal local o vía API
 buscarTestigo(): void {
    const docBuscado = this.numDocumentoBusqueda.trim();
    if (!docBuscado) return;

    const lista = this.testigosService.allTestigos();

    // Filtramos para obtener todas las credenciales/mesas de la persona
    this.registrosEncontrados = lista.filter(
      t => String(t.num_documento).trim() === docBuscado
    );

    if (this.registrosEncontrados.length === 0) {
      alert(`No se encontró ningún testigo registrado con el documento: ${docBuscado}`);
    }
  }

  // 2. Guardar los cambios enviados mediante el botón "✏️Editar"
  guardarCambios(testigo: Testigos): void {
  const idStr = String(testigo.id_testigo || '');

  if (!idStr) {
    alert('No se encontró un ID válido para este registro.');
    return;
  }

  // Enviamos la petición PUT utilizando el ID de esta credencial/registro
  this.testigosService.updateTestigo(idStr, testigo).subscribe({
    next: (testigoActualizado) => {
      this.testigosService.updateTestigoInSignal(testigoActualizado);
      alert('Credencial y datos actualizados correctamente.');
    },
    error: (err) => {
      console.error('Error al actualizar:', err);
      alert('Ocurrió un error al actualizar los datos.');
    }
  });
}

eliminarTestigo(id_testigo: string | undefined): void {
  if (!id_testigo) return;

  // Opcional: Confirmación previa antes de eliminar
  const confirmar = confirm('¿Estás seguro de que deseas eliminar este registro de testigo?');
  if (!confirmar) return;

  this.testigosService.deleteTestigo(id_testigo).subscribe({
    next: () => {
      // 1. Removemos el testigo de la Signal global en el servicio
      this.testigosService.allTestigos.update(lista =>
        lista.filter(t => String(t.id_testigo) !== String(id_testigo))
      );

      // 2. Removemos el testigo de la lista de resultados de búsqueda visibles en pantalla
      this.registrosEncontrados = this.registrosEncontrados.filter(
        t => String(t.id_testigo) !== String(id_testigo)
      );

      alert('Testigo eliminado correctamente.');
    },
    error: (err) => {
      console.error('Error al eliminar el testigo:', err);
      alert('Ocurrió un error al intentar eliminar el registro.');
    }
  });
}



  limpiarFormulario(): void {
    this.idEditando = null;
    this.testigoEditando = {} as Testigos;
    this.registrosEncontrados = [];
    this.numDocumentoBusqueda = '';
  }



}
