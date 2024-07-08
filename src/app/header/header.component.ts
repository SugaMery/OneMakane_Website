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
    const localStorage = this.document?.defaultView?.localStorage;

    if (localStorage) {
        const userId = localStorage.getItem('loggedInUserId');
        const accessToken = localStorage.getItem('loggedInUserToken');
        const refrechToken = localStorage.getItem('loggedInUserRefreshToken');

        if (userId && accessToken && refrechToken ) {
            this.userService.refreshToken(refrechToken).subscribe(
                (response) => {
                  localStorage.setItem('loggedInUserRefreshToken', response.data.refresh_token);

                    this.userService.getUserInfoById(Number(userId), accessToken).subscribe((userInfo) => {
                        if (userInfo.data) {
                            this.status = true;
                            this.loggedInUserName = `${userInfo.data.first_name} ${userInfo.data.last_name}`;
                        } else {
                            this.status = false;
                        }
                    });
                },
                (error) => {
                   // console.error('Error refreshing token:', error);
                    this.status = false;
                }
            );
        }
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
          //Find sub-subcategories for each subcategory
/*           subcategory.subsubcategories = categories.data.filter(
            (subsubcat: any) =>
              subsubcat.active === true &&
              subsubcat.parent_id === subcategory.id
          );
          console.log("subcategory", subcategory);
 */

   this.categoryService.getCategoryById(subcategory.id).subscribe((data) => {
      const preFilter = data.data.pre_filter;
      //console.log("daaaaaaaaaaaaaaaaaaaateeeee", preFilter);

      // Clear the array before populating it
      this.preFilterValues = [];
      subcategory.subsubscategories =  [];

      // Collect values in the array
      for (const key in preFilter) {
        if (preFilter.hasOwnProperty(key)) {
          const list = preFilter[key];
          for (const keys in list) {
            if (list.hasOwnProperty(keys)) {
             // console.log('kkkkkkkkkkk', list[keys], key);
              const alreadyExists = this.preFilterValues.some(item => item[keys] === list[keys]);
      
              // If it doesn't exist, push it into this.preFilterValues
              if (!alreadyExists) {
                this.preFilterValues.push({ [keys]: list[keys] });
      
                // Push this.preFilterValues into subcategory.subsubcategories
                subcategory.subsubscategories.push({ key: keys, value: list[keys] ,type: key });
              }
            }
          }
        }
      }
      

// Ensure subcategory.subsubcategories is initialized as an array

// Log to check values for debugging

      // Log the array to verify the values
      //console.log('preFilterValues:', this.preFilterValues);
    }); 
    //console.log("subcategory", subcategory, this.preFilterValues, subcategory.subsubscategories);
   
        });
      });

      //console.log('Filter root categories', this.categories);
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
  navigateToCategorys(subcategory : any,subsubcat: any) {
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
      this.selectedCategoryId = selectedOptionValue

      // Display the selected option's value in the console
      console.log('yyyyyyyyyyy', selectedOptionValue);
    } else {
      console.log('Select element not found');
    }

    console.log('zzzzz', this.selectedCategoryId,this.searchQuery);
      window.location.href = `/ads-category/${this.selectedCategoryId}?search=${this.searchQuery}`;
      //this.navigateToCategory1(this.selectedCategoryId, this.searchQuery);
  }
}
