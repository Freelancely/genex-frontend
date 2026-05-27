import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
  standalone: false
})

export class ConfirmEmailComponent implements OnInit {
  status: string | null = null;
  message: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'];
      this.message = params['message'];

      if (this.status === 'success') {
        this.toastrService.success('Email verified successfully! You can now log in.');
      } else if (this.status === 'failed') {
        this.toastrService.error(this.message || 'Email verification failed. Please try again or contact support.');
      }
    });
  }
}
