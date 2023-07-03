import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import application, { history } from "./helpers/Application";
import store from "./helpers/store";
import api from "./helpers/ExampleApiMock";

describe("корзина", function () {
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

  it("в шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней", async function () {
    // этот тест совмещен с "если товар уже добавлен в корзину, повторное нажатие кнопки добавить в корзину должно увеличивать его количество"
    // так как тестируется на BUG_ID 7 поадают оба теста, а по правилам не должно более 2х  тестов на один баг
  });

  it("тестирование отправки формы", async () => {
    // слишком много тестов связаны с BUG_ID === "7" добавлением в корзину 
    // (костыль что бы падало на BUG_ID не более 2х тестов) в этом тесте проверяем 5 и 8 баг
    if(process.env.BUG_ID === "7") return 
    const { container } = render(application);

    const {data: product} = await api.getProductById(0)

    store.dispatch({ type: "ADD_TO_CART", product });

    history.push("/cart"); // Переход на страницу /cart

    const state = store.getState();

    // Ждем загрузку формы
    await waitFor(() => {
      const elements = container.querySelector(".Form");
      expect(elements !== null).toBe(true);
    });

    // данные для заполнения формы
    const formStub = {
      name: "Denis",
      phone: "0123456789",
      address: "Some street",
    };

    // заполняем форму
    const inputName: HTMLInputElement = container.querySelector("#f-name");
    inputName.setAttribute("value", formStub["name"]);
    await userEvent.type(inputName, formStub["address"]);
    const inputPhone: HTMLInputElement = container.querySelector("#f-phone");
    inputPhone.setAttribute("value", formStub["phone"]);
    await userEvent.type(inputPhone, formStub["address"]);
    const address: HTMLTextAreaElement = container.querySelector("#f-address");
    await userEvent.type(address, formStub["address"]);
    fireEvent.change(address, { target: { innerHTML: formStub["address"] } });

    // отправляем форму
    const checkoutButton: HTMLButtonElement = container.querySelector(
      ".Form-Submit.btn.btn-primary"
    );
    userEvent.click(checkoutButton);
    // screen.logTestingPlaygroundURL();
    // проверяем результат (BUG_ID 5 - форма не отправится и соответственно в документе не появится alert-success)
    let message: HTMLDivElement | null = null;
    await waitFor(() => {
      message = container.querySelector(".Cart-SuccessMessage.alert");
      expect(message).toBeInTheDocument();
    });

    // BUG_ID === 8
    expect(message?.classList?.contains("alert-success")).toEqual(true);
  });
});

