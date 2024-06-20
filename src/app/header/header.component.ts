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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categories = [];
    this.Souscategories = [];
    this.checkLoggedInUser();

    this.getCategories();
  }

  checkLoggedInUser(): void {
    if (this.document.defaultView && this.document.defaultView.localStorage) {
      const userId =
        this.document.defaultView.localStorage.getItem('loggedInUserId');
      const accessToken =
        this.document.defaultView.localStorage.getItem('loggedInUserToken');
      if (userId && accessToken) {
        this.userService
          .getUserInfoById(Number(userId), accessToken)
          .subscribe((userInfo) => {
            if (userInfo.data) {
              this.status = true;
              this.loggedInUserName = `${userInfo.data.first_name} ${userInfo.data.last_name}`;
            } else {
              this.status = false;
            }
          });
      }
    }
  }

  logout(): void {
    this.status = false;
    this.authGuard.logout();
  }

  navigateToCategory(categoryId: number) {
    window.location.href = `/ads-category/${categoryId}`;
  }
  fetchCategories(): void {
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
  }
  getCategories(): void {
    this.categoryService.getCategoriesFrom().subscribe((categories) => {
      // Filter root categories
      this.categories = categories.data.filter(
        (category: { active: boolean; parent_id: null }) =>
          category.active === true && category.parent_id === null
      );
      //console.log('ttttttttttttt', categories, this.categories);

      // Loop through root categories
      this.categories.forEach((category: any) => {
        // Find subcategories for each root category
        category.subcategories = categories.data.filter(
          (subcat: any) =>
            subcat.active === true && subcat.parent_id === category.id
        );

        // Loop through subcategories
        category.subcategories.forEach((subcategory: any) => {
          // Find sub-subcategories for each subcategory
          subcategory.subsubcategories = categories.data.filter(
            (subsubcat: any) =>
              subsubcat.active === true &&
              subsubcat.parent_id === subcategory.id
          );
        });
      });

      //console.log('Filter root categories', this.categories);
    });
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
    this.router.navigate(['/ads-category', categoryId], {
      queryParams: { search: searchQuery },
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

      // Display the selected option's value in the console
      //console.log('yyyyyyyyyyy', selectedOptionValue);
    } else {
      console.log('Select element not found');
    }

    //console.log('zzzzz', this.selectedCategoryId);
    if (this.selectedCategoryId) {
      this.navigateToCategory1(this.selectedCategoryId, this.searchQuery);
    }
  }
}
