import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  attributes: SubAttribute[];
  products: Product[];
}

export interface SubAttribute {
  attributeId?: string;
  attributeName: string;
  possibleValuesJson: string[] | null;
  type: string;
  isRequired: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface SubCategoryResponse {
  success: boolean;
  message: {
    subCategoryId: string;
    subCategoryName: string;
    categoryId: string;
    subCatAttrs: SubAttribute[];
  }[];
}

export interface SingleSubCategoryResponse {
  success: boolean;
  data: {
    subCategoryId: string;
    subCategoryName: string;
    categoryId: string;
    subCatAttrs: SubAttribute[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  addSubCategory(subCategory: { subCategoryName: string; categoryId: string; addSubAttrDTO: SubAttribute[] }): Observable<SubCategory> {
    return this.http.post<SubCategory>(`${this.apiUrl}subCategory/add-subCategory`, subCategory).pipe(
      catchError(this.handleError)
    );
  }

  getAllSubCategories(): Observable<SubCategory[]> {
    return this.http.get<SubCategoryResponse>(`${this.apiUrl}subCategory/get-all-subAttributes`).pipe(
      map(response => {
        if (response.success) {
          return response.message.map(item => ({
            id: item.subCategoryId,
            name: item.subCategoryName,
            categoryId: item.categoryId,
            attributes: item.subCatAttrs.map(attr => ({
              attributeId: attr.attributeId,
              attributeName: attr.attributeName,
              possibleValuesJson: attr.type === 'string' ? null : attr.possibleValuesJson,
              type: attr.type,
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

  getSubCategoriesByCategoryId(categoryId: string): Observable<SubCategory[]> {
    if (!categoryId) {
      console.warn('No categoryId provided, fetching all subcategories');
      return this.getAllSubCategories();
    }
    return this.http.get<SubCategoryResponse>(`${this.apiUrl}subCategory/get-by-category/${categoryId}`).pipe(
      map(response => {
        if (response.success) {
          return response.message.map(item => ({
            id: item.subCategoryId,
            name: item.subCategoryName,
            categoryId: item.categoryId,
            attributes: item.subCatAttrs.map(attr => ({
              attributeId: attr.attributeId,
              attributeName: attr.attributeName,
              possibleValuesJson: attr.type === 'string' ? null : attr.possibleValuesJson,
              type: attr.type,
              isRequired: attr.isRequired
            })),
            products: []
          }));
        }
        throw new Error('Failed to fetch sub-categories for category');
      }),
      catchError(this.handleError)
    );
  }

  getSubCategoryById(subCategoryId: string): Observable<SubCategory> {
    return this.http.get<SingleSubCategoryResponse>(`${this.apiUrl}subCategory/get-SubCategory/${subCategoryId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            id: response.data.subCategoryId,
            name: response.data.subCategoryName,
            categoryId: response.data.categoryId,
            attributes: response.data.subCatAttrs.map(attr => ({
              attributeId: attr.attributeId,
              attributeName: attr.attributeName,
              possibleValuesJson: attr.type === 'string' ? null : attr.possibleValuesJson,
              type: attr.type,
              isRequired: attr.isRequired
            })),
            products: []
          };
        }
        throw new Error('Failed to fetch subcategory');
      }),
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
