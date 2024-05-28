import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { AnnonceService } from '../annonce.service';
import { Console } from 'node:console';
import { Observable } from 'rxjs';
import { SettingService } from '../setting.service';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: [
    './chat.component.css',
    '../../assets/libs/owl.carousel/assets/owl.carousel.min.css',
    '../../assets/libs/owl.carousel/assets/owl.theme.default.min.css',
    '../../assets/css/bootstrap.min.css',
  ],
})
export class ChatComponent implements OnInit {
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

                        this.settingService
                          .getSettings(accessToken!, queryParams)
                          .subscribe(
                            (setting) => {
                              if (setting.data) {
                                const transformedFields = Object.keys(
                                  modelFields
                                ).map((key) => ({
                                  value: key,
                                  label: modelFields[key].label,
                                  setting: key,
                                }));

                                transformedFields.forEach(
                                  (field: {
                                    value: string;
                                    label: any;
                                    setting: string;
                                  }) => {
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
                                        console.log('jj', field.setting);
                                        console.log(
                                          'Transformed f',
                                          matchedSetting
                                        );
                                      } else {
                                        console.error(
                                          `No setting found for key '${field.value}' in data.data.additional`
                                        );
                                      }
                                    }
                                  }
                                );
                                this.transformedField = transformedFields;
                                console.log(
                                  'Transformed fields with updated labels:',
                                  transformedFields
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

  onConversationClick(conversation: any): void {
    this.ad_id = conversation;
    const accessToken = this.getFromLocalStorage('loggedInUserToken');
    this.ad_conversation = conversation;
    this.activeConversation = conversation; // Set the clicked conversation as active
    const maxLength = 100; // Set your desired max length for short description
    if (this.ad_conversation?.ad?.description) {
      if (this.ad_conversation.ad.description.length > maxLength) {
        this.shortDescription = this.ad_conversation.ad.description.slice(
          0,
          maxLength
        );
        this.longDescription = this.ad_conversation.ad.description.slice(0);
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

            this.settingService
              .getSettings(accessToken!, queryParams)
              .subscribe(
                (setting) => {
                  if (setting.data) {
                    const transformedFields = Object.keys(modelFields).map(
                      (key) => ({
                        value: key,
                        label: modelFields[key].label,
                        setting: key,
                      })
                    );

                    transformedFields.forEach(
                      (field: {
                        value: string;
                        label: any;
                        setting: string;
                      }) => {
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
                            console.log('jj', field.setting);
                            console.log('Transformed f', matchedSetting);
                          } else {
                            console.error(
                              `No setting found for key '${field.value}' in data.data.additional`
                            );
                          }
                        }
                      }
                    );
                    this.transformedField = transformedFields;
                    console.log(
                      'Transformed fields with updated labels:',
                      transformedFields
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

    this.fetchMessages(conversation.id);
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
