import { Component, Renderer2 } from '@angular/core';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';
import { ActivatedRoute } from '@angular/router';

interface Filter {
  label: string;
  type: string;
  help: string;
  dependent? : string ;
  options?: any; // Add other properties as needed
  conditions?: { [key: string]: string };
  selectedCondition?: { key: string; value: string };
}

interface Filters {
  [key: string]: Filter;
}


@Component({
  selector: 'app-ads-grid',
  templateUrl: './ads-grid.component.html',
  styleUrl: './ads-grid.component.css'
})
export class AdsGridComponent {
  categoryId !: Number;
  filters: Filters = {};
  category:any = {};
  categoryParent:any = {};

  constructor(
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.categoryId = +id;
      this.getCategoriesFilters();
    } else {}
  }

  getCategoriesFilters(): void {
    const category_id = this.categoryId?.toString();
    this.categoryService.getCategoryById(category_id!).subscribe((datas) => {
      this.filters = datas.data.filters;
      this.category = datas.data;
      this.parentCategory();
      console.log('filters', this.filters,this.category);
    });
  }


  parentCategory(): void {
    this.categoryService.getCategoryById(this.category.parent_id).subscribe((datas) => {
      this.categoryParent = datas.data;
      console.log('filters', this.categoryParent);
    });
  }

  getFilterKeys(): string[] {
    return Object.keys(this.filters);
  }
}
