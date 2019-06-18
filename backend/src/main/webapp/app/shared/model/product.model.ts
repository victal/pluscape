import { ISize } from 'app/shared/model/size.model';
import { ICategory } from 'app/shared/model/category.model';

export interface IProduct {
  id?: number;
  name?: string;
  description?: string;
  currentPrice?: number;
  standardPrice?: number;
  link?: string;
  pictureContentType?: string;
  picture?: any;
  sizes?: ISize[];
  categories?: ICategory[];
}

export const defaultValue: Readonly<IProduct> = {};
