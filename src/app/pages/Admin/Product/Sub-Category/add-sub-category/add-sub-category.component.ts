import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SubCategoryService, SubCategory, SubAttribute } from '../Service/sub-category.service';
import { CategoryService, Category } from '../../Category/Service/categories.service';

interface LocalSubAttribute extends SubAttribute {
  possibleValuesString?: string;
}

@Component({
  selector: 'app-add-sub-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-sub-category.component.html',
  styleUrls: ['./add-sub-category.component.scss']
})
export class AddSubCategoryComponent implements OnInit {
  subCategoryForm: FormGroup;
  isEditMode = false;
  categories = signal<Category[]>([]);
  attributes = signal<LocalSubAttribute[]>([]);
  errorMessage = signal<string | null>(null);

  isSubmitDisabled = computed(() => {
    const formInvalid = this.subCategoryForm.invalid;
    const attributesInvalid = this.attributes().some(attr => {
      const isNameValid = !attr.attributeName || attr.attributeName.trim() === '';
      const possibleValues = attr.possibleValuesJson || [];
      const isValuesRequired = attr.type !== 'string' && possibleValues.length === 0;
      return isNameValid || isValuesRequired;
    });
    return formInvalid || attributesInvalid;
  });

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private subCategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {
    this.subCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    const state: { subCategory?: SubCategory; categoryId?: string } = history.state;

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage.set('Failed to load categories: ' + error.message);
        console.error('Error fetching categories:', error.message);
      }
    });

    if (state.subCategory) {
      this.isEditMode = true;
      this.subCategoryForm.patchValue({
        name: state.subCategory.name,
        categoryId: state.subCategory.categoryId
      });
      const attributes = (state.subCategory.attributes || []).map((attr: SubAttribute) => ({
        ...attr,
        possibleValuesString: (attr.possibleValuesJson || []).join(', ')
      }));
      this.attributes.set(attributes);
      this.cdr.markForCheck();
    } else if (state.categoryId) {
      this.subCategoryForm.patchValue({ categoryId: state.categoryId });
      this.cdr.markForCheck();
    } else {
      const subCategoryId = this.router.parseUrl(this.router.url).queryParams['id'];
      if (subCategoryId) {
        this.subCategoryService.getAllSubCategories().subscribe({
          next: (subCategories) => {
            const subCategory = subCategories.find(sc => sc.id === subCategoryId);
            if (subCategory) {
              this.isEditMode = true;
              this.subCategoryForm.patchValue({
                name: subCategory.name,
                categoryId: subCategory.categoryId
              });
              const attributes = (subCategory.attributes || []).map((attr: SubAttribute) => ({
                ...attr,
                possibleValuesString: (attr.possibleValuesJson || []).join(', ')
              }));
              this.attributes.set(attributes);
              this.cdr.markForCheck();
            } else {
              this.errorMessage.set('Sub-category not found');
            }
          },
          error: (error) => {
            this.errorMessage.set('Failed to load sub-category: ' + error.message);
            console.error('Error fetching sub-category:', error.message);
          }
        });
      }
    }
  }

  addAttribute() {
    this.attributes.update(attrs => [
      ...attrs,
      { attributeName: '', possibleValuesJson: [], possibleValuesString: '', type: 'dropdown', isRequired: false }
    ]);
    this.cdr.markForCheck();
  }

  removeAttribute(index: number) {
    this.attributes.update(attrs => attrs.filter((_, i) => i !== index));
    this.cdr.markForCheck();
  }

  updateValues(index: number, value: string) {
    const values = value
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
    this.attributes.update(attrs => {
      const newAttrs = [...attrs];
      newAttrs[index] = { ...newAttrs[index], possibleValuesJson: values, possibleValuesString: value };
      return newAttrs;
    });
    this.cdr.markForCheck();
  }

  onTypeChange(index: number) {
    this.attributes.update(attrs => {
      const newAttrs = [...attrs];
      if (newAttrs[index].type === 'string') {
        newAttrs[index] = {
          ...newAttrs[index],
          possibleValuesJson: null, // Set to null for string type
          possibleValuesString: '',
          attributeName: newAttrs[index].attributeName?.trim() || ''
        };
      } else {
        newAttrs[index] = {
          ...newAttrs[index],
          possibleValuesJson: newAttrs[index].possibleValuesJson || [],
          possibleValuesString: (newAttrs[index].possibleValuesJson || []).join(', ')
        };
      }
      return newAttrs;
    });
    this.cdr.markForCheck();
  }

  onAttributeBlur(index: number, field: string) {
    this.attributes.update(attrs => {
      const attr = attrs[index];
      if (field === 'attributeName') {
        attr.attributeName = attr.attributeName?.trim() || '';
      } else if (field === 'possibleValuesString') {
        attr.possibleValuesString = attr.possibleValuesString?.trim() || '';
        attr.possibleValuesJson = attr.possibleValuesString
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0) || null;
      }
      return [...attrs];
    });
    this.cdr.markForCheck();
  }

  onSubmit() {
    if (!this.isSubmitDisabled()) {
      const formValue = this.subCategoryForm.value;
      const payload = {
        subCategoryName: formValue.name,
        categoryId: formValue.categoryId,
        addSubAttrDTO: this.attributes().map(attr => ({
          attributeName: attr.attributeName,
          possibleValuesJson: attr.type === 'string' ? null : (attr.possibleValuesJson || []),
          type: attr.type,
          isRequired: attr.isRequired,
          attributeId: attr.attributeId
        }))
      };
      this.subCategoryService.addSubCategory(payload).subscribe({
        next: (response) => {
          alert('Sub-category saved successfully!');
          this.location.back();
        },
        error: (error) => {
          console.error('Error saving sub-category:', error.message);
          alert('Failed to save sub-category: ' + error.message);
        }
      });
    } else {
      alert('Please fill all required fields and ensure attributes are valid.');
    }
  }

  trackByIndex(index: number, attr: LocalSubAttribute): number {
    return index;
  }

  cancel() {
    this.location.back();
  }
}
