import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { SidebarService } from '../service/sidedar.service';
import { DashboardService } from '../Services/dashboard.service';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  image: string;
}

interface Order {
  id: string;
  customer: string;
  total: number;
  status: 'Placed' | 'Confirmed' | 'Dispatched' | 'Cancelled' | 'Returned' | 'Completed';
  date: Date;
  orderNo: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('salesChart', { static: false }) salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart', { static: false }) categoryChartRef!: ElementRef<HTMLCanvasElement>;

  private salesChart!: Chart;
  private categoryChart!: Chart;
  private sidebarSubscription?: Subscription;
  private dataSubscriptions: Subscription[] = [];

  // Sidebar state
  isCollapsed = false;
  isMobile = window.innerWidth <= 768;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Dashboard Stats
  totalRevenue = 0;
  totalOrders = 0;
  totalCustomers = 0;
  completedOrders = 0;

  // Chart Data
  salesChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Sales (NPR)',
        data: [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  salesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = typeof ctx.parsed.y === 'number' ? ctx.parsed.y : 0;
            return `Sales: ${DashboardComponent.formatNpr(val)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Month',
          color: '#6b7280',
          font: { size: 12, weight: 500 }
        }
      },
      y: {
  beginAtZero: true,
  grid: {
    color: '#f3f4f6'
  },
  title: {
    display: true,
    text: 'Revenue (NPR)',
    color: '#6b7280',
    font: { size: 12, weight: 500 }  // ← just add quotes here
  },
  ticks: {
    maxTicksLimit: 6,
    callback: (value) => DashboardComponent.formatCompactNpr(Number(value))
  }
}
    }
  };

  static formatCompactNpr(value: number): string {
    if (value == null || isNaN(value)) return 'Rs. 0';
    const abs = Math.abs(value);
    if (abs >= 1e9) return `Rs. ${(value / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`;
    if (abs >= 1e7) return `Rs. ${(value / 1e7).toFixed(abs >= 1e8 ? 0 : 1)}Cr`;
    if (abs >= 1e5) return `Rs. ${(value / 1e5).toFixed(abs >= 1e6 ? 0 : 1)}L`;
    if (abs >= 1e3) return `Rs. ${(value / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}K`;
    return `Rs. ${value.toLocaleString('en-IN')}`;
  }

  static formatNpr(value: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  categoryChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6'
        ],
        borderWidth: 0
      }
    ]
  };

  categoryChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  // Top Products
  topProducts: Product[] = [];

  // Recent Orders
  recentOrders: Order[] = [];

  constructor(
    private sidebarService: SidebarService,
    private dashboardService: DashboardService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(
      isCollapsed => this.isCollapsed = isCollapsed
    );
    this.fetchDashboardData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 768;
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
    this.dataSubscriptions.forEach(sub => sub.unsubscribe());
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  private fetchDashboardData(): void {
  this.isLoading = true;

  // Fetch stats
  const statsSub = this.dashboardService.getStats().subscribe({
    next: stats => {
      this.totalRevenue = stats.totalIncome;
      this.totalOrders = stats.totalOrders;
      this.totalCustomers = stats.totalCustomers;
      this.completedOrders = stats.completedOrders;

      // Update category chart data for sales by category
      const categories = ['Polytron', 'Genex', 'Chunlan'];
      const categorySales = [
        stats.Polytron || 0,
        stats.Genex || 0,
        stats.Chunlan || 0
      ];

      this.categoryChartData.labels = categories;
      this.categoryChartData.datasets[0].data = categorySales.length > 0 ? categorySales : [1];
      this.categoryChartData.datasets[0].backgroundColor = categorySales.length > 0 ? ['#3b82f6', '#10b981', '#f59e0b'] : ['#6b7280'];

      if (this.categoryChart) {
        this.categoryChart.update();
      }
      this.isLoading = false;
    },
    error: error => {
      this.errorMessage = 'Failed to load dashboard stats. Please try again later.';
      this.isLoading = false;
      console.error('Failed to load stats:', error);
    }
  });

  // Fetch recent orders
  const ordersSub = this.dashboardService.getRecentOrders().subscribe({
    next: orders => {
      this.recentOrders = orders.map(order => ({
        id:order.orderId,
        orderNo : order.orderNo,
        customer: order.fullName,
        total: order.amountAfterDiscount,
        status: order.status as 'Placed' | 'Confirmed' | 'Dispatched' | 'Cancelled' | 'Returned' | 'Completed',
        date: new Date(order.orderDateTime)
      }));
      this.isLoading = false;
    },
    error: error => {
      this.errorMessage = 'Failed to load recent orders. Please try again later.';
      this.isLoading = false;
      console.error('Failed to load recent orders:', error);
    }
  });

  // Fetch top products
  const productsSub = this.dashboardService.getTopProducts().subscribe({
    next: products => {
      this.topProducts = products.map(product => ({
        id: product.productId,
        name: product.productName,
        category: product.category,
        price: product.price,
        stock: product.stock,
        sales: product.totalQuantitySold,
        image: product.productImageUrl
      }));
      this.isLoading = false;
    },
    error: error => {
      this.errorMessage = 'Failed to load top products. Please try again later.';
      this.isLoading = false;
      console.error('Failed to load products:', error);
    }
  });

  // Fetch monthly sales
  const fromDate = '2025-01-01';
  const toDate = '2025-08-10';
  const salesSub = this.dashboardService.getMonthlySales(fromDate, toDate).subscribe({
    next: sales => {
      const labels = Object.keys(sales);
      const data = Object.values(sales);
      this.salesChartData.labels = labels.map(key => {
        const [year, month] = key.split('-');
        return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(Number(year), Number(month) - 1));
      });
      this.salesChartData.datasets[0].data = data;
      if (this.salesChart) {
        this.salesChart.update();
      }
      this.isLoading = false;
    },
    error: error => {
      this.errorMessage = 'Failed to load sales data. Please try again later.';
      this.isLoading = false;
      console.error('Failed to load monthly sales:', error);
    }
  });

  this.dataSubscriptions.push(statsSub, ordersSub, productsSub, salesSub);
}

  private initializeCharts(): void {
    this.createSalesChart();
    this.createCategoryChart();
  }

  private createSalesChart(): void {
    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.salesChart = new Chart(ctx, {
        type: 'line',
        data: this.salesChartData,
        options: this.salesChartOptions
      });
    }
  }

  private createCategoryChart(): void {
    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: this.categoryChartData,
        options: this.categoryChartOptions
      });
    }
  }

  getStatusClass(status: string): string {
  const statusClasses: { [key: string]: string } = {
    Placed: 'status-placed',
    Confirmed: 'status-confirmed',
    Dispatched: 'status-dispatched',
    Cancelled: 'status-cancelled',
    Returned: 'status-returned',
    Completed: 'status-completed'
  };
  return statusClasses[status] || 'status-default';
}

  getStockStatusClass(stock: number): string {
    if (stock < 20) return 'stock-low';
    if (stock < 50) return 'stock-medium';
    return 'stock-high';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  navigate() {
    this.router.navigate(['pages/admin/products']);
  }

  navigateOrders(){
    this.router.navigate(['pages/admin/order-list'])
  }
}
