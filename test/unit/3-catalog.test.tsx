import { render, screen, waitFor, getNodeText } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import application, { history } from "./helpers/Application";
import store from "./helpers/store";
import cart from "./helpers/CartMock";

describe("Каталог", function () {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "";
    store.dispatch({ type: "CLEAR_CART" });
  });
  afterEach(() => {
    localStorage.clear();
    document.cookie = "";
    store.dispatch({ type: "CLEAR_CART" });
  });
  it("для каждого товара в каталоге отображается название, цена и ссылка на страницу с подробной информацией о товаре", async function () {
    const { container } = render(application);

    history.push("/catalog");

    await waitFor(() => {
      const elements = screen.getAllByTestId("0");
      expect(elements.length).toBeGreaterThan(0);
    });

    const { products } = store.getState();

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      const name = container.querySelector(
        `.ProductItem[data-testid="${product.id}"] .ProductItem-Name`
      );
      // имя должно быть не пустой строкой BUG_ID 1
      expect(
        product.name !== undefined &&
          name.innerHTML.length > 0 &&
          name.innerHTML == product.name
      ).toBe(true);

      const price = container.querySelector(
        `.ProductItem[data-testid="${product.id}"] .ProductItem-Price`
      );

      expect(price !== null).toBe(true);
      // Цена должно быть строкой формат $число
      // expect(typeof price === "string" && name.trim()).toMatch(/\$[0-9]+/);
      const link = container.querySelector(
        `.ProductItem[data-testid="${product.id}"] .ProductItem-DetailsLink`
      );
      expect(link !== null).toBe(true);
    }
  });

  it("на странице с подробной информацией отображаются: название товара, его описание, цена, цвет, материал и кнопка добавить в корзину", async function () {
    localStorage.clear();

    const { container } = render(application);

    history.push("/catalog");

    await waitFor(() => {
      const elements = screen.getAllByTestId("0");
      expect(elements.length).toBeGreaterThan(0);
    });

    const { products } = store.getState();

    expect(products.length > 0).toBe(true);
    history.push("/catalog/0");

    await waitFor(() => {
      // ProductDetails
      const element = container.querySelector(".ProductDetails");
      expect(element).toBeInTheDocument();
    });

    const elements = [
      `.ProductDetails-Name`, //название товара, ProductDetails-Name
      `.ProductDetails-Description`, // его описание, ProductDetails-Description
      `.ProductDetails-Price`, // цена, ProductDetails-Price
      `.ProductDetails-Color`, // цвет, ProductDetails-Color
      `.ProductDetails-Material`, // материал и ProductDetails-Material
    ];

    for (const element of elements) {
      expect(element !== null).toBe(true);
    }

    // кнопка добавить в корзину
    const btnProductDetails = container.querySelector(
      ".ProductDetails-AddToCart.btn.btn-primary"
    );

    // test BUG9
    expect(btnProductDetails.classList.contains("btn-lg")).toEqual(true);
  });

  it("если товар уже добавлен в корзину, в каталоге и на странице товара должно отображаться сообщение об этом (рядом с товаром появится надпись Item in cart", async function () {});
  it("если товар уже добавлен в корзину, повторное нажатие кнопки добавить в корзину должно увеличивать его количество", async function () {});

  // Можно добавить обработку нажатия кнопок

  it("содержимое корзины должно сохраняться между перезагрузками страницы", () => {
    localStorage.clear();

    render(application);

    // продукт который заказываем
    const product = {
      id: 1,
      name: "Product",
      price: 10,
      description: "test description",
      material: "test material",
      color: "test color",
    };

    render(application);
    store.dispatch({ type: "ADD_TO_CART", product });

    const state = store.getState();

    // cart.getState() возвращает данные из localstorage (BUG_ID 6 не добавляет данные в localstorage)
    expect(state.cart).toEqual(cart.getState());
    store.dispatch({ type: "CLEAR_CART" });
  });

  it("тест добавления товара в корзину", async function () {
    render(application);

    let state = store.getState();

    // продукт который заказываем
    const product = {
      id: 1,
      name: "Product",
      price: 10,
      description: "test description",
      material: "test material",
      color: "test color",
    };

    render(application);
    store.dispatch({ type: "ADD_TO_CART", product });

    state = store.getState();

    // BUG_ID = 7 если баг активен данные не добавляются в тесты
    expect(state.cart).toEqual({
      "1": { name: "Product", count: 1, price: 10 },
    });
    store.dispatch({ type: "CLEAR_CART" });
  });
});
