// Updated ProductService
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number; // Maps to productQuantity
  images: string[]; // Changed to array
  subCategoryId: string;
  subCategoryName?: string;
  categoryId?: string; // Add this
  categoryName?: string; // Add this
  attributes: ProductAttribute[];
  discount: string | null; // Retain for discountId
  discountedPrice?: number | null;
  discountPercentage?: number | null;
  sales: number;
  status: 'active' | 'inactive' | 'out-of-stock' | undefined;
  featured?: boolean;
  createdAt?: Date;
}

export interface ProductAttribute {
  subCategoryAttributeId: string;
  productAttributeId: string; // Added to match API response
  productAttributeName: string;
  productAttributeValue: string;
}

export interface ProductResponse {
  success: boolean;
  data: {
    productId: string;
    productName: string;
    productBrand: string;
    productDescription: string;
    productUnitPrice: number;
    productQuantity: number;
    productImageUrl?: string[]; // Changed to array
    subCategoryId: string;
    subCategoryName?: string;
    categoryId: string; // Add this
    categoryName: string; // Add this
    attributes: ProductAttribute[];
    discountId: string | null;
    discountedPrice?: number | null;
    discountPercentage?: number | null;
    sales?: number;
    productStatus?: 'In-Stock' | 'Out-of-Stock';
    hotdeals?: boolean; // Added to match API response
  }[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  };
}

export interface SingleProductResponse {
  success: boolean;
  message?: string; // Add message as optional
  data?: {
    productId: string;
    productName: string;
    productBrand: string;
    productDescription: string;
    productUnitPrice: number;
    productQuantity: number; // Add this
    productImageUrl?: string[];
    subCategoryId: string;
    subCategoryName?: string;
    categoryId: string; // Add this
    categoryName: string; // Add this
    attributes: ProductAttribute[];
    discountId: string | null;
    discountedPrice?: number | null;
    discountPercentage?: number | null;
    productStatus?: 'In-Stock' | 'Out-of-Stock';
    hotdeals?: boolean;
  };
}

export interface UpdateProductResponse {
  success: boolean;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllProducts(filters: {
    pageNumber: number;
    pageSize: number;
    categoryName?: string;
    subCategoryName?: string;
    productName?: string;
    productBrand?: string;
    minPrice?: number;
    maxPrice?: number;
    hasDiscount?: boolean | null;
    inStockOnly?: boolean | null;
    attributeFilters?: { [key: string]: string };
  }): Observable<ProductResponse> {
    const body = {
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
      categoryName: filters.categoryName || '',
      subCategoryName: filters.subCategoryName || '',
      productName: filters.productName || '',
      productBrand: filters.productBrand || '',
      minPrice: filters.minPrice || 0,
      hasDiscount: filters.hasDiscount,
      inStockOnly: filters.inStockOnly,
      attributeFilters: filters.attributeFilters || {}
    };

    return this.http.post<ProductResponse>(`${this.apiUrl}product/view-products`, body).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          return response;
        }
        throw new Error('Invalid response format or no products found');
      }),
      catchError(this.handleError)
    );
  }

  addProduct(product: any, files?: File[]): Observable<{ success: boolean; message: string; data?: Product }> {
    const formData = new FormData();
    formData.append('ProductName', product.ProductName);
    formData.append('ProductDescription', product.ProductDescription);
    formData.append('ProductBrand', product.ProductBrand);
    formData.append('ProductQuantity', product.ProductQuantity.toString());
    formData.append('ProductUnitPrice', product.ProductUnitPrice.toString());
    formData.append('SubCategoryId', product.SubCategoryId);
    formData.append('CategoryId', product.CategoryId || ''); // Add this
    formData.append('Attributes', JSON.stringify(product.Attributes));
    formData.append('HotDeals', product.Featured.toString());

    if (product.DiscountId) {
      formData.append('DiscountId', product.DiscountId);
    }

    if (files) {
      files.forEach(file => formData.append('ProductImage', file));
    }

    return this.http.post<SingleProductResponse>(`${this.apiUrl}product/add-product`, formData).pipe(
      map(response => {
        if (response.success) {
          if (response.data) {
            const item = response.data;
            const status: 'active' | 'out-of-stock' = item.productStatus === 'In-Stock' ? 'active' : 'out-of-stock';
            return {
              success: true,
              message: response.message || 'Product added successfully',
              data: {
                id: item.productId,
                name: item.productName,
                brand: item.productBrand,
                description: item.productDescription,
                price: item.productUnitPrice,
                stock: item.productQuantity,
                images: item.productImageUrl || [],
                subCategoryId: item.subCategoryId,
                subCategoryName: item.subCategoryName || '',
                categoryId: item.categoryId, // Add this
                categoryName: item.categoryName, // Add this
                attributes: item.attributes || [],
                discount: item.discountId || null,
                discountedPrice: item.discountedPrice || null,
                discountPercentage: item.discountPercentage || null,
                sales: 0,
                status,
                featured: item.hotdeals || false
              }
            };
          }
          return {
            success: true,
            message: response.message || 'Product added successfully'
          };
        }
        throw new Error(response.message || 'Failed to add product');
      }),
      catchError(this.handleError)
    );
  }

  updateProduct(id: string, product: any, files?: File[]): Observable<UpdateProductResponse> {
    const formData = new FormData();
    formData.append('ProductName', product.ProductName);
    formData.append('ProductDescription', product.ProductDescription);
    formData.append('ProductBrand', product.ProductBrand);
    formData.append('ProductQuantity', product.ProductQuantity.toString());
    formData.append('ProductUnitPrice', product.ProductUnitPrice.toString());
    formData.append('HotDeals', product.Featured.toString());
    formData.append('SubCategoryId', product.SubCategoryId);
    formData.append('CategoryId', product.CategoryId || ''); // Add this
    formData.append('Attributes', JSON.stringify(product.Attributes));
    if (product.DiscountId) {
      formData.append('DiscountId', product.DiscountId);
    }
    if (product.ImageUrls) {
      formData.append('ImageUrls', JSON.stringify(product.ImageUrls));
    }

    if (files) {
      files.forEach(file => formData.append('ProductImage', file));
    }

    return this.http.put<UpdateProductResponse>(`${this.apiUrl}product/update-product/${id}`, formData).pipe(
      map(response => {
        if (response.success) {
          return response;
        }
        throw new Error('Failed to update product: ' + response.message);
      }),
      catchError(this.handleError)
    );
  }

  getProductById(id: string): Observable<Product> {
  return this.http.get<SingleProductResponse>(`${this.apiUrl}product/get-productById/${id}`).pipe(
    map(response => {
      if (response.success && response.data) {
        const item = response.data;
        const status: 'active' | 'out-of-stock' = item.productStatus === 'In-Stock' ? 'active' : 'out-of-stock';
        return {
          id: item.productId,
          name: item.productName,
          brand: item.productBrand,
          description: item.productDescription,
          price: item.productUnitPrice,
          stock: item.productQuantity,
          images: item.productImageUrl || [],
          subCategoryId: item.subCategoryId,
          subCategoryName: item.subCategoryName,
          categoryId: item.categoryId,
          categoryName: item.categoryName, // Ensured mapping
          attributes: item.attributes || [],
          discount: item.discountId || null,
          discountedPrice: item.discountedPrice || null,
          discountPercentage: item.discountPercentage || null,
          sales: 0,
          status,
          featured: item.hotdeals || false
        };
      }
      throw new Error('Failed to fetch product');
    }),
    catchError(this.handleError)
  );
}

  deleteProduct(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.apiUrl}product/delete-product/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error?.message || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
