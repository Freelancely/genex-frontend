import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct } from '@/types/product-type';
import { ProductService, Product } from 'src/app/pages/Admin/Product/Product-Service/product.service';
import { switchMap, map } from 'rxjs/operators'; // Import map operator
import { of } from 'rxjs';

@Component({
  selector: 'app-dynamic-product-details',
  templateUrl: './dynamic-product-details.component.html',
  styleUrls: ['./dynamic-product-details.component.scss'],
  standalone: false
})
export class DynamicProductDetailsComponent implements OnInit {
  public product: IProduct | null = null;
  public loading = true;
  public error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const productId = params.get('id');
        if (productId) {
          return this.productService.getProductById(productId).pipe(
            map((apiProduct: Product) => {
              if (apiProduct) {
                return this.mapToIProduct(apiProduct, apiProduct.stock || 0); // Fallback to 0 if stock is undefined
              }
              return null;
            })
          );
        }
        return of(null);
      })
    ).subscribe({
      next: (product: IProduct | null) => {
        this.loading = false;
        if (!product) {
          console.error('Product not found for ID:', this.route.snapshot.paramMap.get('id'));
          this.error = 'Product not found. Please try another product.';
        } else {
          this.product = product;
        }
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        this.loading = false;
        this.error = 'Failed to load product details. Please try again later.';
      }
    });
  }

  private mapToIProduct(apiProduct: Product, productQuantity: number): IProduct {
    return {
      id: apiProduct.id,
      cartItemId: undefined,
      sku: '',
      img: apiProduct.images[0] || '',
      title: apiProduct.name,
      slug: apiProduct.name.toLowerCase().replace(/\s+/g, '-') || '',
      unit: '',
      imageURLs: apiProduct.images.map(img => ({
        img,
        color: apiProduct.attributes.find(attr => attr.productAttributeName.toLowerCase() === 'color')
          ? {
              name: apiProduct.attributes.find(attr => attr.productAttributeName.toLowerCase() === 'color')!.productAttributeValue,
              clrCode: apiProduct.attributes.find(attr => attr.productAttributeName.toLowerCase() === 'color')!.productAttributeValue.toLowerCase()
            }
          : undefined
      })),
      parent: apiProduct.subCategoryName || '',
      children: apiProduct.subCategoryName || '',
      price: apiProduct.price,
      discountedPrice: apiProduct.discountedPrice || undefined,
      discount: apiProduct.discountPercentage ? apiProduct.discountPercentage : 0,
      quantity: productQuantity,
      wishlistId: undefined,
      brand: { name: apiProduct.brand },
      category: { name: apiProduct.categoryName || '' },
      status: apiProduct.status || 'active',
      reviews: [],
      productType: '',
      description: apiProduct.description,
      orderQuantity: undefined,
      additionalInformation: apiProduct.attributes.map(attr => ({
        key: attr.productAttributeName,
        value: attr.productAttributeValue
      })),
      featured: apiProduct.featured,
      sellCount: apiProduct.sales,
      offerDate: undefined,
      tags: undefined,
      videoId: undefined,
      sizes: undefined,
      subCategoryId: apiProduct.subCategoryId,
      subCategoryName: apiProduct.subCategoryName,
      hotdeals: apiProduct.featured,
      attributes: apiProduct.attributes || []
    };
  }

  goBackToShop(): void {
    this.router.navigate(['/shop']);
  }
}
