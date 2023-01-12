import { parserOutput } from '16ttac-sim';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CodeService {
  constructor() {}

  getSourceCodeIndexRangeForAddress(
    address: number,
    parserOutput?: parserOutput
  ): [number, number] | null {
    if (!parserOutput) return null;

    const found = [
      ...parserOutput.instructions,
      ...parserOutput.variables,
    ].find((v) => address >= v.address && address < v.address + v.size);

    if (!found) return null;

    return [found.sourceStart, found.sourceEnd];
  }

  getAddressForSourceCodeIndex(
    index: number,
    parserOutput?: parserOutput
  ): number | null {
    if (!parserOutput) return null;

    const found = [
      ...parserOutput.instructions,
      ...parserOutput.variables,
      ...parserOutput.labels,
    ].find((v) => index >= v.sourceStart && index < v.sourceEnd);

    if (!found) return null;

    return found.address;
  }
}
