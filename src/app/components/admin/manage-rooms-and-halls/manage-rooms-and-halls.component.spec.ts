import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoomsAndHallsComponent } from './manage-rooms-and-halls.component';

describe('ManageRoomsAndHallsComponent', () => {
  let component: ManageRoomsAndHallsComponent;
  let fixture: ComponentFixture<ManageRoomsAndHallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRoomsAndHallsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRoomsAndHallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
