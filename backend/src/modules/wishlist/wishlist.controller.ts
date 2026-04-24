import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestUser } from '../../common/interfaces/request-user.interface';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { addWishlistSchema, AddWishlistInput } from './wishlist.schemas';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  getWishlist(@CurrentUser() user: RequestUser) {
    return this.wishlistService.getWishlist(user);
  }

  @Post()
  @ApiOperation({ summary: 'Add product type to wishlist' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['product_type_id'],
      properties: {
        product_type_id: { type: 'integer' },
      },
    },
  })
  add(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(addWishlistSchema)) payload: AddWishlistInput,
  ) {
    return this.wishlistService.add(user, payload.product_type_id);
  }

  @Delete(':product_type_id')
  @ApiOperation({ summary: 'Remove product type from wishlist' })
  remove(
    @CurrentUser() user: RequestUser,
    @Param('product_type_id', ParseIntPipe) productTypeId: number,
  ) {
    return this.wishlistService.remove(user, productTypeId);
  }
}
