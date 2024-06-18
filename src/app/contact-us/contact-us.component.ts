import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../contact.service';
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
  contactForm!: FormGroup;

  constructor(private fb: FormBuilder, private contactService: ContactService) { }

  ngOnInit(): void {

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('^[0-9]+$')],
      object: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {

    if (this.contactForm.valid) {
      console.log("this.con",this.contactForm,this.contactForm.value);
      this.contactService.sendContactDetails(this.contactForm.value).subscribe(
        response => {
          console.log('Success!', response);
          // Optionally, handle the response, show a success message, etc.
          this.contactForm.reset();
        },
        error => {
          console.error('Error!', error);
          // Optionally, handle the error, show an error message, etc.
        }
      );
    } else {
      // Mark all fields as touched to display validation messages
      this.markFormGroupTouched(this.contactForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
