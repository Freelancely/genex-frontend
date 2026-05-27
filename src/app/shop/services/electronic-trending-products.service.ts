import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IProduct } from '@/types/product-type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ElectronicTrendingProductsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private mapToIProduct(product: any): IProduct {
    const imageUrls: string[] = Array.isArray(product.productImageUrl)
      ? product.productImageUrl.filter((u: any) => typeof u === 'string' && u)
      : (typeof product.productImageUrl === 'string' && product.productImageUrl)
        ? [product.productImageUrl]
        : [];
    const primaryImg = imageUrls[0] || '';
    return {
      id: product.productId || '',
      title: product.productName || '',
      img: primaryImg,
      category: { name: product.subCategoryName || product.categoryName || '' },
      price: product.productUnitPrice || 0,
      discount: product.discountPercentage ? product.discountPercentage : (product.discountedPrice ? ((1 - product.discountedPrice / product.productUnitPrice) * 100) : 0),
      quantity: product.productQuantity || 0,
      status: product.productStatus || 'In-Stock',
      productType: 'genex',
      description: product.productDescription || '',
      additionalInformation: [],
      sellCount: product.sales || 0,
      brand: { name: product.productBrand || '' },
      sku: product.sku || '',
      slug: product.slug || '',
      unit: product.unit || '',
      imageURLs: imageUrls.map((img: string) => ({ img })),
      parent: product.categoryName || '',
      children: product.subCategoryName || '',
    };
  }

  getHotDealsProducts(count: number): Observable<IProduct[]> {
    return this.http.get<{ success: boolean; message: any[] }>(`${this.apiUrl}product/hotdeals/${count}`).pipe(
      map(response => (response.message || []).map(this.mapToIProduct))
    );
  }

  getTopRatedProducts(count: number): Observable<IProduct[]> {
    return this.http.get<{ success: boolean; message: any[] }>(`${this.apiUrl}product/topRated/${count}`).pipe(
      map(response => (response.message || []).map(this.mapToIProduct))
    );
  }

  getDiscountedProducts(count: number): Observable<IProduct[]> {
    return this.http.get<{ success: boolean; message: any[] }>(`${this.apiUrl}product/discounted/${count}`).pipe(
      map(response => (response.message || []).map(this.mapToIProduct))
    );
  }

  getTopSellingProducts(count: number): Observable<IProduct[]> {
    return this.http.get<{ success: boolean; message: any[] }>(`${this.apiUrl}product/topSelling/${count}`).pipe(
      map(response => (response.message || []).map(this.mapToIProduct))
    );
  }
}
