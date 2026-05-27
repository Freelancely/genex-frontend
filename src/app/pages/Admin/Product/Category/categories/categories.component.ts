import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { CategoryService, Category, SubCategory, SubAttribute, Product } from '../Service/categories.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);
  newCategoriesThisMonth = 2;
  newProductsThisMonth = 15;
  isLoading = signal(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  categoryForm: FormGroup;
  subCategoryForm: FormGroup;
  showCategoryModal = false;
  isCategoryEditMode = false;
  isDeleteMode = false;
  currentEditCategory: Category | null = null;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  totalCategories = computed(() => this.categories().length);
  totalSubCategories = computed(() =>
    this.categories().reduce((sum, cat) => sum + cat.subCategoryCount, 0)
  );
  totalProducts = computed(() =>
    this.categories().reduce((sum, cat) => sum + cat.productCount, 0)
  );
  totalPages = computed(() => Math.ceil(this.filteredCategories().length / this.itemsPerPage));

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });

    this.subCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(200)],
      categoryId: ['', Validators.required],
      attributes: [[]]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  async loadCategories() {
    this.isLoading.set(true);
    try {
      const categories = await this.categoryService.getCategories().toPromise();
      this.categories.set(categories ?? []);
      this.applyFilters();
    } catch (error) {
      this.showToast('Failed to load categories: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.categories()];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term))
      );
    }

    filtered = filtered.sort((a, b) => {
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      if (this.sortBy === 'name') return direction * a.name.localeCompare(b.name);
      return 0;
    });

    this.filteredCategories.set(filtered);
  }

  sortTable(column: string) {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  dropCategory(event: CdkDragDrop<Category[]>) {
    const categories = [...this.categories()];
    moveItemInArray(categories, event.previousIndex, event.currentIndex);
    this.categories.set(categories);
    this.applyFilters();
    this.showToast('Category order updated', 'success');
  }

  getPageNumbers(): number[] {
    const totalPages = this.totalPages();
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, this.currentPage - delta); i <= Math.min(totalPages, this.currentPage + delta); i++) range.push(i);
    return range;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  openAddCategoryModal() {
    this.isCategoryEditMode = false;
    this.isDeleteMode = false;
    this.currentEditCategory = null;
    this.categoryForm.reset();
    this.showCategoryModal = true;
  }

  editCategory(category: Category) {
    this.isCategoryEditMode = true;
    this.isDeleteMode = false;
    this.currentEditCategory = category;
    this.categoryForm.patchValue({
      name: category.name
    });
    this.showCategoryModal = true;
  }

  openDeleteCategoryModal(category: Category) {
    if (category.subCategoryCount > 0) {
      this.showToast('Cannot delete category with sub-categories', 'error');
      return;
    }
    this.isCategoryEditMode = false;
    this.isDeleteMode = true;
    this.currentEditCategory = category;
    this.showCategoryModal = true;
  }

  async deleteCategory(category: Category) {
    this.openDeleteCategoryModal(category);
    this.showToast('Brand Deleted Successfully', 'success');
  }

  async confirmDelete() {
    if (this.currentEditCategory) {
      this.isLoading.set(true);
      try {
        await this.categoryService.deleteCategory(this.currentEditCategory.id).toPromise();
        await this.loadCategories();
        this.showToast('Brand deleted successfully', 'success');
        this.closeCategoryModal();
      } catch {
        this.showToast('Failed to delete category', 'error');
        this.closeCategoryModal();
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async onCategorySubmit() {
    if (this.categoryForm.valid) {
      this.isLoading.set(true);
      try {
        const formValue = this.categoryForm.value;
        if (this.isCategoryEditMode && this.currentEditCategory) {
          const updatedCategory = await this.categoryService.updateCategory({
            ...this.currentEditCategory,
            name: formValue.name
          }).toPromise();
          if (updatedCategory) {
            await this.loadCategories();
            this.showToast('Category updated successfully', 'success');
          } else {
            throw new Error('Updated category is undefined');
          }
        } else {
          const newCategory = await this.categoryService.addCategory({
            categoryname: formValue.name
          }).toPromise();
          if (newCategory) {
            await this.loadCategories();
            this.showToast('Category created successfully', 'success');
          } else {
            throw new Error('New category is undefined');
          }
        }
        this.closeCategoryModal();
      } catch (error) {
        this.showToast('Operation failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        this.closeCategoryModal();
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.isDeleteMode = false;
    this.categoryForm.reset();
    this.currentEditCategory = null;
  }

  openAddSubCategory(category: Category) {
    this.router.navigate(['pages/admin/add-sub-category'], { state: { categoryId: category.id } });
  }

  editSubCategory(subCategory: SubCategory) {
    this.router.navigate(['pages/admin/add-sub-category'], { state: { subCategory, categoryId: subCategory.categoryId } });
  }

  async deleteSubCategory(subCategory: SubCategory) {
    if (subCategory.products.length > 0) {
      this.showToast('Cannot delete sub-category with products', 'error');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${subCategory.name}"?`)) return;

    this.isLoading.set(true);
    try {
      await this.categoryService.deleteSubCategory(subCategory.id).toPromise();
      await this.loadCategories();
      this.showToast('Sub-category deleted successfully', 'success');
    } catch (err) {
      this.showToast('Failed to delete sub-category: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  isDeleteButtonDisabled(category: Category): { disabled: boolean, tooltip: string } {
  if (category.subCategoryCount > 0) {
    return { disabled: true, tooltip: 'Cannot delete: Category has sub-categories' };
  }
  if (category.productCount > 0) {
    return { disabled: true, tooltip: 'Cannot delete: Category has products' };
  }
  return { disabled: false, tooltip: 'Delete category' };
}

  openProducts(subCategory: SubCategory) {
    this.router.navigate(['/products', subCategory.id]);
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }

  Math = Math;
}
