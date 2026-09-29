import { Routes } from '@angular/router';
import { Home } from './domain/home/home';
import { Upload } from './domain/upload/upload';
import { Visualizador } from './domain/visualizador/visualizador';
import { Editcredenciales } from './domain/editcredenciales/editcredenciales';
import { Confieleccion } from './domain/confieleccion/confieleccion';
import { AnalisisDeDatos } from './domain/analisis-de-datos/analisis-de-datos';
import { Observadores } from './domain/observadores/observadores';


export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'upload',
    component: Upload,
  },
  {
    path: 'visualizador',
    component: Visualizador,
  },
  {
    path: 'editar',
    component: Editcredenciales
  },
  {
    path: 'configurar',
    component: Confieleccion
  },
  {
    path:'datos',
    component: AnalisisDeDatos

  },
  {
    path:'moe',
    component: Observadores

  },
  { path: '**',
    redirectTo: 'home' }
];
