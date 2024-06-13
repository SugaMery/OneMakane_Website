import { Component } from '@angular/core';
import { PageService } from '../page.service';

@Component({
  selector: 'app-mentions-legales',
  templateUrl: './mentions-legales.component.html',
  styleUrl: './mentions-legales.component.css',
})
export class MentionsLegalesComponent {
  pageContent: any;

  constructor(private pageService: PageService) {}

  ngOnInit(): void {
    this.loadPage('3', '1'); // Example pageId and langId
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
