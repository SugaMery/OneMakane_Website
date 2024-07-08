import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoisComponent } from './favois.component';

describe('FavoisComponent', () => {
  let component: FavoisComponent;
  let fixture: ComponentFixture<FavoisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FavoisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FavoisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
