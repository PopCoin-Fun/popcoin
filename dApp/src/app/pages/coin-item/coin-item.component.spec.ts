import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinItemComponent } from './coin-item.component';

describe('CoinItemComponent', () => {
  let component: CoinItemComponent;
  let fixture: ComponentFixture<CoinItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoinItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
