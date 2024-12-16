import { Injectable } from "@nestjs/common";
import { AddShopDto } from "./add-shop.dto";

@Injectable()
export class ShopService {
  private shops = {} as {
    [id: string]: { id: string; name: string; commissionC: string };
  };
  private idCounter = 1;

  addShop(shop: AddShopDto) {
    const newShop = { id: this.idCounter.toString(), ...shop };
    this.shops[newShop.id] = newShop;
    this.idCounter++;
    return newShop;
  }

  getShop(shopId: string) {
    return this.shops[shopId];
  }
}
