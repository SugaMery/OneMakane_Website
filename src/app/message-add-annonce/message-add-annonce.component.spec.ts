import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageAddAnnonceComponent } from './message-add-annonce.component';

describe('MessageAddAnnonceComponent', () => {
  let component: MessageAddAnnonceComponent;
  let fixture: ComponentFixture<MessageAddAnnonceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessageAddAnnonceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageAddAnnonceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
