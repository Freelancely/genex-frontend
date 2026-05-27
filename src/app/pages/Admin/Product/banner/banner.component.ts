import { Component, ViewChild, ElementRef, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface BannerFormValue {
  hyperlink: string;
  image: File | string;
  bannerCategory: string;
}

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  bannerForm: FormGroup;
  errorMessage = signal<string | null>(null);
  bannerCategories = ['Polytron', 'Genex', 'Chunlan'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.bannerForm = this.fb.group({
      hyperlink: [''],
      image: ['', Validators.required],
      bannerCategory: ['Polytron', Validators.required]
    });
  }

  resetForm() {
    this.bannerForm.reset({
      hyperlink: '',
      bannerCategory: 'Polytron'
    });
    this.imageInput.nativeElement.value = '';
    this.errorMessage.set(null);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Please select a valid image file (e.g., PNG, JPEG)');
        this.imageInput.nativeElement.value = '';
        return;
      }
      this.bannerForm.get('image')?.setValue(file);
      this.bannerForm.get('image')?.markAsTouched();
      this.errorMessage.set(null);
    } else {
      this.bannerForm.get('image')?.setValue(null);
      this.errorMessage.set('No file selected');
    }
  }

  onSubmit() {
    if (this.bannerForm.valid) {
      const formValue: BannerFormValue = this.bannerForm.value;
      const formData = new FormData();
      formData.append('Hyperlink', formValue.hyperlink || '');
      formData.append('ImageFile', formValue.image);
      formData.append('BannerCategory', formValue.bannerCategory);

      this.http.post(`${environment.apiUrl}banner`, formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.errorMessage.set(response.message);
            this.resetForm();
          }
        },
        error: (error) => {
          this.errorMessage.set('Failed to add banner: ' + error.message);
          console.error('Error adding banner:', error);
        }
      });
    } else {
      this.bannerForm.markAllAsTouched();
      this.errorMessage.set('Please fill in all required fields');
      this.cdr.detectChanges();
    }
  }
}
