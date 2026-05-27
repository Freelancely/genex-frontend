import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService, Category } from '@/shared/services/header.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-category',
  templateUrl: './header-category.component.html',
  styleUrls: ['./header-category.component.scss'],
  standalone: false
})
export class HeaderCategoryComponent {
  public categoryItems: { parent: string; children: string[] }[] = [];
  public isActive: boolean = false;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private headerService: HeaderService
  ) {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.headerService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categoryItems = response.data.map(category => ({
            parent: category.categoryName,
            children: category.productNames
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  public handleActive(): void {
    this.isActive = !this.isActive;
  }

  public handleParentCategory(value: string): void {
    const newCategory = value.toLowerCase().replace("&", "").split(" ").join("-");
    this.router.navigate(['/shop'], { queryParams: { category: newCategory } });
  }

  public handleSubCategory(value: string): void {
    const newCategory = value.toLowerCase().replace("&", "").split(" ").join("-");
    this.router.navigate(['/shop'], { queryParams: { subcategory: newCategory } });
  }
}
