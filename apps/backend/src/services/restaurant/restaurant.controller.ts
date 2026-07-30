import { BadRequestException, Controller, Get, Query, Param, Put, Body, UseGuards } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { UpdateBranchStatusDto } from './dto/update-branch-status.dto';
import { PaginationDto } from '../../shared/pagination/pagination.dto';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  async getAll(@Query() pagination: PaginationDto) {
    return this.restaurantService.getAllRestaurants(pagination);
  }

  @Get('search')
  async search(@Query('q') query: string, @Query() pagination: PaginationDto) {
    return this.restaurantService.searchRestaurants(query, pagination);
  }

  @Get('nearby')
  async getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (lat && lng && (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng))) {
      throw new BadRequestException('Invalid coordinates: lat and lng must be valid numbers');
    }

    if (lat && lng) {
      if (parsedLat < -90 || parsedLat > 90) {
        throw new BadRequestException('Invalid latitude: must be between -90 and 90');
      }
      if (parsedLng < -180 || parsedLng > 180) {
        throw new BadRequestException('Invalid longitude: must be between -180 and 180');
      }
    }

    return this.restaurantService.findNearby(
      parsedLat,
      parsedLng,
      radius ? Number(radius) : undefined,
      pagination,
    );
  }

  @Get(':slug')
  async getDetails(@Param('slug') slug: string) {
    return this.restaurantService.getRestaurantDetails(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @Put('branch/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateBranchStatusDto,
  ) {
    return this.restaurantService.updateBranchStatus(id, body.isOnline);
  }
}
