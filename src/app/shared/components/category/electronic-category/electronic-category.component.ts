import category_data from '@/data/category-data';
import { Component } from '@angular/core';

@Component({
    selector: 'app-electronic-category',
    templateUrl: './electronic-category.component.html',
    styleUrls: ['./electronic-category.component.scss'],
    standalone: false
})
export class ElectronicCategoryComponent {

  public category_items = category_data.filter(
    (c) => c.productType === "genex"
  );
}
