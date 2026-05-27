import { Component } from '@angular/core';
import { Router } from '@angular/router';

import categoryData from "@/data/category-data";
const categoryItems = categoryData.filter(c => c.productType === "polytron");


@Component({
    selector: 'app-beauty-category',
    templateUrl: './beauty-category.component.html',
    styleUrls: ['./beauty-category.component.scss'],
    standalone: false
})
export class BeautyCategoryComponent {

  categoryItems = categoryItems;

  constructor(private router: Router) {}

  handleParentCategory(value: string): void {
    const newCategory = value.toLowerCase().replace("&", "").split(" ").join("-");
    this.router.navigate(['/shop'], { queryParams: { category: newCategory } });
  }
}
