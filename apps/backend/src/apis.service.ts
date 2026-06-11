import { Injectable } from '@nestjs/common';

export interface MenuResponse {
  menuId: string;
}

@Injectable()
export class ApisService {
  getMenu(menuId: string): MenuResponse {
    return { menuId };
  }
}
