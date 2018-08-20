import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from "./users.component";
import { TemplateModule} from "../../template/template.module";
import { UsersRoutingModule} from "./users-routing.module";

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
    TemplateModule
  ],
  declarations: [
    UsersComponent
  ]
})
export class UsersModule { }
