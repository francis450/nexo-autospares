import { PartSide, ProductItem } from '../types';

/** Price for one unit of the chosen side: the pair price when buying both sides. */
export const unitPriceFor = (product: ProductItem, side: PartSide): number =>
  side === 'pair' ? product.pairPrice ?? product.price * 2 : product.price;

export const sideLabel = (side: PartSide): string =>
  side === 'pair'
    ? 'Complete Pair (LH + RH)'
    : side === 'LH'
      ? 'Left Hand (Passenger)'
      : side === 'RH'
        ? 'Right Hand (Driver)'
        : 'Standard';
