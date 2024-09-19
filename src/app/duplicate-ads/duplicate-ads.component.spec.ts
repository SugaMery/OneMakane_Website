import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateAdsComponent } from './duplicate-ads.component';

describe('DuplicateAdsComponent', () => {
  let component: DuplicateAdsComponent;
  let fixture: ComponentFixture<DuplicateAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DuplicateAdsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DuplicateAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
