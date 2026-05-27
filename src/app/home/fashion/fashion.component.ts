import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-fashion',
    templateUrl: './fashion.component.html',
    styleUrls: ['./fashion.component.scss'],
    standalone: false
})
export class FashionComponent {
  @Input () style_2 : Boolean | undefined;
  @Input () primary_style : Boolean | undefined;
  @Input () style_3 : Boolean | undefined;
}
