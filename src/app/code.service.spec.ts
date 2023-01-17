import { Parser } from '16ttac-sim';
import { TestBed } from '@angular/core/testing';

import { CodeService } from './code.service';

describe('CodeService', () => {
  let service: CodeService;

  const parser = new Parser();

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get source code index range for address', () => {
    expect(
      service.getSourceCodeIndexRangeForAddress(
        0,
        parser.parse(`NULL=>ACC ACC => PUSH`)
      )
    ).toEqual([0, 9]);
    expect(
      service.getSourceCodeIndexRangeForAddress(
        1,
        parser.parse(`NULL=>ACC ACC => PUSH`)
      )
    ).toEqual([10, 21]);
  });

  it('should get address for source code index', () => {
    expect(
      service.getAddressForSourceCodeIndex(
        10,
        parser.parse(`NULL=>ACC ACC => PUSH`)
      )
    ).toBe(1);
    expect(
      service.getAddressForSourceCodeIndex(
        20,
        parser.parse(`NULL=>ACC ACC => PUSH`)
      )
    ).toBe(1);
    expect(
      service.getAddressForSourceCodeIndex(
        5,
        parser.parse(`NULL=>ACC ACC => PUSH`)
      )
    ).toBe(0);
  });
});
