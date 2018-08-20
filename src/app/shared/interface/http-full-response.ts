import { User } from "../class";

export interface HttpFullResponse {
  body: User[];
  count: number;
}
