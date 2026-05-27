import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from '@/types/product-type';
import { ProductService, Product } from 'src/app/pages/Admin/Product/Product-Service/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  standalone: false
})
export class ProductDetailsComponent implements OnInit {
  public product: IProduct = {
    id: '',
    sku: '',
    img: '',
    title: '',
    slug: '',
    unit: '',
    imageURLs: [],
    parent: '',
    children: '',
    price: 0,
    discount: 0,
    quantity: 0,
    brand: { name: '' },
    category: { name: '' },
    status: '',
    reviews: [],
    productType: '',
    description: '',
    additionalInformation: [],
    sellCount: 0,
    attributes: []
  };

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (apiProduct: Product) => {
          this.product = this.mapToIProduct(apiProduct);
        },
        error: (err) => {
          console.error('Error fetching product:', err);
          this.product = { ...this.product, attributes: [] };
        }
      });
    } else {
      console.error('No product ID found in route');
      this.product = { ...this.product, attributes: [] };
    }
  }

  private mapToIProduct(apiProduct: Product): IProduct {
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
      parent: apiProduct.subCategoryName || '', // "Refrigerator"
      children: apiProduct.subCategoryName || '', // "Refrigerator"
      price: apiProduct.price,
      discount: apiProduct.discountPercentage ? apiProduct.discountPercentage : 0,
      discountedPrice: apiProduct.discountedPrice || undefined,
      quantity: apiProduct.stock,
      wishlistId: undefined,
      brand: { name: apiProduct.brand },
      category: { name: apiProduct.categoryName || '' }, // "Genex"
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
      subCategoryName: apiProduct.subCategoryName, // Redundant but kept for now
      hotdeals: apiProduct.featured,
      attributes: apiProduct.attributes || []
    };
  }
}
