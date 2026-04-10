import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { calculatePriceSchema, CalculatePriceInput } from './price.schemas';
import { PriceService } from './price.service';

@ApiTags('Price')
@Public()
@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate price from base_prices + quantity_tiers' })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'product_type_id',
        'sample_id',
        'material_id',
        'size_id',
        'side_id',
        'quantity',
      ],
      properties: {
        product_type_id: { type: 'integer' },
        sample_id: { type: 'integer' },
        material_id: { type: 'integer' },
        size_id: { type: 'integer' },
        side_id: { type: 'integer' },
        effect_id: { type: 'integer', nullable: true },
        quantity: { type: 'integer', minimum: 1 },
      },
    },
  })
  calculate(
    @Body(new ZodValidationPipe(calculatePriceSchema))
    payload: CalculatePriceInput,
  ) {
    return this.priceService.calculate(payload);
  }
}
