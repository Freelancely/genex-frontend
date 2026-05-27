import { Component, OnInit } from '@angular/core';
import { ProductService, ProductResponse, ProductAttribute } from 'src/app/pages/Admin/Product/Product-Service/product.service';
import { IProduct } from '@/types/product-type';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-electronic-gadget-products',
  templateUrl: './electronic-gadget-products.component.html',
  styleUrls: ['./electronic-gadget-products.component.scss'],
  standalone: false
})
export class ElectronicGadgetProductsComponent implements OnInit {
  public electronic_prd: IProduct[] = [];
  public product_gadget: IProduct[] = [];
  public loading = true;

  constructor(public productService: ProductService) {
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getAllProducts({
      pageNumber: 1,
      pageSize: 10,
      inStockOnly: false // Show both in-stock and out-of-stock products
    }).pipe(
      map((response: ProductResponse) => {
        return response.data.map(item => ({
          id: item.productId,
          cartItemId: undefined, // Not provided by API
          sku: item.productId, // Use productId as SKU
          img: item.productImageUrl && item.productImageUrl.length > 0 ? item.productImageUrl[0] : '', // Use first image as primary
          title: item.productName,
          slug: item.productName.toLowerCase().replace(/\s+/g, '-'), // Generate slug
          unit: 'unit', // Default value
          imageURLs: item.productImageUrl ? item.productImageUrl.map(url => ({ img: url })) : [], // Map to array of { img: string }
          parent: item.subCategoryName || 'Electronics', // Default to subcategory or generic
          children: '', // Not provided by API
          price: item.productUnitPrice,
          discount: item.discountPercentage || 0, // Use discountPercentage or 0
          quantity: item.productQuantity,
          brand: { name: item.productBrand || 'Unknown' },
          category: { name: item.subCategoryName || 'Electronics' }, // Default to subcategory or generic
          status: item.productStatus === 'In-Stock' ? 'active' : 'out-of-stock',
          reviews: [], // Not provided by API
          productType: 'genex', // As per original filtering
          description: item.productDescription || '',
          orderQuantity: 0, // Default
          additionalInformation: item.attributes?.map((attr: ProductAttribute) => ({
            key: attr.productAttributeName,
            value: attr.productAttributeValue
          })) || [], // Map attributes to additionalInformation
          featured: item.hotdeals || false, // Map hotdeals to featured
          sellCount: item.sales || 0,
          offerDate: undefined, // Not provided by API
          tags: [], // Not provided by API
          videoId: undefined, // Not provided by API
          sizes: [], // Not provided by API
          subCategoryId: item.subCategoryId
        } as IProduct));
      })
    ).subscribe({
      next: (products) => {
        this.electronic_prd = products;
        this.product_gadget = products.slice(0, 6); // Limit to 6 items
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }
}
