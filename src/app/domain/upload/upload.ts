import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelService } from '../services/excel-service';
import { Testigos } from '../models/testigos-model';
import { CargaIndividualService } from '../services/carga-individual-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  imports: [FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload {

  private excelService = inject(ExcelService);


  datosExtraidos = output<Testigos[]>();

  private registroIndividual = inject(CargaIndividualService);

  cargando: boolean = false;

  testigos: Testigos = {

    cod_departamento: '',
    cod_municipio:'',
    zona :'',
    cod_puesto : '',
    nom_departamento : '',
    nom_municipio :'',
    nom_puesto : '',
    mesa :'',
    organizacion:'',
    tipo_testigo:'',
    num_documento:'',
    nombre:'',
    segundo_nombre:'',
    apellido:'',
    segundo_apellido:'',
    celular:'',
    correo:'',
    tipo_credencial:'',
    resolucion:'',
    comision:''

};

    cargaIndividual(){
      if (this.cargando) return;
      const body = this.testigos;

  this.cargando = true;

  this.registroIndividual.inscribir(body).subscribe({
    next: (res) => {
      console.log('Registro exitoso', res);
      this.cargando = false;
    },
    error: (err) => {
      console.error('Error al registrar', err);
      this.cargando = false;
    }
  });

    }


  isDragging = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  fileName = signal('');
  errors = signal<string[]>([]);
  successCount = signal(0);

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
      const { data, errors } = await this.excelService.parseFile(file);
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

  private guardarEnBaseDeDatos(testigos: Testigos[]) {
    this.isSaving.set(true);

    this.excelService.guardarTestigos(testigos).subscribe({
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
