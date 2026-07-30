import { IsOptional, IsPositive, IsInt } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsPositive()
  @IsInt()
  limit?: number;

  get pageNumber(): number {
    return this.page ?? 1;
  }

  get pageSize(): number {
    return this.limit ?? 20;
  }

  get skip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}