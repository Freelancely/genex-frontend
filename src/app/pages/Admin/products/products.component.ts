import { Component, OnInit, signal, computed, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product, ProductAttribute } from '../../Admin/Product/Product-Service/product.service';
import { SubCategoryService, SubCategory, SubAttribute } from '../../Admin/Product/Sub-Category/Service/sub-category.service';
import { CategoryService, Category } from '../../Admin/Product/Category/Service/categories.service';
import { DiscountsService, Discount } from '../Services/discounts.service';
import { ToastrService } from 'ngx-toastr';

interface ProductFormValue {
  name: string;
  categoryId: string;
  subCategoryId: string;
  price: number;
  stock: number;
  description: string;
  brand: string;
  discount: string;
  featured: boolean;
  attributes: {
    attributeId: string;
    attributeName: string;
    type: string;
    value: string | string[];
    possibleValues: string[];
    isRequired: boolean;
  }[];
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  subCategories = signal<SubCategory[]>([]);
  categories = signal<Category[]>([]);
  discounts = signal<Discount[]>([]);
  selectedCategory = signal<string | null>(null);
  productForm: FormGroup;
  showModal = false;
  isEditMode = false;
  currentEditProduct: Product | null = null;
  errorMessage = signal<string | null>(null);
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isDragging = false;

  searchTerm = '';
  selectedSubCategory = '';
  selectedStatus = '';
  sortBy = 'name';
  pageNumber = 1;
  pageSize = 10;
  totalCount = signal<number>(0);

