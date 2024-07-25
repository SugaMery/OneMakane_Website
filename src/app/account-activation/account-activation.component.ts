import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../category.service';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-account-activation',
  templateUrl: './account-activation.component.html',
  styleUrl: './account-activation.component.css',
})
export class AccountActivationComponent implements OnInit {
  userId!: string;
  activationToken!: string;
  constructor(
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
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
    this.route.params.subscribe((params) => {
      this.userId = params['userId'];
      this.activationToken = params['activationToken'];
      console.log('user', this.userId);

      this.userService
        .activateAccount(this.userId!, this.activationToken!)
        .subscribe((data) => data);
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
}
