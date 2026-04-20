import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SamplesService } from './samples.service';
import { samplesQuerySchema, SamplesQueryInput } from './samples.schemas';

@ApiTags('Samples')
@Public()
@Controller('samples')
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Get()
  @ApiOperation({ summary: 'Get samples by product type' })
  @ApiQuery({ name: 'product_type_id', required: false, type: Number })
  findAll(
    @Query(new ZodValidationPipe(samplesQuerySchema))
    query: SamplesQueryInput,
  ) {
    return this.samplesService.findAll(query.product_type_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sample detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.samplesService.findOne(id);
  }
}
