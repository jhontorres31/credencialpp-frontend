export interface EleccionModel {

  id_eleccion: number;
  nombre_eleccion: string;
}

export type EleccionUpdateDTO = Partial<Omit<EleccionModel, 'id_eleccion'>>;
