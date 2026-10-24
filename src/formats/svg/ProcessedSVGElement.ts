import type { Point } from '../../models/Point';
import type { SVGElementType } from './SVGElementType';

/** One SVG subpath flattened into planar points. */
export interface ProcessedSVGElement {
  type: SVGElementType;
  points: Point[];
  isClosed: boolean;
}
