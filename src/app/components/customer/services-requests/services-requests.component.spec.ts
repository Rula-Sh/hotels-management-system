import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesRequestsComponent } from './services-requests.component';

describe('ServicesRequestsComponent', () => {
  let component: ServicesRequestsComponent;
  let fixture: ComponentFixture<ServicesRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
