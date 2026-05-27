import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { mobile_menu } from '@/data/menu-data';
import { IMobileType } from '@/types/menu-d-type';
import { UtilsService } from '@/shared/services/utils.service';
import { HeaderService, Category } from '@/shared/services/header.service';

@Component({
  selector: 'app-mobile-sidebar',
  templateUrl: './mobile-sidebar.component.html',
  styleUrls: ['./mobile-sidebar.component.scss'],
  standalone: false
})
export class MobileSidebarComponent {
  @Input() product_type!: string;
  public mobile_menu: IMobileType[] = mobile_menu;
  public categoryItems: { parent: string; children: string[] }[] = [];
  public isCategoryActive: boolean = false;
  public openCategory: string = '';
  public isActiveMenu: string = '';
  public isToggleActive: string = '';

  constructor(
    public utilsService: UtilsService,
    private headerService: HeaderService,
    private router: Router
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

  toggleCategoryActive() {
    this.isCategoryActive = !this.isCategoryActive;
  }

  handleOpenSubMenu(title: string) {
    this.isActiveMenu = (this.isActiveMenu === title) ? '' : title;
  }

  handleOpenSubCategory(title: string) {
    if (title === this.openCategory) {
      this.openCategory = "";
    } else {
      this.openCategory = title;
    }
  }

  handleToggleActive(type: string) {
    if (type === this.isToggleActive) {
      this.isToggleActive = "";
    } else {
      this.isToggleActive = type;
    }
  }

  handleParentCategory(value: string): void {
    const newCategory = value.toLowerCase().replace("&", "").split(" ").join("-");
    this.router.navigate(['/shop'], { queryParams: { category: newCategory } });
    this.utilsService.handleOpenMobileMenu();
  }

  handleSubCategory(value: string): void {
    const newCategory = value.toLowerCase().replace("&", "").split(" ").join("-");
    this.router.navigate(['/shop'], { queryParams: { subcategory: newCategory } });
    this.utilsService.handleOpenMobileMenu();
  }
}
