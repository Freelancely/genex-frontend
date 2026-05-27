import { menu_data } from '@/data/menu-data';
import { IMenuItem } from '@/types/menu-d-type';
import { Component } from '@angular/core';

@Component({
    selector: 'app-menu-bar',
    templateUrl: './menu-bar.component.html',
    styleUrls: ['./menu-bar.component.scss'],
    standalone: false
})
export class MenuBarComponent {
  public menu_data:IMenuItem[] = menu_data
}
