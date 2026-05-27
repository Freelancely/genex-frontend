import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IProduct } from '@/types/product-type';
import { environment } from 'src/environments/environment';

interface ApiResponse {
  success: boolean;
  data: {
    productId: string;
    productName: string;
    productBrand: string;
    productImageUrl: string;
    productUnitPrice: number;
    discountedPrice: number;
    discountPercentage: number;
    productQuantity: number;
    subCategoryId: string;
    subCategoryName: string;
    sales: number;
    productStatus: string;
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

@Injectable({
  providedIn: 'root'
})
export class ElectronicOfferProductsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHotDealsProducts(): Observable<IProduct[]> {
    const requestBody = {
      pageNumber: 1,
      pageSize: 10,
      categoryName: '',
      subCategoryName: '',
      productName: '',
      productBrand: '',
      minPrice: 0,
      hasDiscount: true,
      inStockOnly: true,
      hotDeals: true,
      attributeFilters: {}
    };

    return this.http.post<ApiResponse>(`${this.apiUrl}product/view-products`, requestBody).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data.map(item => {
            const rawImg: any = item.productImageUrl;
            const imageUrls: string[] = Array.isArray(rawImg)
              ? rawImg.filter((u: any) => typeof u === 'string' && u)
              : (typeof rawImg === 'string' && rawImg) ? [rawImg] : [];
            const primary = imageUrls[0] || 'assets/images/placeholder.jpg';
            return ({
            id: item.productId,
            sku: '',
            img: primary,
            title: item.productName,
            slug: item.productName.toLowerCase().replace(/\s+/g, '-'),
            unit: '',
            imageURLs: imageUrls.length ? imageUrls.map(u => ({ img: u })) : [{ img: primary }],
            parent: '', // Default
            children: '', // Default
            price: item.productUnitPrice,
            discount: item.discountPercentage || 0, // Use discountPercentage
            quantity: item.productQuantity,
            brand: { name: item.productBrand },
            category: { name: item.subCategoryName || 'Uncategorized' }, // Use subCategoryName
            status: item.productStatus.toLowerCase() as 'in-stock' | 'out-of-stock', // Map status
            reviews: [], // Default
            productType: 'genex', // Default to match original component filter
            description: '', // Default: not provided by API
            additionalInformation: [], // Default
            featured: false, // Default
            sellCount: item.sales,
            offerDate: item.discountPercentage > 0 ? { // Assume offerDate for discounts
              startDate: new Date().toISOString(), // Default: current date
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default: 7 days from now
            } : undefined,
            tags: [], // Default
            videoId: undefined, // Default
            sizes: [], // Default
            subCategoryId: item.subCategoryId
          } as IProduct);
          });
        }
        return [];
      })
    );
  }
}
