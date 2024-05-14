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
export class HeaderComponent implements OnInit {
  loggedInUserName: string = 'Compte';
  categories: any[] = [];
  Souscategories: any[] = [];
  showMore: boolean = false;
  status: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private authGuard: AuthGuard,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
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

  getCategories(): void {
    if (this.document.defaultView && this.document.defaultView.localStorage) {
      const accessToken =
        this.document.defaultView.localStorage.getItem('loggedInUserToken');
      if (accessToken) {
        this.categoryService.getCategoriesFrom().subscribe((categories) => {
          // Filter root categories
          this.categories = categories.data.filter(
            (category: { active: boolean; parent_id: null }) =>
              category.active === true && category.parent_id === null
          );

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
        });
      }
    }
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
}
