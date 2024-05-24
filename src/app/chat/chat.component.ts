import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { AnnonceService } from '../annonce.service';

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

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private userService: UserService,
    private annonceService: AnnonceService
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

  private getConversationsByUser(): void {
    const accessToken = this.getFromLocalStorage('loggedInUserToken');
    const userId = this.getFromLocalStorage('loggedInUserId');
    if (accessToken && userId) {
      this.userService
        .getConversationsByUser(Number(userId), accessToken)
        .subscribe(
          (dataConversations) => {
            this.conversations = dataConversations.data;
            this.conversations.forEach((dataConversation) => {
              this.loadAdDataAndMessages(dataConversation);
              if (dataConversation.ad.id == this.ad_id) {
                this.fetchMessages(dataConversation.id);
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
