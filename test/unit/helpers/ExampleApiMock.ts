import { ExampleApi } from "../../../src/client/api";
import type { CheckoutFormData, CartState } from "../../../src/common/types";

import data from "./data";

export const basename = "/hw/store";

class ExampleApiMock extends ExampleApi {
  constructor(basename: string) {
    super(basename);
  }

  async getProducts(): Promise<any> {
    const products = data.getAllProducts();
    return Promise.resolve({ data: products });
  }

  async getProductById(id: number): Promise<any> {
    if (process.env.BUG_ID === "3") {
      id = 0;
    }
    const product = data.getProductById(id);
    return { data: product };
  }

  async checkout(form: CheckoutFormData, cart: CartState): Promise<any> {
    let id: string | number = Object.keys(cart)[0];

    if (process.env.BUG_ID === "2") {
      id = Date.now();
    }
    return { data: { id } };
  }
}

const api = new ExampleApiMock(basename);
export default api;
