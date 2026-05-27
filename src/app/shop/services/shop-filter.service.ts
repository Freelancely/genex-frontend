// src/app/shop/services/shop-filter.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IProduct } from '../../shared/types/product-type';
import { environment } from 'src/environments/environment';

interface CategoryResponse {
  success: boolean;
  data: {
    categoryId: string;
    categoryName: string;
    subCategoryCount: number;
    productCount: number;
  }[];
}

interface TopRatedResponse {
  success: boolean;
  data: {
    productId: string;
    productName: string;
    productDescription: string;
    productImageUrl: string[];
    productUnitPrice: number;
    discountId: string | null;
    discountedPrice: number | null;
    discountPercentage: number | null;
    productQuantity: number;
    categoryId: string;
    categoryName: string;
    subCategoryId: string;
    subCategoryName: string;
    sales: number;
    productStatus: string;
    avgRating: number;
    reviewCount: number;
    hotdeals: boolean;
    attributes: { [key: string]: string } | null;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ShopFilterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<{ categoryId: string; categoryName: string; productCount: number }[]> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}category/get-all-categories`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return [];
        }
        return response.data.map(category => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          productCount: category.productCount
        }));
      }),
      catchError(err => {
        console.error('Error fetching categories:', err);
        return throwError(() => new Error('Failed to fetch categories'));
      })
    );
  }

  getTopRatedProducts(count: number): Observable<IProduct[]> {
    return this.http.get<TopRatedResponse>(`${this.apiUrl}product/topRated/${count}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return [];
        }
        return this.mapToIProduct(response.data);
      }),
      catchError(err => {
        console.error(`Error fetching top-rated products for count ${count}:`, err);
        return throwError(() => new Error('Failed to fetch top-rated products'));
      })
    );
  }

  private mapToIProduct(apiProducts: any[]): IProduct[] {
    return apiProducts.map(product => ({
      id: product.productId,
      sku: product.productId.substring(0, 8),
      img: product.productImageUrl?.[0] || '',
      title: product.productName,
      slug: product.productName.toLowerCase().split(' ').join('-'),
      unit: 'piece',
      imageURLs: product.productImageUrl
        ? product.productImageUrl.map((img: string) => ({ img }))
        : [],
      parent: product.categoryName || '',
      children: product.subCategoryName || '',
      price: product.productUnitPrice,
      discount: product.discountPercentage || (product.discountedPrice ? ((1 - product.discountedPrice / product.productUnitPrice) * 100) : 0),
      quantity: product.productQuantity,
      brand: { name: 'Unknown' }, // API doesn't provide brand
      category: { name: product.categoryName },
      status: product.productStatus.toLowerCase(),
      reviews: [],
      productType: 'simple',
      description: product.productDescription || '',
      orderQuantity: 0,
      additionalInformation: product.attributes
        ? Object.entries(product.attributes).map(([key, value]) => ({
            key,
            value: String(value)
          }))
        : [],
      featured: product.hotdeals || false,
      sellCount: product.sales || 0,
      offerDate: undefined,
      tags: [],
      videoId: undefined,
      sizes: [],
      subCategoryId: product.subCategoryId
    }));
  }
}
