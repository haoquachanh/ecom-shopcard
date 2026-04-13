import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ProductTypesService } from './product-types.service';

@ApiTags('Product Types')
@Public()
@Controller('product-types')
export class ProductTypesController {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get active product types' })
  findAll() {
    return this.productTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product type detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productTypesService.findOne(id);
  }
}
