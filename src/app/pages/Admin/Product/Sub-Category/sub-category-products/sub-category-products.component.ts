import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SubCategoryService, SubAttribute, SubCategory, Product } from '../Service/sub-category.service';

@Component({
  selector: 'app-sub-category-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sub-category-products.component.html',
  styleUrls: ['./sub-category-products.component.scss']
})
export class SubCategoryProductsComponent implements OnInit {
  subCategory = signal<SubCategory | null>(null);
  selectedAttributes = signal<{ [key: string]: string[] }>({});

  constructor(private route: ActivatedRoute, private subCategoryService: SubCategoryService) {}

  ngOnInit() {
    const subCategoryData = history.state.subCategory as SubCategory;
    if (subCategoryData) {
      this.subCategory.set(subCategoryData);
    } else {
      const subCategoryId = this.route.snapshot.paramMap.get('id');
      if (subCategoryId) {
        this.subCategoryService.getAllSubCategories().subscribe({
          next: (subCategories) => {
            const found = subCategories.find(sc => sc.id === subCategoryId);
            this.subCategory.set(found || null);
            if (!found) {
              console.warn('Sub-category not found');
            }
          },
          error: (error) => {
            console.error('Error fetching sub-categories:', error.message);
            this.subCategory.set(null);
          }
        });
      }
    }
  }

  updateAttribute(attrName: string, value: string) {
    this.selectedAttributes.update(attrs => {
      const current = attrs[attrName] || [];
      if (current.includes(value)) {
        return { ...attrs, [attrName]: current.filter(v => v !== value) };
      } else {
        return { ...attrs, [attrName]: [...current, value] };
      }
    });
  }

  getFilteredProducts(): Product[] {
    const subCat = this.subCategory();
    if (!subCat) return [];
    let products = [...subCat.products];
    for (const attr of subCat.attributes) {
      const selected = this.selectedAttributes()[attr.attributeName] || [];
      if (selected.length > 0) {
        const possibleValues = attr.possibleValuesJson || [];
        // Adjust filtering logic based on actual product data structure
        products = products.filter(p =>
          selected.some(val => possibleValues.includes(val) || p.name.includes(val) || p.description.includes(val))
        );
      }
    }
    return products;
  }
}
