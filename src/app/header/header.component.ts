import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CategoryService } from '../category.service';
import { UserService } from '../user.service';
import { AuthGuard } from '../auth.guard';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService } from '../language.service';

interface Category {
  active: boolean;
  created_at: string;
  id: number;
  model: any;
  route: any;
  name: string;
  parent_id: number | null;
  slug: string | null;
  url: string | null;
  parentCategoy?: Category;
  icon_path: string;
  content?: string;
  label?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  loggedInUserName: string = 'Compte';
  categories: any[] = [];
  Souscategories: any[] = [];
  showMore: boolean = false;
  status: boolean = false;
  allcategories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private authGuard: AuthGuard,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private languageService: LanguageService
  ) {}
  currentLanguage!: string;

  setLanguage(language: string) {
    this.languageService.setLanguage(language);
    this.currentLanguage = language;
  }
  ngOnInit(): void {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.categories = [];
    this.Souscategories = [];
    this.checkLoggedInUser();

    this.getCategories();
  }

  checkLoggedInUser(): void {
    const localStorage = this.document?.defaultView?.localStorage;

    if (localStorage) {
      const userId = localStorage.getItem('loggedInUserId');
      const accessToken = localStorage.getItem('loggedInUserToken');
      const refreshToken = localStorage.getItem('loggedInUserRefreshToken');

      if (userId && accessToken && refreshToken) {
        this.userService.getUserInfoById(Number(userId), accessToken).subscribe(
          (userInfo) => {
            if (userInfo.data) {
              this.status = true;
              this.loggedInUserName = `${userInfo.data.first_name} ${userInfo.data.last_name}`;
            } else {
              this.status = false;
            }
          },
          (error) => {
            console.error('Error fetching user info:', error);
            this.status = false;
          }
        );
      } else {
        this.status = false;
      }
    } else {
      this.status = false;
    }
  }

  logout(): void {
    this.status = false;
    this.authGuard.logout();
  }
  preFilterValues: any[] = [];

  navigateToCategory(categoryId: number) {
    window.location.href = `/ads-category/${categoryId}`;
  }
  /*   fetchCategories(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');
    if (!accessToken) {
      return;
    }
    this.categoryService.getCategoriesFrom().subscribe(
      (categories) => {
        this.categories = categories.data.filter(
          (category: Category) =>
            category.active === true && category.parent_id !== null
        );
        for (let i = 0; i < this.categories.length; i++) {
          const parentId = this.categories[i].parent_id?.toString();
          const Id = this.categories[i].id?.toString();
          if (!parentId) {
            continue;
          }
          this.categoryService
            .getCategoryById(parentId)
            .subscribe(
              (parent) => (this.categories[i].parentCategoy = parent.data)
            );
          this.categoryService
            .getCategoryById(Id)
            .subscribe(
              (parent) =>
                (this.categories[i].model_fields = parent.data!.model_fields)
            );
        }
        console.log('categories categories 555', this.categories);
        const uniqueResults = new Set<number>(); // Assuming category ids are numbers

        this.categories.forEach((category) => {
          let isUnique = true;

          this.categories.forEach((potentialParent) => {
            if (category.parent_id === potentialParent.id) {
              isUnique = false;
            }
          });

          if (isUnique) {
            uniqueResults.add(category.id);
            //console.log('goooood', category);
          }
        });

        // Display unique results without repetition
        uniqueResults.forEach((categoryId) => {
          const uniqueCategory = this.categories.find(
            (cat) => cat.id === categoryId
          );
          if (uniqueCategory) {
            this.allcategories.push(uniqueCategory);
          }
        });
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );
    console.log('categories categories', this.categories);
  } */
  subcategories: any[] = [];
  getCategories(): void {
    this.categoryService.getCategoriesFrom().subscribe((categories) => {
      // Filter root categories
      this.categories = categories.data.filter(
        (category: { active: boolean; parent_id: null }) =>
          category.active === true && category.parent_id === null
      );

      this.categories.forEach((category: any, index: number) => {
        this.categoryService.getCategoryById(category.id).subscribe((datas) => {
          this.categories[index] = { ...category, ...datas.data };
        });
      });

      console.log('Initial categories:', this.categories);
      // Loop through root categories
      this.categories.forEach((category: any) => {
        // Find subcategories for each root category
        this.subcategories = categories.data;

        this.subcategories.forEach((category: any, index: number) => {
          this.categoryService
            .getCategoryById(category.id)
            .subscribe((datas) => {
              this.subcategories[index] = { ...category, ...datas.data };
            });
        });

        this.subcategories.forEach((categorys) => {
          if (
            categorys.active === true &&
            categorys.parent_id === category.id
          ) {
            // Ensure category.subcategories is initialized
            if (!category.subcategories) {
              category.subcategories = [];
            }
            // console.log('Initial categorys:', categorys.id);

            this.categoryService
              .getCategoryById(categorys.id)
              .subscribe((datas) => {
                //console.log('Initial datas:', datas.data);
                //category.subcategories.push(datas.data);
                categorys.category_langs = datas.data.category_langs;
              });
            // console.log('Initial caty:', caty);
            category.subcategories.push(categorys);
          }
        });

        console.log(
          'Updated category:',
          this.subcategories,
          category.subcategories
        );
        category.subcategories.forEach((subcategory: any) => {
          this.categoryService
            .getCategoryById(subcategory.id)
            .subscribe((data) => {
              const preFilter = data.data.pre_filter;
              this.preFilterValues = [];
              subcategory.subsubscategories = [];
              for (const key in preFilter) {
                if (preFilter.hasOwnProperty(key)) {
                  const list = preFilter[key];
                  for (const keys in list) {
                    if (list.hasOwnProperty(keys)) {
                      const alreadyExists = this.preFilterValues.some(
                        (item) => item[keys] === list[keys]
                      );
                      if (!alreadyExists) {
                        this.preFilterValues.push({ [keys]: list[keys] });
                        subcategory.subsubscategories.push({
                          key: keys,
                          value: list[keys],
                          type: key,
                        });
                      }
                    }
                  }
                }
              }
            });
        });
      });

      console.log('Filter root categories', this.categories);
    });
  }
  getValueFromObject(obj: any): { key: string; value: string } {
    const key = Object.keys(obj)[0]; // Get the key ('vtt' in this case)
    return { key: key, value: obj[key] }; // Return an object with the key and value
  }

  toggleMoreCategories(): void {
    this.showMore = !this.showMore;
    const moreSlideOpen = document.querySelector(
      '.more_slide_open'
    ) as HTMLElement;
    if (moreSlideOpen) {
      moreSlideOpen.style.display = this.showMore ? 'block' : 'none';
    }
  }

  selectedCategoryId: any;
  searchQuery: string = '';

  navigateToCategory1(categoryId: number, searchQuery: string): void {
    const url = `/ads-category/${categoryId}?search=${searchQuery}`;
    window.location.href = url;
  }
  navigateToCategorys(subcategory: any, subsubcat: any) {
    const key = Object.keys(subsubcat)[0]; // Get the key ('vtt' in this case)
    const value = subsubcat[key]; // Get the corresponding value ('VTT' in this case)

    this.router.navigate(['/ads-category', subcategory], {
      queryParams: { search: value },
    });
  }
  onSubmit(): void {
    // Get the select element by class
    // Get the select element by class
    const selectElement = document.querySelector(
      '.select-active'
    ) as HTMLSelectElement;

    // Check if the select element is found
    if (selectElement) {
      // Get the selected option's value
      const selectedOptionValue = selectElement.value;
      this.selectedCategoryId = selectedOptionValue;

      // Display the selected option's value in the console
      console.log('yyyyyyyyyyy', selectedOptionValue);
    } else {
      console.log('Select element not found');
    }

    console.log('zzzzz', this.selectedCategoryId, this.searchQuery);
    window.location.href = `/ads-category/${this.selectedCategoryId}?search=${this.searchQuery}`;
    //this.navigateToCategory1(this.selectedCategoryId, this.searchQuery);
  }
}
