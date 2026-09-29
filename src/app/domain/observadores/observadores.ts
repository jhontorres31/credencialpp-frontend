import { Component, output, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule  } from '@angular/common';
import { ObservadoresService } from '../services/observadores-service';
import { ObservadoresModel } from '../models/observadores-model';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-observadores',
  imports: [FormsModule],
  templateUrl: './observadores.html',
  styleUrl: './observadores.css',
})
export class Observadores {

  private observadoresService = inject(ObservadoresService);



  datosExtraidos = output<ObservadoresModel[]>();


  observadoresGet = toSignal(
    this.observadoresService.getObservadores(),
    {initialValue:[] as ObservadoresModel[]}
  );

  cargando: boolean = false;

  observadores: ObservadoresModel ={

    nombres:'',
    apellidos:'',
    documento:'',
    departamento:'',
    municipio:'',
    resolucion:''

  }

  isDragging = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  fileName = signal('');
  errors = signal<string[]>([]);
  successCount = signal(0);

  imprimirFiltro() {
  window.print();
}

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
  }

  async processFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      this.errors.set(['Solo se aceptan archivos Excel (.xlsx o .xls)']);
      return;
    }

    this.isLoading.set(true);
    this.errors.set([]);
    this.fileName.set(file.name);
    this.successCount.set(0);

    try {
      const { data, errors } = await this.observadoresService.parseFile(file);
      this.errors.set(errors);

      if (data.length > 0) {
        this.successCount.set(data.length);

        // Emitir datos localmente usando la nueva API output()
        this.datosExtraidos.emit(data);

        // Disparar persistencia en BD
        this.guardarEnBaseDeDatos(data);
      } else {
        this.errors.update(prev => [...prev, 'No se encontraron registros válidos para procesar en el Excel.']);
      }
    } catch (err: any) {
      this.errors.set([err.message]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private guardarEnBaseDeDatos(observadores: ObservadoresModel[]) {
    this.isSaving.set(true);

    this.observadoresService.guardarObservadores(observadores).subscribe({
      next: (res) => {
        console.log('¡Guardado masivo exitoso!', res);
        alert(`¡Carga completada! Se guardaron con éxito ${this.successCount()} testigos en la base de datos.`);
      },
      error: (err) => {
        console.error('Error al guardar en el backend:', err);
        this.errors.update(prev => [...prev, 'Error de servidor: No se pudieron almacenar los testigos en la base de datos.']);
        alert('Hubo un error al intentar almacenar los datos del Excel en la base de datos.');
      },
      complete: () => {
        this.isSaving.set(false);
      }
    });
  }



}
