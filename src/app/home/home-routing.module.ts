import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeautyComponent } from './beauty/beauty.component';
import { FashionComponent } from './fashion/fashion.component';
import { ElectronicsComponent } from './electronics/electronics.component';
import { JewelryComponent } from './jewelry/jewelry.component';

const routes: Routes = [
  {
    path:'electronic',
    component:ElectronicsComponent,
    title:'Genex - Electronic Appliances'
  },
  {
    path:'fashion',
    component:FashionComponent,
    title:'Home Fashion'
  },
  {
    path:'beauty',
    component:BeautyComponent,
    title:'Home Beauty'
  },
  {
    path:'jewelry',
    component:JewelryComponent,
    title:'Home Jewelry'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
