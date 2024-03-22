import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopProductFullComponent } from './shop-product-full.component';

describe('ShopProductFullComponent', () => {
  let component: ShopProductFullComponent;
  let fixture: ComponentFixture<ShopProductFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShopProductFullComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShopProductFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
