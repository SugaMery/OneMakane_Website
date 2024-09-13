import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentFaildComponent } from './payment-faild.component';

describe('PaymentFaildComponent', () => {
  let component: PaymentFaildComponent;
  let fixture: ComponentFixture<PaymentFaildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentFaildComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentFaildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
