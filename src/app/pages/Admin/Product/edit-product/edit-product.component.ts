import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product, ProductAttribute } from '../Product-Service/product.service';
import { SubCategoryService, SubCategory, SubAttribute } from '../Sub-Category/Service/sub-category.service';
import { CategoryService, Category } from '../Category/Service/categories.service';
import { DiscountsService, Discount } from '../../Services/discounts.service';
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
  attributes: {
    attributeId: string;
    attributeName: string;
    type: string;
    value: string | string[];
    possibleValues: string[];
    isRequired: boolean;
  }[];
  featured: boolean;
}

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
})
export class EditProductComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  productForm: FormGroup;
  categories = signal<Category[]>([]);
  subCategories = signal<SubCategory[]>([]);
  selectedCategory = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  productId: string | null = null;
  discounts = signal<Discount[]>([]);
  currentImageUrls = signal<string[]>([]);
  selectedFiles: File[] = [];
  imagePreviews = signal<string[]>([]);
  isDragging = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private subCategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private discountsService: DiscountsService,
    private toastr: ToastrService
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
    this.productId = this.route.snapshot.paramMap.get('id');
    this.loadCategories();
    this.loadDiscounts();
    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  get attributes(): FormArray<FormGroup> {
    return this.productForm.get('attributes') as FormArray<FormGroup>;
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load categories: ' + error.message);
        console.error('Error loading categories:', error);
        this.toastr.error('Failed to load categories');
      }
    });
  }

  loadProduct(id: string) {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          categoryId: '',
          subCategoryId: product.subCategoryId,
          price: product.price,
          stock: product.stock,
          description: product.description,
          brand: product.brand || '',
          discount: product.discount || '',
          featured: product.featured || false
        });
        this.currentImageUrls.set(product.images || []);

        this.subCategoryService.getSubCategoryById(product.subCategoryId).subscribe({
          next: (subCategory) => {
            if (subCategory) {
              this.selectedCategory.set(subCategory.categoryId);
              this.productForm.patchValue({ categoryId: subCategory.categoryId });
              this.subCategories.set([subCategory]);

              this.attributes.clear();
              if (subCategory.attributes) {
                subCategory.attributes.forEach((attr: SubAttribute) => {
                  const productAttr = product.attributes.find(
                    (pa: ProductAttribute) => pa.subCategoryAttributeId === attr.attributeId
                  );
                  const validators = attr.isRequired ? [Validators.required] : [];
                  const value = productAttr
                    ? attr.type === 'checkboxes'
                      ? productAttr.productAttributeValue.split(',')
                      : productAttr.productAttributeValue
                    : attr.type === 'checkboxes'
                    ? []
                    : '';
                  const possibleValues = attr.possibleValuesJson || [];

                  this.attributes.push(
                    this.fb.group({
                      attributeId: [attr.attributeId || '', Validators.required],
                      attributeName: [attr.attributeName, Validators.required],
                      type: [attr.type, Validators.required],
                      value: [value, validators],
                      possibleValues: [possibleValues, Validators.required],
                      isRequired: [attr.isRequired, Validators.required]
                    })
                  );
                });
              } else {
                console.warn('No attributes found for subCategoryId:', product.subCategoryId);
                this.errorMessage.set('No attributes found for the product’s subcategory.');
              }

              this.productForm.get('categoryId')?.disable();
              this.productForm.get('subCategoryId')?.disable();
              this.cdr.detectChanges();
            } else {
              console.warn('No subcategory found for subCategoryId:', product.subCategoryId);
              this.errorMessage.set('No subcategory found for the product.');
              this.subCategories.set([]);
              this.attributes.clear();
            }
          },
          error: (error) => {
            this.errorMessage.set('Failed to load subcategory: ' + error.message);
            console.error('Error loading subcategory:', error);
            this.toastr.error('Failed to load subcategory');
          }
        });

        if (product.discount) {
          this.productForm.get('discount')?.setValue(product.discount);
        }
      },
      error: (error) => {
        this.errorMessage.set('Failed to load product: ' + error.message);
        console.error('Error loading product:', error);
        this.toastr.error('Failed to load product');
      }
    });
  }

  loadSubCategories(categoryId: string) {
    if (!categoryId) {
      console.warn('No categoryId provided for loading subcategories');
      this.subCategories.set([]);
      this.attributes.clear();
      this.errorMessage.set('Cannot load subcategories: No category selected.');
      return;
    }
    this.subCategoryService.getSubCategoriesByCategoryId(categoryId).subscribe({
      next: (subCategories: SubCategory[]) => {
        this.subCategories.set(subCategories);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load subcategories: ' + error.message);
        console.error('Error loading subcategories:', error);
        this.toastr.error('Failed to load subcategories');
      }
    });
  }

  loadDiscounts() {
    this.discountsService.getAllDiscounts(1, 10).subscribe({
      next: (response) => {
        if (response.success && response.data.items) {
          this.discounts.set(response.data.items);
          const productDiscountId = this.productForm.get('discount')?.value;
          if (productDiscountId) {
            const matchedDiscount = response.data.items.find(d => d.discountId === productDiscountId);
            if (matchedDiscount) {
              this.productForm.get('discount')?.setValue(matchedDiscount.discountId);
            }
          }
        } else {
          this.errorMessage.set('No discounts found');
          this.toastr.error('No discounts found');
        }
      },
      error: (error) => {
        this.errorMessage.set('Failed to load discounts: ' + error.message);
        console.error('Error loading discounts:', error);
        this.toastr.error('Failed to load discounts');
      }
    });
  }

  onCategoryChange(event: Event) {
    // Disabled dropdown, so this won't be called
  }

  onSubCategoryChange(event: Event) {
    // Disabled dropdown, so this won't be called
  }

  updateAttributeControls() {
    const subCategoryId = this.productForm.get('subCategoryId')?.value;
    const subCategory = this.subCategories().find((sc: SubCategory) => sc.id === subCategoryId);
    this.attributes.clear();

    if (subCategory && subCategory.attributes) {
      subCategory.attributes.forEach((attr: SubAttribute) => {
        const validators = attr.isRequired ? [Validators.required] : [];
        const formGroup = this.fb.group({
          attributeId: [attr.attributeId || '', Validators.required],
          attributeName: [attr.attributeName, Validators.required],
          type: [attr.type, Validators.required],
          value: [attr.type === 'checkboxes' ? [] : '', validators],
          possibleValues: [attr.possibleValuesJson || [], Validators.required],
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
      this.cdr.detectChanges();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const newFiles = Array.from(files).filter(file => validImageTypes.includes(file.type));
      if (newFiles.length !== files.length) {
        this.toastr.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      }
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      this.updateImagePreviews();
      this.cdr.detectChanges();
    }
  }

  updateImagePreviews(): void {
    const readFiles = this.selectedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readFiles).then(previews => {
      this.imagePreviews.set(previews);
      this.cdr.detectChanges();
    });
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.set([...this.imagePreviews().slice(0, index), ...this.imagePreviews().slice(index + 1)]);
    this.cdr.detectChanges();
  }

  removeCurrentImage(index: number): void {
    this.currentImageUrls.set([...this.currentImageUrls().slice(0, index), ...this.currentImageUrls().slice(index + 1)]);
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.productForm.valid && this.productId) {
      const formValue: ProductFormValue = this.productForm.value;
      const subCategoryId = this.productForm.getRawValue().subCategoryId;
      const productPayload = {
        ProductName: formValue.name,
        ProductDescription: formValue.description,
        ProductBrand: formValue.brand,
        ProductQuantity: formValue.stock,
        ProductUnitPrice: formValue.price,
        SubCategoryId: subCategoryId,
        Attributes: formValue.attributes.map(attr => ({
          SubCategoryAttributeId: attr.attributeId,
          ProductAttributeValue: Array.isArray(attr.value) ? attr.value.join(',') : attr.value,
          SubCategoryAttributeName: attr.attributeName
        })),
        DiscountId: formValue.discount || null,
        Featured: formValue.featured
      };

      this.productService.updateProduct(this.productId, productPayload, this.selectedFiles).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(response.message || 'Product updated successfully');
            this.router.navigate(['/pages/admin/products']);
          } else {
            this.toastr.error(response.message || 'Update failed');
            this.errorMessage.set(response.message || 'Update failed');
          }
        },
        error: (error) => {
          this.toastr.error(error.message || 'Failed to update product');
          this.errorMessage.set(error.message || 'Failed to update product');
          console.error('Error updating product:', error);
        }
      });
    } else {
      this.productForm.markAllAsTouched();
      this.toastr.error('Please fill out all required fields correctly');
      this.cdr.detectChanges();
    }
  }

  cancel() {
    this.router.navigate(['/pages/admin/products']);
  }
}
