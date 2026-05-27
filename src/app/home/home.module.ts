import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { ElectronicsComponent } from './electronics/electronics.component';
import { FashionComponent } from './fashion/fashion.component';
import { BeautyComponent } from './beauty/beauty.component';
import { JewelryComponent } from './jewelry/jewelry.component';
import { ShopModule } from './../shop/shop.module';


@NgModule({
  declarations: [
    ElectronicsComponent,
    FashionComponent,
    BeautyComponent,
    JewelryComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
    CommonModule,
    ShopModule,
  ]
})
export class HomeModule { }
