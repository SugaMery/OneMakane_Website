import { Component } from '@angular/core';
import { PageService } from '../page.service';

@Component({
  selector: 'app-conditions-generales',
  templateUrl: './conditions-generales.component.html',
  styleUrl: './conditions-generales.component.css',
})
export class ConditionsGeneralesComponent {
  pageContent: any;

  constructor(private pageService: PageService) {}

  ngOnInit(): void {
    this.loadPage('2', '1'); // Example pageId and langId
  }

  loadPage(pageId: string, langId: string): void {
    this.pageService.getPage(pageId, langId).subscribe(
      (data) => {
        this.pageContent = data.data.content;
      },
      (error) => {
        console.error('Error fetching page data', error);
      }
    );
  }
}