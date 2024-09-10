import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvsPreselectionesComponent } from './cvs-preselectiones.component';

describe('CvsPreselectionesComponent', () => {
  let component: CvsPreselectionesComponent;
  let fixture: ComponentFixture<CvsPreselectionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CvsPreselectionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CvsPreselectionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
