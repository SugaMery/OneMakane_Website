import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostulerCvComponent } from './postuler-cv.component';

describe('PostulerCvComponent', () => {
  let component: PostulerCvComponent;
  let fixture: ComponentFixture<PostulerCvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostulerCvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostulerCvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
