import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsAndHallsComponent } from './rooms-and-halls.component';

describe('RoomsAndHallsComponent', () => {
  let component: RoomsAndHallsComponent;
  let fixture: ComponentFixture<RoomsAndHallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsAndHallsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomsAndHallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
