import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IProduct } from '@/types/product-type';
import product_data from '@/data/product-data';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public filter_offcanvas: boolean = false;
  private apiUrl = `${environment.apiUrl}product`;

  constructor(private http: HttpClient) {}

  // Get Products (existing)
  public get products(): Observable<IProduct[]> {
    return of(product_data);
  }

  // Map API response to IProduct interface
  private mapToIProduct(apiProduct: any): IProduct {
    const imageUrls: string[] = Array.isArray(apiProduct.productImageUrl)
      ? apiProduct.productImageUrl
      : apiProduct.productImageUrl
        ? [apiProduct.productImageUrl]
        : [];
    const nameBase: string = apiProduct.productName || '';
    return {
      id: apiProduct.productId,
      sku: apiProduct.sku || '',
      img: imageUrls[0] || '',
      title: nameBase,
      slug: nameBase.toLowerCase().replace(/\s+/g, '-'),
      unit: apiProduct.unit || '',
      imageURLs: imageUrls.map((img: string) => ({
        img,
        color: apiProduct.attributes?.find((attr: any) => attr.productAttributeName === 'Color')
          ? {
              name: apiProduct.attributes.find((attr: any) => attr.productAttributeName === 'Color').productAttributeValue,
              clrCode: apiProduct.attributes.find((attr: any) => attr.productAttributeName === 'Color').productAttributeValue.toLowerCase(),
            }
          : undefined,
      })),
      parent: apiProduct.categoryName || '',
      children: apiProduct.subCategoryName || '',
      price: apiProduct.productUnitPrice || 0,
      discount: apiProduct.discountPercentage ? apiProduct.discountPercentage : 0,
      quantity: apiProduct.productQuantity || 0,
      brand: { name: apiProduct.brand?.name || '' }, // Provide default
      category: { name: apiProduct.categoryName || '' },
      status: apiProduct.productStatus || 'In-Stock',
      reviews: apiProduct.reviews || [],
      productType: apiProduct.productType || '',
      description: apiProduct.productDescription || '',
      additionalInformation: apiProduct.attributes?.map((attr: any) => ({
        key: attr.productAttributeName,
        value: attr.productAttributeValue,
      })) || [],
      sellCount: apiProduct.sales || 0,
      subCategoryId: apiProduct.subCategoryId || '',
      subCategoryName: apiProduct.subCategoryName || '',
      hotdeals: apiProduct.hotdeals || false,
      attributes: apiProduct.attributes || [],
    };
  }

  // Get Product By ID from API
  public getProductById(id: string): Observable<IProduct | undefined> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/get-productById/${id}`).pipe(
      map((response) => {
        if (response.success && response.data) {
          const product = this.mapToIProduct(response.data);
          this.handleImageActive(product.img);
          return product;
        }
        return undefined;
      }),
      catchError(() => {
        // Fallback to local data if API fails
        return this.products.pipe(
          map((items) => {
            const product = items.find((p) => p.id === id);
            if (product) {
              this.handleImageActive(product.img);
            }
            return product;
          })
        );
      })
    );
  }

  // Existing methods (unchanged)
  activeImg: string | undefined;

  handleImageActive(img: string) {
    this.activeImg = img;
  }

  public getRelatedProducts(productId: string, category: string): Observable<IProduct[]> {
    return this.products.pipe(
      map((items) =>
        items.filter(
          (p) =>
            p.category.name.toLowerCase() === category.toLowerCase() &&
            p.id !== productId
        )
      )
    );
  }

  public get maxPrice(): number {
    const max_price = product_data.reduce((max, product) => {
      return product.price > max ? product.price : max;
    }, 0);
    return max_price;
  }

  public filterSelect = [
    { value: 'asc', text: 'Default Sorting' },
    { value: 'low', text: 'Low to High' },
    { value: 'high', text: 'High to Low' },
    { value: 'on-sale', text: 'On Sale' },
  ];

  public filterProducts(filter: any[] = []): Observable<IProduct[]> {
    return this.products.pipe(
      map((product) =>
        product.filter((item: IProduct) => {
          if (!filter.length) return true;
          const Tags = filter.some((prev: any) => {
            if (item.tags) {
              return item.tags.includes(prev);
            }
            return false;
          });
          return Tags;
        })
      )
    );
  }

  public sortProducts(products: IProduct[], payload: string): any {
    if (payload === 'asc') {
      return products.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    } else if (payload === 'on-sale') {
      return products.filter((p) => p.discount > 0);
    } else if (payload === 'low') {
      return products.sort((a, b) =>
        a.price < b.price ? -1 : a.price > b.price ? 1 : 0
      );
    } else if (payload === 'high') {
      return products.sort((a, b) =>
        a.price > b.price ? -1 : a.price < b.price ? 1 : 0
      );
    }
  }

  public getPager(totalItems: number, currentPage: number = 1, pageSize: number = 9) {
    let totalPages = Math.ceil(totalItems / pageSize);
    let paginateRange = 3;

    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage < paginateRange - 1) {
      startPage = 1;
      endPage = startPage + paginateRange - 1;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    let pages = Array.from(Array(endPage + 1 - startPage).keys()).map(
      (i) => startPage + i
    );

    return {
      totalItems,
      currentPage,
      pageSize,
      totalPages,
      startPage,
      endPage,
      startIndex,
      endIndex,
      pages,
    };
  }
}
