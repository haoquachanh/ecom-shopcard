import { productTypesService } from './products.service';

export const categoriesService = {
  getAll: productTypesService.getAll,
  getOne: productTypesService.getOne,
};