  totalProducts = computed(() => this.totalCount());
  lowStockProducts = computed(() => this.products().filter(p => p.stock < 10).length);
  totalValue = computed(() => this.products().reduce((sum, p) => sum + (p.price * p.stock), 0));
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private subCategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private discountsService: DiscountsService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      subCategoryId: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      brand: [''],
      discount: [''],
      featured: [false],
      attributes: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadDiscounts();
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      this.selectedSubCategory = params['subCategory'] || '';
      this.selectedStatus = params['status'] || '';
      this.sortBy = params['sortBy'] || 'name';
      this.pageNumber = +params['page'] || 1;
      this.loadProducts();
    });
  }

  get attributes(): FormArray<FormGroup> {
    return this.productForm.get('attributes') as FormArray<FormGroup>;
  }

  loadProducts() {
    const filters = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      categoryName: "",
      subCategoryName: "",
      productName: "",
      productBrand: "",
      minPrice: 0,
      maxPrice: 55555550,
      hasDiscount: null,
      inStockOnly: null,
      attributeFilters: {}
    };

    this.productService.getAllProducts(filters).subscribe({
      next: (response) => {
        const mappedProducts: Product[] = response.data.map(item => ({
          id: item.productId,
          name: item.productName,
          brand: item.productBrand,
          description: item.productDescription,
          price: item.productUnitPrice,
          stock: item.productQuantity,
          images: item.productImageUrl || [],
          subCategoryId: item.subCategoryId,
          subCategoryName: item.subCategoryName,
          attributes: item.attributes || [],
          discount: item.discountId || null,
          sales: 0,
          status: item.productQuantity > 0 ? 'active' : 'out-of-stock',
          featured: item.hotdeals || false
        }));
        this.products.set(mappedProducts);
        this.totalCount.set(response.pagination.totalCount);
        this.pageNumber = response.pagination.pageNumber;
        this.pageSize = response.pagination.pageSize;
        this.applyFilters();
        this.cdr.detectChanges(); // Ensure UI updates after loading products
      },
      error: (error) => {
        this.errorMessage.set('Error fetching products: ' + error.message);
        console.error('Error fetching products:', error);
        this.toastr.error('Error fetching products');
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => {
        this.errorMessage.set('Failed to load categories: ' + error.message);
        console.error(error);
        this.toastr.error('Failed to load categories');
      }
    });
  }

  loadDiscounts() {
    this.discountsService.getAllDiscounts(1, 10).subscribe({
      next: (response) => {
        if (response.success && response.data.items) {
          this.discounts.set(response.data.items);
        } else {
          this.errorMessage.set('No discounts found');
        }
      },
      error: (error) => {
        this.errorMessage.set('Failed to load discounts: ' + error.message);
        console.error('Error loading discounts:', error);
        this.toastr.error('Failed to load discounts');
      }
    });
  }

  loadSubCategories(categoryId: string) {
    if (categoryId) {
      this.subCategoryService.getSubCategoriesByCategoryId(categoryId).subscribe({
        next: (subCategories: SubCategory[]) => {
          this.subCategories.set(subCategories);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage.set('Failed to load subcategories: ' + error.message);
          console.error('Error loading subcategories:', error);
          this.toastr.error('Failed to load subcategories');
        }
      });
    } else {
      this.subCategories.set([]);
      this.attributes.clear();
      this.cdr.detectChanges();
    }
  }

  onCategoryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const categoryId = selectElement.value;
    this.selectedCategory.set(categoryId);
    this.productForm.get('categoryId')?.setValue(categoryId);
    this.productForm.get('subCategoryId')?.setValue('');
    this.attributes.clear();
    this.loadSubCategories(categoryId);
  }

  onSubCategoryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const subCategoryId = selectElement.value;
    this.productForm.get('subCategoryId')?.setValue(subCategoryId);
    this.updateAttributeControls();
  }

  updateAttributeControls() {
    const subCategoryId = this.productForm.get('subCategoryId')?.value;
    const subCategory = this.subCategories().find((sc: SubCategory) => sc.id === subCategoryId);
    this.attributes.clear();

    if (subCategory && subCategory.attributes) {
      subCategory.attributes.forEach((attr: SubAttribute) => {
        if (!attr.attributeId) {
          console.warn(`Attribute missing attributeId: ${attr.attributeName}`);
        }
        const validators = attr.isRequired ? [Validators.required] : [];
        const initialValue = attr.type === 'text' ? '' : (attr.type === 'checkboxes' ? [] : '');
        const formGroup = this.fb.group({
          attributeId: [attr.attributeId || '', Validators.required],
          attributeName: [attr.attributeName, Validators.required],
          type: [attr.type, Validators.required],
          value: [initialValue, validators],
          possibleValues: [attr.possibleValuesJson || [], attr.type === 'string' ? [] : [Validators.required]],
          isRequired: [attr.isRequired, Validators.required]
        });
        this.attributes.push(formGroup);
      });
    }
    this.cdr.detectChanges();
  }

  onCheckboxChange(event: Event, attr: FormGroup, value: string) {
    const input = event.target as HTMLInputElement;
    const currentValues = attr.get('value')?.value as string[] || [];
    if (input.checked) {
      attr.get('value')?.setValue([...currentValues, value]);
    } else {
      attr.get('value')?.setValue(currentValues.filter(v => v !== value));
    }
    attr.get('value')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const newFiles = Array.from(files).filter(file => validImageTypes.includes(file.type));
      if (newFiles.length !== files.length) {
        this.toastr.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      }
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      this.updateImagePreviews();
      if (this.selectedFiles.length === 0 && !this.isEditMode) {
        this.productForm.setErrors({ requiredImages: true });
      } else {
        this.productForm.setErrors(null);
      }
      this.cdr.detectChanges();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const newFiles = Array.from(files).filter(file => validImageTypes.includes(file.type));
      if (newFiles.length !== files.length) {
        this.toastr.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      }
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      this.updateImagePreviews();
      if (this.selectedFiles.length === 0 && !this.isEditMode) {
        this.productForm.setErrors({ requiredImages: true });
      } else {
        this.productForm.setErrors(null);
      }
      this.cdr.detectChanges();
    }
  }

  updateImagePreviews(): void {
    this.imagePreviews = [];
    const readFiles = this.selectedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readFiles).then(previews => {
      this.imagePreviews = previews;
      this.cdr.detectChanges();
    });
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    if (this.selectedFiles.length === 0 && !this.isEditMode) {
      this.productForm.setErrors({ requiredImages: true });
    } else {
      this.productForm.setErrors(null);
    }
    this.cdr.detectChanges();
  }

  onSearch() {
    this.pageNumber = 1;
    this.loadProducts();
  }

  onSubCategoryFilter() {
    this.pageNumber = 1;
    this.loadProducts();
  }

  onStatusFilter() {
    this.pageNumber = 1;
    this.loadProducts();
  }

  onSort() {
    this.loadProducts();
  }

  applyFilters() {
    this.filteredProducts.set([...this.products()]);
    this.cdr.detectChanges();
  }

  getPageNumbers(): number[] {
    const totalPages = this.totalPages();
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, this.pageNumber - delta); i <= Math.min(totalPages, this.pageNumber + delta); i++) {
      range.push(i);
    }
    return range;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageNumber = page;
      this.loadProducts();
    }
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadProducts();
    }
  }

  nextPage() {
    if (this.pageNumber < this.totalPages()) {
      this.pageNumber++;
      this.loadProducts();
    }
  }

  openAddProductModal() {
    this.isEditMode = false;
    this.currentEditProduct = null;
    this.productForm.reset({ price: 0, stock: 0, featured: false, brand: '', discount: '' });
    this.attributes.clear();
    this.selectedFiles = [];
    this.imagePreviews = [];
    if (this.categories().length > 0) {
      this.selectedCategory.set(this.categories()[0].id);
      this.loadSubCategories(this.categories()[0].id);
    }
    this.showModal = true;
    this.cdr.detectChanges();
  }

  editProduct(product: Product) {
    this.router.navigate(['/pages/admin/edit-product', product.id]);
  }

  viewProduct(product: Product) {
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Product deleted successfully');
            this.loadProducts();
          }
        },
        error: (error) => {
          this.toastr.error('Failed to delete product');
          this.errorMessage.set('Failed to delete product: ' + error.message);
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  onSubmit() {
  if (!this.isEditMode && this.selectedFiles.length === 0) {
    this.toastr.error('At least one product image is required');
    this.productForm.setErrors({ requiredImages: true });
    return;
  }

  if (this.productForm.valid) {
    const formValue: ProductFormValue = this.productForm.value;
    const productPayload = {
      ProductName: formValue.name,
      ProductDescription: formValue.description,
      ProductBrand: formValue.brand,
      ProductQuantity: formValue.stock,
      ProductUnitPrice: formValue.price,
      SubCategoryId: formValue.subCategoryId,
      Featured: formValue.featured,
      Attributes: formValue.attributes.map(attr => ({
        SubCategoryAttributeId: attr.attributeId,
        ProductAttributeValue: Array.isArray(attr.value) ? attr.value.join(',') : attr.value,
        SubCategoryAttributeName: attr.attributeName
      })),
      DiscountId: formValue.discount || null
    };


    this.productService.addProduct(productPayload, this.selectedFiles).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Product added successfully');
        this.pageNumber = 1; // Reset to first page to show new product
        this.loadProducts(); // Reload products to update table
        this.closeModal(); // Close modal after successful submission
      },
      error: (error) => {
        this.toastr.error(error.message || 'Failed to add product');
        this.errorMessage.set(error.message || 'Failed to add product');
        console.error('Error adding product:', error);
      },
      complete: () => {
        this.cdr.detectChanges(); // Ensure UI updates after submission
      }
    });
  } else {
    this.productForm.markAllAsTouched();
    this.toastr.error('Please fill out all required fields correctly');
    this.cdr.detectChanges();
  }
}

  closeModal() {
    this.showModal = false;
    this.productForm.reset({ price: 0, stock: 0, featured: false, brand: '', discount: '' });
    this.attributes.clear();
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.currentEditProduct = null;
    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  getSubCategoryName(subCategoryId: string): string {
    const subCat = this.subCategories().find((sc: SubCategory) => sc.id === subCategoryId);
    return subCat?.name || 'N/A';
  }

  getStatusText(status: string): string {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  Math = Math;
}
