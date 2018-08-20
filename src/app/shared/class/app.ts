import {Status} from './../enum/status.enum';
import {Role} from './role';

export class App {
  id: string;
  accessibleProperties: any[];
  appKey: string;
  approved: boolean;
  name: string;
  restrictedUserRoles: Role[];
  roles: Role[];
  status: Status;
  whenCreated: number;
  whenUpdated?: number;
  whenDeleted?: number;
  constructor(){}
}
