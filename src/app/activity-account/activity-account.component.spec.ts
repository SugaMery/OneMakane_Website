import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityAccountComponent } from './activity-account.component';

describe('ActivityAccountComponent', () => {
  let component: ActivityAccountComponent;
  let fixture: ComponentFixture<ActivityAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
