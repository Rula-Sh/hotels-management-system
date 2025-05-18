import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoomOrHallComponent } from './add-room-or-hall.component';

describe('AddRoomOrHallComponent', () => {
  let component: AddRoomOrHallComponent;
  let fixture: ComponentFixture<AddRoomOrHallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRoomOrHallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRoomOrHallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
