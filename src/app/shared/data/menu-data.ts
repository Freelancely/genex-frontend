import { IMenuItem, IMobileType } from "@/types/menu-d-type";

export const menu_data:IMenuItem[] = [
  {
    id:1,
    link:'/home/electronic',
    title:'Home',
    mega_menu:false,
  },
  {
    id:3,
    link:'/shop',
    title:'Products',
    mega_menu:false,
  },
  {
    id:4,
    link:'/pages/about',
    title:'About',
  },
  // {
  //   id:5,
  //   link:'/pages/blog',
  //   title:'Blog',
  //   drop_down:true,
  //   dropdown_menus:[
  //     {title:'Blog Standard',link:'/pages/blog'},
  //     {title:'Blog Grid',link:'/pages/blog-grid'},
  //     {title:'Blog List',link:'/pages/blog-list'},
  //     {title:'Blog Details',link:'/pages/blog-details'},
  //   ]
  // },
  {
    id:5,
    link:'/pages/contact',
    title:'Contact',
  },
]

// mobile menu data
export const mobile_menu:IMobileType[] = [
  {
    id: 1,
    sub_menu: false,
    title: 'Home',
    link: '/home/electronic',
    sub_menus: [
      // {
      //   id:1,
      //   title:'Electronics',
      //   img:'/assets/img/menu/menu-home-1.jpg',
      //   link:'/home/electronic'
      // },
      // {
      //   id:2,
      //   title:'Fashion',
      //   img:'/assets/img/menu/menu-home-2.jpg',
      //   link:'/home/fashion'
      // },
      // {
      //   id:3,
      //   title:'Beauty',
      //   img:'/assets/img/menu/menu-home-3.jpg',
      //   link:'/home/beauty'
      // },
      // {
      //   id:4,
      //   title:'Jewelry',
      //   img:'/assets/img/menu/menu-home-4.jpg',
      //   link:'/home/jewelry'
      // }
    ]
  },
  {
    id: 2,
    sub_menu: false,
    title: 'Products',
    link: '/shop',
    sub_menus: [
      {title:'Shop',link:'/shop'},
    //   {title:'Shop Categories',link:'/shop/shop-category'},
    //   {title:'List Layout',link:'/shop/shop-list'},
    //   {title:'Full width Layout',link:'/shop/shop-full-width'},
    //   {title:'1600px Layout',link:'/shop/shop-1600'},
    //   {title:'Left Sidebar',link:'/shop'},
    //   {title:'Right Sidebar',link:'/shop/shop-right-sidebar'},
    //   {title:'Hidden Sidebar',link:'/shop/shop-no-sidebar'},
    //   {title:'Filter Dropdown',link:'/shop/shop-filter-dropdown'},
    //   {title:'Filters Offcanvas',link:'/shop/shop-filter-offcanvas'},
    //   {title:'Load More button',link:'/shop/shop-load-more'},
    //   {title:'1600px Layout',link:'/shop/shop-1600'},
    ],
  },
  {
    id: 4,
    sub_menu: true,
    title: 'Cart',
    link: '/shop/cart',
    sub_menus: [
      {title:'Shopping Cart',link:'/shop/cart'},
      {title:'Track Your Order',link:'/shop/order'},
      // {title:'Compare',link:'/shop/compare'},
      {title:'Wishlist',link:'/shop/wishlist'},
      {title:'Checkout',link:'/pages/checkout'},
      {title:'My account',link:'/pages/profile'}
    ],
  },
  {
    id: 5,
    sub_menu: true,
    title: 'Login/Register',
    link: '/login',
    sub_menus: [
      {title:'Login',link:'/pages/login'},
      {title:'Register',link:'/pages/register'},
      {title:'Forgot Password',link:'/pages/forgot'}
    ],
  },
  {
    id: 8,
    single_link: true,
    title: 'About',
    link: '/pages/about',
  },
  {
    id: 8,
    single_link: true,
    title: 'Contact',
    link: '/pages/contact',
  },
]
