import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '@/shared/services/contact.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  standalone: false
})
export class ContactFormComponent implements OnInit {
  public contactForm!: FormGroup;
  public formSubmitted = false;
  public submitting = false;

  constructor(
    private toastrService: ToastrService,
    private contactService: ContactService
  ) {}

  ngOnInit() {
    this.contactForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(200)]),
      subject: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      message: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(5000)])
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.contactForm.invalid || this.submitting) return;

    this.submitting = true;
    const payload = {
      name: this.contactForm.value.name.trim(),
      email: this.contactForm.value.email.trim(),
      subject: this.contactForm.value.subject.trim(),
      message: this.contactForm.value.message.trim()
    };

    this.contactService.sendMessage(payload).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.toastrService.success(response.message || 'Message sent successfully');
          this.contactForm.reset();
          this.formSubmitted = false;
        } else {
          this.toastrService.error(response.message || 'Could not send message');
        }
      },
      error: () => {
        // The HTTP interceptor already shows an error toast from error.error.message.
        this.submitting = false;
      }
    });
  }

  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get subject() { return this.contactForm.get('subject'); }
  get message() { return this.contactForm.get('message'); }
}
