import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionAdsComponent } from './option-ads.component';

describe('OptionAdsComponent', () => {
  let component: OptionAdsComponent;
  let fixture: ComponentFixture<OptionAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptionAdsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OptionAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
