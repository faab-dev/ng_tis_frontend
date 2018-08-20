import {I18n} from './../interface/i18n';

export class Operator {
  id: string;
  name: I18n[];
  approved: boolean;
  backendURL: string;
  whenCreated: number;
  whenUpdated?: number;
  whenDeleted?: number;
  constructor(){}
}
