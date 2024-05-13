import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetPasswordMessageComponent } from './forget-password-message.component';

describe('ForgetPasswordMessageComponent', () => {
  let component: ForgetPasswordMessageComponent;
  let fixture: ComponentFixture<ForgetPasswordMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForgetPasswordMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ForgetPasswordMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
