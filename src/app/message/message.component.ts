import { Component, HostListener, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { AnnonceService } from '../annonce.service';
import { Console } from 'node:console';
import { Observable } from 'rxjs';
import { SettingService } from '../setting.service';
import { CategoryService } from '../category.service';
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  messages: any[] = [];
  conversations: any[] = [];
  newMessage: string = '';
  conversationId: number | undefined;
  senderId: number | undefined;
  errorMessage: string | undefined;
  ad_id: string | null = null;
  ad_conversation: any;
  showMore: boolean = false;
  shortDescription: string = '';
  longDescription: string = '';
  transformedField:
    | { value: string; label: any; setting: string }[]
    | undefined;
  filteredConversations: any[] = [];
  user_conversation: any;
  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private userService: UserService,
    private annonceService: AnnonceService,
    private settingService: SettingService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.checkMobileView();
    this.senderId = Number(this.getFromLocalStorage('loggedInUserId'));
    this.route.paramMap.subscribe((params) => {
      this.ad_id = params.get('ad_id');
      if (this.ad_id) {
        this.initializeChat();
      } else {
        console.error('ad_id is null');
      }
    });
    this.getConversationsByUser();
  }
  toggleShowMore() {
    this.showMore = !this.showMore;
  }
  
  private initializeChat(): void {
    const userId = this.getFromLocalStorage('loggedInUserId');
    const accessToken = this.getFromLocalStorage('loggedInUserToken');
    if (userId && accessToken) {
      this.chatService
        .createConversation(Number(this.ad_id), Number(userId), accessToken)
        .subscribe(
          (dataChat: any) => {
            if (dataChat.status === 'Success') {
              this.getConversationsByUser();
            }
          },
          (error) => {
            console.error('Error creating conversation', error);
          }
        );
    } else {
      console.error('User ID or access token is not found in localStorage');
    }
  }

  formatDate(dateString: string): string {
    const months = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    const date = new Date(dateString);
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  }
  activeConversation: any; // Property to keep track of the active conversation

  private getConversationsByUser(): void {
    const accessToken = this.getFromLocalStorage('loggedInUserToken');
    const userId = this.getFromLocalStorage('loggedInUserId');
    if (accessToken && userId) {
      this.userService
        .getConversationsByUser(Number(userId), accessToken)
        .subscribe(
          (dataConversations) => {
            this.conversations = dataConversations.data;
            this.filteredConversations = this.conversations;
            console.log('filteredConversations', this.filteredConversations);
            this.conversations.forEach((dataConversation) => {
              this.loadAdDataAndMessages(dataConversation);
              if (dataConversation.ad.id == this.ad_id) {
                this.ad_conversation = dataConversation;
                console.log('ad_conversation', dataConversation);
                this.fetchMessages(dataConversation.id);
                this.activeConversation = this.ad_conversation; // Set the clicked conversation as active

                const maxLength = 100; // Set your desired max length for short description
                if (this.ad_conversation?.ad?.description) {
                  if (this.ad_conversation.ad.description.length > maxLength) {
                    this.shortDescription =
                      this.ad_conversation.ad.description.slice(0, maxLength);
                    this.longDescription =
                      this.ad_conversation.ad.description.slice(0);
                  } else {
                    this.shortDescription = this.ad_conversation.ad.description;
                  }
                }
                this.annonceService
                  .getAdById(this.ad_conversation?.ad?.id)
                  .subscribe((data) => {
                    //this.adDetail = data.data;
                    this.categoryService
                      .getCategoryById(data.data.category_id)
                      .subscribe((category) => {
                        const modelFields = category.data.model_fields;
                        const queryParams = { model: category.data.model };
                 console.log("modelfilds",modelFields);
                        this.settingService
                          .getSettings(accessToken!, queryParams)
                          .subscribe(
                            (setting) => {
                              if (setting.data) {
                                // Transform modelFields into transformedFields with initial structure
                                const transformedFields = Object.keys(modelFields).map(
                                  (key) => ({
                                    value: key,
                                    label: modelFields[key].label,
                                    setting: key, // Initialize setting with key, you'll update this later
                                    type: modelFields[key].type,
                                    options: modelFields[key].options,
                                    dependant : modelFields[key].dependant
                                  })
                                );
                                transformedFields.forEach((field) => {
                                  // Check if options are defined and type is 'select'
                                  // Check if options are defined and type is 'select'
                                  if (modelFields[field.value].route) {
                                    const fieldValue =
                                      data.data.additional[field.value];
                                    // Perform the service call with the appropriate route and accessToken
                                    this.settingService
                                      .createMarque(
                                        modelFields[field.value].route,
                                        accessToken!
                                      )
                                      .subscribe((response) => {
                                        // Extract the relevant categories
                                        const marquesPopulaires =
                                          response.data['Marques populaires'];
                                        const autresMarques =
                                          response.data['Autres marques'];
        
                                        // Convert objects to arrays
                                        const marquesPopulairesArray = Object.entries(
                                          marquesPopulaires
                                        ).map(([key, value]) => ({
                                          id: key,
                                          name: value,
                                        }));
                                        const autresMarquesArray = Object.entries(
                                          autresMarques
                                        ).map(([key, value]) => ({
                                          id: key,
                                          name: value,
                                        }));
        
                                        // Combine arrays if needed
                                        const allMarquesArray = [
                                          ...marquesPopulairesArray,
                                          ...autresMarquesArray,
                                        ];
        
                                        // Filter the array to find the item with the specified ID
                                        const filteredResponse = allMarquesArray.filter(
                                          (item: { id: string }) =>
                                            item.id === String(fieldValue)
                                        );
        
                                        // Handle the filtered response
                                        if (filteredResponse.length > 0) {
                                          field.setting =
                                            filteredResponse[0].name!.toString();
                                        }
                                      });
                                  } else if (
                                    !modelFields[field.value].options &&
                                    modelFields[field.value].type === 'select' &&
                                    !modelFields[field.value].dependant
                                  ) {
                                    // Apply the logic for 'get setting'
                                    const matchedSetting = setting.data.find(
                                      (settingItem: { name: string }) =>
                                        settingItem.name === field.value
                                    );
        
                                    if (matchedSetting) {
                                      if (
                                        data.data.additional &&
                                        data.data.additional[field.value]
                                      ) {
                                        field.setting =
                                          matchedSetting.content[
                                            data.data.additional[field.value]
                                          ];
                                      } else {
                                        console.error(
                                          `No additional data found for key '${field.value}'`
                                        );
                                      }
                                    } else {
                                      console.error(
                                        `No setting found for key '${field.value}'`,
                                        field,
                                        modelFields
                                      );
                                    }
                                  } else if (
                                    modelFields[field.value].type === 'number' ||
                                    modelFields[field.value].type === 'text' ||
                                    modelFields[field.value].type === 'date' ||
                                    modelFields[field.value].type === 'int'
                                  ) {
                                    field.setting = data.data.additional[field.value];
                                  } else if (
                                    modelFields[field.value].options &&
                                    modelFields[field.value].type !== 'bool'
                                  ) {
                                    field.setting =
                                      modelFields[field.value].options[
                                        data.data.additional[field.value]
                                      ];
                                    console.error(
                                      `No setting found for key '${field.value}'`,
                                      field,
                                      modelFields
                                    );
                                    // Apply the logic when options are not defined or type is not 'select'
                                  } else if (
                                    modelFields[field.value].type === 'multiple'
                                  ) {
                                    try {
                                      field.setting = JSON.parse(
                                        data.data.additional[field.value]
                                      );
                                    } catch (error) {
                                      console.error('Error parsing JSON:', error);
                                    }
                                  }else if (
                                    modelFields[field.value].type === 'bool' && modelFields[field.value].conditions
                                  ) {
                                    field.setting = data.data.additional[field.value]=== 1
                                    ? 'Oui'
                                    : 'Non';
                                  } else if (modelFields[field.value].dependant){
                                const model = modelFields[field.value].dependant ;
                                    console.log("depent",modelFields[field.value],data.data.additional[model],modelFields[model],transformedFields)
                                    const matchedSetting = setting.data.find(
                                      (settingItem: { name: string }) =>
                                        settingItem.name === field.value
                                    );
         console.log("matchi",matchedSetting, matchedSetting.content[data.data.additional[model]],)
                                    if (matchedSetting) {
                                      if (
                                        data.data.additional &&
                                        data.data.additional[field.value]
                                      ) {
                                        const test = matchedSetting.content[data.data.additional[model]];
                                        field.setting =
                                          test[
        
                                            data.data.additional[field.value]
                                          ];
                                          console.log("matchitttt",field.setting,test)
         
                                      } else {
                                        console.error(
                                          `No additional data found for key '${model}'`
                                        );
                                      }
                                    } else {
                                      console.error(
                                        `No setting found for key '${field.value}'`,
                                        field,
                                        modelFields
                                      );
                                    }
                                  
                                  }
                                });
        
                                this.transformedField = transformedFields.filter(
                                  (fild) => fild.value !== 'need_cv'
                                );
                              } else {
                                console.error('No data found in settings.');
                              }
                            },
                            (error) => {
                              console.error('Error fetching settings:', error);
                            }
                          );
                      });
        
                    console.log('datarrr', data);
                  });

                this.userService
                  .getUserInfoById(this.ad_conversation.ad.user_id, accessToken)
                  .subscribe((AdConversation) => {
                    this.user_conversation = this.formatDate(
                      AdConversation.data.created_at
                    );
                    console.log('user_conversation', this.user_conversation);
                  });
              }
            });
          },
          (error) => {
            this.errorMessage = 'Failed to load conversations';
            console.error(error);
          }
        );
    } else {
      console.error('User ID or access token is not found in localStorage');
    }
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredConversations = this.conversations.filter((conversation) => {
      const title = conversation.ad.title.toLowerCase();
      const city = conversation.ad.city.toLowerCase();
      const price = conversation.ad.price.toLowerCase();
      return (
        title.includes(searchTerm) ||
        city.includes(searchTerm) ||
        price.includes(searchTerm)
      );
    });
  }
  private loadAdDataAndMessages(dataConversation: {
    id: number;
    ad: any;
  }): void {
    this.annonceService.getAdById(dataConversation.ad.id).subscribe(
      (data) => {
        dataConversation.ad = data.data;
      },
      (error) => {
        this.errorMessage = 'Failed to load ad details';
        console.error(error);
      }
    );
  }
  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }
  private fetchMessages(conversationId: number): void {
    const accessToken = this.getFromLocalStorage('loggedInUserToken');
    if (accessToken) {
      this.chatService.getMessages(conversationId, accessToken).subscribe(
        (data) => {
          this.messages = data.data.sort(
            (a: any, b: any) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          this.conversationId = conversationId;
          console.log('messages', this.messages);
        },
        (error) => {
          this.errorMessage = 'Failed to load messages';
          console.error(error);
        }
      );
    } else {
      console.error('Access token is not found in localStorage');
    }
  }
  isMobileView: boolean = false;
  showMenu: boolean = true;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkMobileView();
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
  }

  onConversationClick(conversation: any): void {
    this.ad_id = conversation;

    const accessToken = this.getFromLocalStorage('loggedInUserToken');
    this.ad_conversation = conversation;
    this.activeConversation = conversation; // Set the clicked conversation as active
    const maxLength = 100; // Set your desired max length for short description
    if (this.ad_conversation?.ad?.description) {
      if (this.ad_conversation.ad.description.length > maxLength) {
        this.shortDescription = this.ad_conversation.ad.description.slice(0, maxLength);
        this.longDescription = this.ad_conversation.ad.description.slice(0);
      } else {
        this.shortDescription = this.ad_conversation.ad.description;
      }
    }

    this.annonceService.getAdById(this.ad_conversation?.ad?.id).subscribe((data) => {
      this.categoryService.getCategoryById(data.data.category_id).subscribe((category) => {
        const modelFields = category.data.model_fields;
        const queryParams = { model: category.data.model };

        this.settingService.getSettings(accessToken!, queryParams).subscribe(
          (setting) => {
            if (setting.data) {
              const transformedFields = Object.keys(modelFields).map((key) => ({
                value: key,
                label: modelFields[key].label,
                setting: key,
              }));

              transformedFields.forEach((field) => {
                const matchedSetting = setting.data.find((settingItem: { name: string }) => settingItem.name === field.value);
                if (matchedSetting) {
                  if (data.data.additional && data.data.additional[field.value]) {
                    field.setting = matchedSetting.content[data.data.additional[field.value]];
                  } else {
                    console.error(`No setting found for key '${field.value}' in data.data.additional`);
                  }
                }
              });
              this.transformedField = transformedFields;
            } else {
              console.error('No data found in settings.');
            }
          },
          (error) => {
            console.error('Error fetching settings:', error);
          }
        );
      });
    });

    this.fetchMessages(conversation.id);

    // Hide menu and show chat for mobile view
    if (this.isMobileView) {
      this.showMenu = false;
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }



  sendMessage(): void {
    const accessToken = this.getFromLocalStorage('loggedInUserToken');
    const userId = this.getFromLocalStorage('loggedInUserId');
    if (accessToken && userId) {
      if (this.newMessage.trim()) {
        this.chatService
          .sendMessage(
            Number(this.conversationId),
            Number(userId),
            this.newMessage,
            accessToken
          )
          .subscribe(
            (response) => {
              this.fetchMessages(Number(this.conversationId));
              this.newMessage = '';
            },
            (error) => {
              this.errorMessage = 'Failed to send message';
              console.error(error);
            }
          );
      }
    } else {
      console.error('User ID or access token is not found in localStorage');
    }
  }

  private getFromLocalStorage(key: string): string | null {
    return typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(key)
      : null;
  }
}
