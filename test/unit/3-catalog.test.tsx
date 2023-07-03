import { render, screen, waitFor, getNodeText } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";
import application, { history } from "./helpers/Application";
import store from "./helpers/store";
import cart from "./helpers/CartMock";
import api from "./helpers/ExampleApiMock";
import { Product } from "../../src/common/types";

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

  it("если товар уже добавлен в корзину, в каталоге и на странице товара должно отображаться сообщение об этом (рядом с товаром появится надпись Item in cart", async function () {
    const { container } = render(application);
    history.push("/catalog");

    // ждем отображения первого элемента в каталоге
    await waitFor(() => {
      // HTML элемента в каталоге
      // <div data-testid="0" class="ProductItem card w-100 mb-4">
      // data-testid="0" несколько но они все привязаны к одному товару
      // getByTestId вернет исключение потому что data-testid больше чем 1
      // поэтому использзую getAllByTestId
      const elements = screen.getAllByTestId("0");
      expect(elements[0]).toBeVisible();
    });
    const state = store.getState();

    // заказываем продукт
    // я не использую нажатие на кнопуку добавить в корзину для того чтобы было меньше кода
    // заказ по кнопке будет в сделующем тесте
    const { data: product } = await api.getProductById(0);
    store.dispatch({ type: "ADD_TO_CART", product });

    // BUG_ID 7 test
    await waitFor(() => {
      const itemInCart = container.querySelector(
        `.ProductItem[data-testid="0"] .CartBadge`
      );
      expect(
        itemInCart !== null && itemInCart.innerHTML === "Item in cart"
      ).toBe(true);
      expect(itemInCart).toBeVisible();
    });

    await waitFor(() => {
      const cartLink = screen.getByText("Cart (1)");

      expect(cartLink).toBeVisible();
    });

    // переходим на страницу товара
    history.push("/catalog/0");

    // ожидаем Item in cart на странице товара
    await waitFor(() => {
      const productDetailsBadge = screen.getByText("Item in cart");

      expect(productDetailsBadge).toBeVisible();
    });
  });

  it("если товар уже добавлен в корзину, повторное нажатие кнопки добавить в корзину должно увеличивать его количество", async function () {
    const { container } = render(application);

    // загружаем товары
    store.dispatch({ type: "PRODUCTS_LOAD" });

    // переходим на страницу товара
    history.push("/catalog/0");

    // дожидаемся загрузки страницы с деталями
    await waitFor(() => {
      const details = container.querySelector(".ProductDetails");
      expect(details).toBeVisible();
    });

    // жмем кнопку добавить в корзину
    const checkoutButton: HTMLButtonElement = container.querySelector(
      ".ProductDetails-AddToCart"
    );
    userEvent.click(checkoutButton);

    // ожидаем Item in cart на странице товара
    // BUG_ID 7 вызовет исключения
    await waitFor(() => {
      const productDetailsBadge = screen.getByText("Item in cart");
      expect(productDetailsBadge).toBeVisible();
    });

    const state = store.getState();

    const product = state.products[0];

    // в корзине должен быть наш заказанный товар
    // BUG_ID === 1 имя товара не должно быть undefined
    expect(state.cart).toMatchObject({
      "0": {
        name: product.name,
        count: 1,
        price: product.price,
      },
    });

    userEvent.click(checkoutButton);

    // в корзине должно быть заказано 2 продукта одного наименования
    await waitFor(() => {
      const state = store.getState();

      expect(state.cart[0].count === 2).toBe(true);
    });

    // заказываем еще 2 товара разных товара
    for (let i = 1; i < 3; i++) {
      const {data: product} = await api.getProductById(i)
      store.dispatch({
        type: "ADD_TO_CART",
        product,
      });
    }

    history.push("/cart");
    screen.logTestingPlaygroundURL()

    // Ожидаем что в шапке будет Cart (3) BUG_ID=3
    await waitFor(() => {
      const cartLink = screen.getByText("Cart (3)");

      expect(cartLink).toBeVisible();
    });
  });

  it("содержимое корзины должно сохраняться между перезагрузками страницы", async () => {
    render(application);

    // продукт который заказываем
    const { data: product } = await api.getProductById(0);
    store.dispatch({ type: "ADD_TO_CART", product });
    const state = store.getState();

    // cart.getState() возвращает данные из localstorage
    // (BUG_ID 6 не добавляет данные в localstorage)
    expect(state.cart).toEqual(cart.getState());
  });

  // упрощенный тест проверки добавления товара в корзину (просто как пример)
  // it("тест добавления товара в корзину", async function () {
  //   render(application);

  //   // покупаем продукт
  //   const {data: product} = await api.getProductById(0);
  //   store.dispatch({ type: "ADD_TO_CART", product });

  //   const state = store.getState();

  //   // BUG_ID = 7 если баг активен товары не добавляются в корзину
  //   expect(state.cart).toEqual({
  //     [product.id]: { name: product.name, count: 1, price: product.price },
  //   });
  // });
});
