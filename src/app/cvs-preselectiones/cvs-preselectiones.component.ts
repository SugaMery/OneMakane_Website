import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnnonceService } from '../annonce.service';
import { Message } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cvs-preselectiones',
  templateUrl: './cvs-preselectiones.component.html',
  styleUrl: './cvs-preselectiones.component.css',
})
export class CvsPreselectionesComponent {
  userData: any = {};
  adsCount: number = 0;
  ads: any[] = [];
  filteredAds: any[] = [];
  pagedAds: any[] = [];
  selectedStatus: any = { value: 'all', label: 'Statut : tous' };
  statusOptions = [
    { value: 'all', label: 'Statut : tous' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Approuvé' },
    { value: 'rejected', label: 'Rejeté' },
  ];
  itemsPerPage: number = 10; // Updated to show 6 items per page
  currentPage: number = 1;
  searchTerm: string = '';
  firstelement: any;
  constructor(
    private route: ActivatedRoute,
    private annonceService: AnnonceService,
    private sanitizer: DomSanitizer
  ) {
    this.cvUrl = this.firstelement;
  }
  updateCvUrl(url: string) {
    this.cvUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.firstelement
    );
  }
  resetFilter() {
    // Réinitialise le filtre pour afficher toutes les annonces
    this.filteredAds = [...this.pagedAds];
  }
  isPhone(): boolean {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      return true;
    } else {
      return false;
    }
  }
  filterSelected() {
    // Filtre pour afficher uniquement les CV sélectionnés
    this.filteredAds = this.pagedAds.filter((ad) => ad.status === 'approved');
  }
  isLinear(): boolean {
    return !this.isPhone();
  }
  ngOnInit(): void {
    const adId = this.route.snapshot.paramMap.get('id');
    const accessToken = localStorage.getItem('loggedInUserToken');

    this.annonceService.getJobAppliances(Number(adId), accessToken!).subscribe(
      (response) => {
        // Directly access response.data if it's an array
        if (Array.isArray(response.data)) {
          response.data.forEach((element: { id: number }) => {
            console.log('Element ID:', element.id);
            this.annonceService
              .getJobApplianceDetails(element.id, accessToken!)
              .subscribe(
                (dats) => {
                  console.log('Element IDyyyyyyy:', element.id);

                  this.ads.push(dats.data);
                  this.filteredAds = this.ads;
                  this.setPagedAds(); // Update paged ads after filtering
                  console.log(
                    'jobAppliances jobAppliances',
                    this.ads,
                    this.firstelement
                  );
                },
                (error) => {
                  console.error('Error fetching job appliance details:', error);
                }
              );
          });
        } else {
          console.error('Unexpected response structure:', response.data);
        }
      },
      (error) => {
        console.error('Error fetching job appliances:', error);
      }
    );
  }

  extractDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    return new Intl.DateTimeFormat('fr-FR', options)
      .format(date)
      .replace(',', ' à');
  }

  cvUrl: SafeResourceUrl;

  statuses!: any[];
  showDialog(ad: any) {
    this.selectedAd = ad; // Set the selected ad object
    this.adDialog = true;
    /*     this.annonceService.getDeleteReasons(this.accessToken!).subscribe((data)=>{
      console.log("dattttddd",data);
    }) */
  }
  getAds(): void {
    this.annonceService.getAllAdsValidator('approved').subscribe(
      (data) => {
        this.ads = data;
        this.filteredAds = this.ads;
        this.applyFilter();
      },
      (error) => {
        console.error('Error fetching ads data', error);
      }
    );
  }
  showJobOffersTab = false;
  categories: any[] = [];
  jobAppliances: any[] = [];
  adDialog: boolean = false;
  selectedAd: any;
  deleteReasons: any[] = [];

  fetchDeleteReasons(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');
    this.annonceService.getDeleteReasons(accessToken!).subscribe((data) => {
      this.deleteReasons = data.data;
    });
  }

  openDeleteDialog(ad: any): void {
    this.fetchDeleteReasons();
    this.selectedAd = ad;
    this.adDialog = true;
  }

  messages: Message[] = [];

  confirmDeletion(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');
    this.annonceService
      .getAdsWithFavoris(this.selectedAd.user_id)
      .subscribe((datas) => {
        console.log('rtttt datassss', datas);
      });

    const selectedReason = (
      document.querySelector('input[name="reason"]:checked') as HTMLInputElement
    )?.value;
    if (selectedReason) {
      this.annonceService
        .deleteAd(
          this.selectedAd.id,
          this.selectedAd.uuid,
          Number(selectedReason),
          accessToken!
        )
        .subscribe(() => {
          this.ads = this.ads.filter((ad: any) => ad !== this.selectedAd);
          this.filteredAds = this.filteredAds.filter(
            (ad: any) => ad !== this.selectedAd
          );
          this.setPagedAds(); // Update paged ads after deletion
          this.adDialog = false;

          this.messages = [
            {
              severity: 'success',
              summary: 'Succès',
              detail: 'Annonce supprimée avec succès',
            },
          ];

          setTimeout(() => {
            this.messages = [];
          }, 2000);
        });
    }
  }
  get visiblePages(): number[] {
    const totalPages = this.pages;
    const pageCount = totalPages.length;

    if (pageCount <= 5) {
      return totalPages; // Show all pages if there are 5 or fewer
    }

    const currentPage = this.currentPage;
    const range = 2; // Number of pages to show before and after the current page
    let start = Math.max(currentPage - range, 1);
    let end = Math.min(currentPage + range, pageCount);

    if (end - start < 2 * range) {
      start = Math.max(end - 2 * range, 1);
    }

    return totalPages.slice(start - 1, end);
  }

  get isLastPageVisible(): boolean {
    return this.pages.includes(this.pages.length);
  }

  filterByStatus(event: any) {
    const selectedValue = event.value.value;
    this.selectedStatus = this.statusOptions.find(
      (option) => option.value === selectedValue
    );
    this.applyFilter();
  }

  onStatusChange(event: any) {
    const selectedValue = event.target.value;
    this.selectedStatus = this.statusOptions.find(
      (option) => option.value === selectedValue
    );
    this.applyFilter();
  }

  applyFilter() {
    // Start by filtering based on status
    if (this.selectedStatus.value === 'all') {
      this.filteredAds = this.ads;
    } else {
      this.filteredAds = this.ads.filter(
        (ad: { validation_status: string }) =>
          ad.validation_status === this.selectedStatus.value
      );
    }

    // Further filter the results based on the search term
    if (this.searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      this.filteredAds = this.filteredAds.filter(
        (ad: { title: string; description: string }) =>
          ad.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          ad.description.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.setPagedAds(); // Update paged ads after filtering
  }

  setCurrentPage(page: number) {
    this.currentPage = page;
    this.setPagedAds();
  }

  get pages(): number[] {
    const pageCount = Math.ceil(this.filteredAds.length / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  setPagedAds() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.firstelement = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://medias.onemakan.com/' +
        this.filteredAds[0].c_v.path +
        this.filteredAds[0].c_v.filename +
        '.' +
        this.filteredAds[0].c_v.extension
    );
    this.pagedAds = this.filteredAds.slice(startIndex, endIndex);
  }
  toggleSelection(index: number, type: string): void {
    const jobAppliance = this.pagedAds[index];

    if (type === 'selected') {
      jobAppliance.isSelected = true; // Selected
    } else if (type === 'notSelected') {
      jobAppliance.isSelected = false; // Not Selected
    }

    // Call the service to update the status
    this.updateStatus(jobAppliance.id, jobAppliance.isSelected);
  }

  // Method to call the service to update status
  updateStatus(jobApplianceId: number, isSelected: boolean): void {
    const accessToken = localStorage.getItem('loggedInUserToken');

    this.annonceService
      .updateJobApplianceStatus(jobApplianceId, isSelected, accessToken!)
      .subscribe(
        (response) => {
          console.log('Status updated successfully:', response);
        },
        (error) => {
          console.error('Error updating status:', error);
        }
      );
  }

  pagedCategories: any[] = [];

  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }
}
