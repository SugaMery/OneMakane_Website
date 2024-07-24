import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../contact.service';
import { CategoryService } from '../category.service';
import { LanguageService } from '../language.service';
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
  contactForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private categoryService: CategoryService,
    private languageService: LanguageService
  ) {}
  currentLanguage!: string;

  setLanguage(language: string) {
    this.languageService.setLanguage(language);
    this.currentLanguage = language;
  }

  ngOnInit(): void {
    this.currentLanguage = this.languageService.getCurrentLanguage();

    this.fetchCategories();

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('^[0-9]+$')],
      object: ['', Validators.required],
      message: ['', Validators.required],
    });
  }
  categories: any[] = [];
  Souscategories: any[] = [];

  allcategories: any[] = [];
  fetchCategories(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');
    if (!accessToken) {
      return;
    }
    this.categoryService.getCategoriesFrom().subscribe(
      (categories) => {
        this.categories = categories.data.filter(
          (category: any) =>
            category.active === true && category.parent_id !== null
        );
        for (let i = 0; i < this.categories.length; i++) {
          const parentId = this.categories[i].parent_id?.toString();
          const Id = this.categories[i].id?.toString();
          if (!parentId) {
            continue;
          }
        }
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );
    console.log('categories categories', this.categories);
  }
  onSubmit() {
    if (this.contactForm.valid) {
      console.log('this.con', this.contactForm, this.contactForm.value);
      this.contactService.sendContactDetails(this.contactForm.value).subscribe(
        (response) => {
          console.log('Success!', response);
          // Optionally, handle the response, show a success message, etc.
          this.contactForm.reset();
        },
        (error) => {
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
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
