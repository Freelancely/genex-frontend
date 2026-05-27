import { Component } from '@angular/core';

@Component({
    selector: 'app-social-links',
    templateUrl: './social-links.component.html',
    styleUrls: ['./social-links.component.scss'],
    standalone: false
})
export class SocialLinksComponent {

  public social_data = [
    {
      id:1,
      link:'https://www.facebook.com/',
      icon:'fa-brands fa-facebook-f',
      title:'Facebook'
    },
    {
      id:2,
      link:'https://twitter.com/',
      icon:'fa-brands fa-twitter',
      title:'Twitter'
    },
    {
      id:3,
      link:'https://www.linkedin.com/',
      icon:'fa-brands fa-linkedin-in',
      title:'Linkedin'
    },
  ]
}
