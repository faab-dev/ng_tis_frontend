import {Lang} from "../enum";

export interface I18n {
  id: string;
  key?: string;
  language: Lang;
  value: string;
  whenCreated: number;
  whenUpdated?: number;
  whenDeleted?: number;
}
