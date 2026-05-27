import { Component } from '@angular/core';

@Component({
    selector: 'app-footer-two',
    templateUrl: './footer-two.component.html',
    styleUrls: ['./footer-two.component.scss'],
    standalone: false
})
export class FooterTwoComponent {

  getYear () {
    return new Date().getFullYear();
  }
}
