import { Component,Input } from '@angular/core';
import { IBlogType } from '@/types/blog-type';
import blogData from '@/data/blog-data';

@Component({
    selector: 'app-blog-grid',
    templateUrl: './blog-grid.component.html',
    styleUrls: ['./blog-grid.component.scss'],
    standalone: false
})
export class BlogGridComponent {
  @Input() list_style : boolean = false;
  public blogs: IBlogType[] = [];
  public startIndex: number = 0;
  public endIndex: number = 6;

  ngOnInit() {
    this.blogs = blogData.filter((b) => b.blog === 'blog-grid');
  }

  handlePagination(event: any): void {
    const { data, start, end } = event;
    this.startIndex = start;
    this.endIndex = end;
  }
}
