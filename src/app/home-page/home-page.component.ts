import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',


})
export class HomePageComponent implements OnInit  {
  categories: any[] = [];
  Souscategories: any[] = [];
  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.getCategories();
    
  }

  displayedCategories: any[] = [];
  hiddenCategories: any[] = [];
  showMore: boolean = false;
  getCategories(): void {
    this.categoryService.getCategories()
      .subscribe(categories => {
        // Filter categories based on status = ACTIVE and parent_id = null
        this.categories = categories.filter(category => category.status === 'ACTIVE' && category.parent_id === null);
        this.Souscategories =categories.filter(category => category.status === 'ACTIVE' && category.parent_id !== null)
        this.displayedCategories = this.categories.slice(0, 11); // Afficher les 11 premières catégories
        this.hiddenCategories = this.categories.slice(11); // Mettre le reste dans les catégories cachées
      });
  }

  toggleShowMore(): void {
    this.showMore = !this.showMore;
  }
  calculateBgColor(index: number): string {
    const colors = ['9', '10', '11', '12', '13', '14', '15']; // Define your colors here
    return colors[index % colors.length]; // Modulo operation to cycle through colors
}


}
