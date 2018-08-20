import {AuthPhone} from './auth-phone';
import {Operator} from './operator';
import {Role} from './role';

export class User {
  id: string;
  admin: boolean;
  name: string;
  login: string;
  authPhones: AuthPhone[]
  availableOperators: Operator[];
  operators: Operator[];
  properties: any[];
  roles: Role[];
  whenCreated: number;
  whenUpdated?: number;
  whenDeleted?: number;
  constructor(){}
}
