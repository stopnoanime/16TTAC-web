import { parserOutput } from '16ttac-sim';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CodeService {
  constructor() {}

  /**
   * Searches for parser token with matching address and if found returns it's position in source code as `[startIndx, endIndx]`
   * @param address The address to search for
   * @param parserOutput The Parser output to search in
   * @returns The found range or null
   */
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

  /**
   * Searches for parser token at index in source code and if found returns it's address
   * @param index The index(position) that the token is located at
   * @param parserOutput The Parser output to search in
   * @returns The found address or null
   */
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
