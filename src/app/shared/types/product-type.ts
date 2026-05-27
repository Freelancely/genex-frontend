export type IReview = {
  reviewId?: string;
  rating: number;
  name: string;
  email: string;
  date: string;
  review: string;
  adminResponse?: string | null;
  isAdmin?: boolean;
  responses?: {
    username: string;
    responseDate: string;
    description: string;
    isAdmin?: boolean; // Add isAdmin to match API response
  }[];
};

export interface IProduct {
  id: string;
  cartItemId?: string;
  sku: string;
  img: string;
  title: string;
  slug: string;
  unit: string;
  imageURLs: {
    color?: {
      name: string;
      clrCode: string;
    };
    img: string;
  }[];
  parent: string;
  children: string;
  price: number;
  discount: number;
  discountedPrice?: number;
  quantity: number;
  wishlistId?: string;
  brand: {
    name: string;
  };
  category: {
    name: string;
  };
  status: string;
  reviews?: IReview[];
  productType: string;
  description: string;
  orderQuantity?: number;
  additionalInformation: {
    key: string;
    value: string;
  }[];
  featured?: boolean;
  sellCount: number;
  offerDate?: {
    startDate: string;
    endDate: string;
  };
  tags?: string[];
  videoId?: string;
  sizes?: string[];
  subCategoryId?: string;
  subCategoryName?: string; // Added for subCategoryName
  hotdeals?: boolean; // Added for hotdeals
  attributes?: { // Added for attributes
    subCategoryAttributeId: string;
    productAttributeId: string;
    productAttributeName: string;
    productAttributeValue: string;
  }[];
}
