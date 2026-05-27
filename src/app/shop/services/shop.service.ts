import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IProduct } from '../../shared/types/product-type';
import { environment } from 'src/environments/environment';

interface ApiResponse {
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
  lowestPrice: number;
  highestprice: number;
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;
  };
}

interface SingleProductResponse {
  success: boolean;
  data: {
    productId: string;
    productName: string;
    productDescription: string;
    productImageUrl: string[];
    productUnitPrice: number;
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
  };
}

interface SubCatProductResponse {
  success: boolean;
  data: {
    productId: string;
    productName: string;
    productDescription: string;
    productImageUrl: string[];
    productUnitPrice: number;
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
export class ShopService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(filters: {
    pageNumber?: number;
    pageSize?: number;
    categoryName?: string;
    subCategoryName?: string;
    productName?: string;
    minPrice?: number;
    maxPrice?: number;
    hasDiscount?: boolean;
    inStockOnly?: boolean;
    hotDeals?: boolean;
    attributeFilters?: { [key: string]: string };
    sortBy?: string;
  }): Observable<{ products: IProduct[]; pagination: any; lowestPrice: number; highestprice: number }> {
    const body = {
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
      categoryName: filters.categoryName || '',
      subCategoryName: filters.subCategoryName || '',
      productName: filters.productName || '',
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 1000000,
      hasDiscount: filters.hasDiscount ?? undefined,
      inStockOnly: filters.inStockOnly ?? undefined,
      hotDeals: filters.hotDeals ?? undefined,
      attributeFilters: filters.attributeFilters || {},
      sortBy: filters.sortBy || 'asc'
    };

    return this.http.post<ApiResponse>(`${this.apiUrl}product/view-products`, body).pipe(
      map(response => ({
        products: this.mapToIProduct(response.data, filters.sortBy || 'asc'),
        pagination: response.pagination,
        lowestPrice: response.lowestPrice,
        highestprice: response.highestprice
      })),
      catchError(err => {
        console.error('Error fetching products:', err);
        return throwError(() => new Error('Failed to fetch products'));
      })
    );
  }

  getProductById(id: string): Observable<IProduct> {
    return this.http.get<SingleProductResponse>(`${this.apiUrl}product/get-productById/${id}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(`Product with ID ${id} not found`);
        }
        return this.mapSingleToIProduct(response.data);
      }),
      catchError(err => {
        console.error(`Failed to fetch product with ID ${id}:`, err);
        return throwError(() => new Error('Product not found'));
      })
    );
  }

  getProductsBySubCategoryId(subCatId: string): Observable<IProduct[]> {
    return this.http.get<SubCatProductResponse>(`${this.apiUrl}product/get-productBySubCatId/${subCatId}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return [];
        }
        return this.mapToIProduct(response.data, 'asc');
      }),
      catchError(err => {
        console.error(`Failed to fetch products by subCategoryId ${subCatId}:`, err);
        return throwError(() => new Error('Failed to fetch related products'));
      })
    );
  }

  private mapToIProduct(apiProducts: any[], sortBy: string): IProduct[] {
    const products: IProduct[] = apiProducts.map(product => ({
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
      brand: { name: 'Unknown' },
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
    return this.sortProducts(products, sortBy);
  }

  private mapSingleToIProduct(product: SingleProductResponse['data']): IProduct {
    return {
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
      brand: { name: 'Unknown' },
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
    };
  }

  private sortProducts(products: IProduct[], sortBy: string): IProduct[] {
    return products.sort((a, b) => {
      if (sortBy === 'asc') {
        return a.price - b.price;
      } else if (sortBy === 'desc') {
        return b.price - a.price;
      }
      return 0;
    });
  }

  filterSelect = [
    { value: 'asc', text: 'Price: Low to High' },
    { value: 'desc', text: 'Price: High to Low' },
    { value: '', text: 'Default Sorting' }
  ];
}
