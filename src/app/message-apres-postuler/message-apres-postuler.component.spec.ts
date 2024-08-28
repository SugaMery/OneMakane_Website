import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageApresPostulerComponent } from './message-apres-postuler.component';

describe('MessageApresPostulerComponent', () => {
  let component: MessageApresPostulerComponent;
  let fixture: ComponentFixture<MessageApresPostulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessageApresPostulerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageApresPostulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
