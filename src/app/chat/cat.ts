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
  conversationId: number = 1; // Replace with actual conversation ID
  senderId: number = 43; // Replace with actual sender ID
  errorMessage: string | undefined;
  ad_id: string | null = null;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private userService: UserService,
    private annonceService: AnnonceService
  ) {}

  ngOnInit(): void {
    // this.initializeChat();
    this.getConversationsByUser();
    console.log('Fetched messages 2', this.messages);
  }

  private initializeChat(): void {
    const userId = this.getFromLocalStorage('loggedInUserId');
    if (userId) {
      this.chatService
        .createConversation(Number(this.ad_id), Number(userId))
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
      console.error('User ID is not found in localStorage');
    }
  }

  private getConversationsByUser(): void {
    const accessToken = this.getFromLocalStorage('loggedInUserToken');
    const userId = this.getFromLocalStorage('loggedInUserId');
    if (userId && accessToken) {
      this.userService
        .getConversationsByUser(Number(userId), accessToken)
        .subscribe(
          (dataConversations) => {
            this.conversations = dataConversations.data;
            this.conversations.forEach((dataConversation) => {
              this.loadAdDataAndMessages(dataConversation);
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
        console.log('dataConversation with ad', dataConversation);
        this.fetchMessages(dataConversation.id);
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
          console.log('Fetched messages', this.messages);
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

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService
        .sendMessage(this.conversationId, this.senderId, this.newMessage)
        .subscribe(
          (response) => {
            this.messages.push(response.data);
            this.newMessage = '';
          },
          (error) => {
            this.errorMessage = 'Failed to send message';
            console.error(error);
          }
        );
    }
  }

  private getFromLocalStorage(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  }
}
