import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteVendorComponent } from './compte-vendor.component';

describe('CompteVendorComponent', () => {
  let component: CompteVendorComponent;
  let fixture: ComponentFixture<CompteVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompteVendorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompteVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
