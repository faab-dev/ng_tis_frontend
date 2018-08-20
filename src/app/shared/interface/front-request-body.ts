import {FrontRequestSignin} from "./index";

export interface FrontRequestBody {
  controller: string;
  data: object | FrontRequestSignin;
}
