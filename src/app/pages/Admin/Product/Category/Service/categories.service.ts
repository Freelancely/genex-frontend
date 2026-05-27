import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Category {
  id: string;
  name: string;
  description: string;
  subCategories?: SubCategory[];
  subCategoryCount: number;
  productCount: number;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  attributes: SubAttribute[];
  products: Product[];
}

export interface SubAttribute {
  attributeId: string;
  attributeName: string;
  possibleValuesJson: string[];
  type: 'dropdown' | 'checkboxes' | 'text';
  isRequired: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})

export class CategoryService {
  private apiUrl = environment.apiUrl;
  private subApiUrl = environment.apiUrl;


  constructor(private http: HttpClient) {}

  addCategory(category: { categoryname: string }): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}category/add-category`, category).pipe(
      map(response => ({
        id: response.id || response.id,
        name: response.name || response.name,
        description: response.description || '',
        subCategoryCount: response.subCategoryCount || 0,
        productCount: response.productCount || 0
      })),
      catchError(this.handleError)
    );
  }

  getCategories(): Observable<Category[]> {
  return this.http.get<{ success: boolean; data: { categoryId: string; categoryName: string; description?: string; subCategoryCount: number; productCount: number }[] }>(`${this.apiUrl}category/get-all-categories`).pipe(
    map(response => {
      return response.data.map(item => ({
        id: item.categoryId,
        name: item.categoryName,
        description: item.description || '',
        subCategoryCount: item.subCategoryCount,
        productCount: item.productCount,
      }));
    }),
    catchError(this.handleError)
  );
}

  getSubCategoriesByCategoryId(categoryId: string): Observable<SubCategory[]> {
    return this.http.get<SubCategoryResponse>(`${this.subApiUrl}subCategory/get-by-category/${categoryId}`).pipe(
      map(response => {
        if (response.success) {
          return response.message.map(item => ({
            id: item.subCategoryId,
            name: item.subCategoryName,
            categoryId: item.categoryId,
            attributes: item.subCatAttrs.map(attr => ({
              attributeId: attr.attributeId,
              attributeName: attr.attributeName,
              possibleValuesJson: attr.possibleValuesJson,
              type: attr.type as 'dropdown' | 'checkboxes' | 'text',
              isRequired: attr.isRequired
            })),
            products: []
          }));
        }
        throw new Error('Failed to fetch sub-categories');
      }),
      catchError(this.handleError)
    );
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}category/update-category/${category.id}`, { categoryname: category.name }).pipe(
      map(response => ({
        id: response.id || response.id,
        name: response.name || response.name,
        description: response.description || '',
        subCategoryCount: response.subCategoryCount || 0,
        productCount: response.productCount || 0
      })),
      catchError(this.handleError)
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}category/delete-category/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteSubCategory(subCategoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}subCategory/delete-subCategory/${subCategoryId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

interface SubCategoryResponse {
  success: boolean;
  message: {
    subCategoryId: string;
    subCategoryName: string;
    categoryId: string;
    subCatAttrs: {
      attributeId: string;
      subCategoryId: string;
      attributeName: string;
      possibleValuesJson: string[];
      type: string;
      isRequired: boolean;
    }[];
  }[];
}
