const { assert } = require("chai");

describe("Общие требования", async function () {
  it("вёрстка должна адаптироваться под ширину экрана", async function ({
    browser,
  }) {
    /*
      https://t.me/c/1640099527/6306/6739

      адаптация реализована через css, поэтому её можно проверить только интеграционными тестами через скриншоты. 
      т.е. при сохранении исходных скриншотов глазами убедиться, что они корректно выглядят

      запускаем npx hermoine gui, если видим "can not find reference image" жмем кнопку  "Accept"

      оцениваем по картинкам в hermione gui
    */
    // удаляем куки предыдущих сессий
    this.browser.deleteAllCookies();
    await this.browser.url("http://127.0.0.1:3000/hw/store/");
    const widthArray = [320, 575, 768, 1440, 1920];
    for (const width of widthArray) {
      await this.browser.setWindowSize(width, 800);
      await this.browser.assertView("viewport" + width, "body");
    }
  });

  // надо чтобы при bugid === 0 небыло багов так что не в этот раз
  // it("если кнопка гамбургер была развернута, при измении ширины viewport на 576 и более должна сворачиваться", async function () {
  //   /**
  //    * этого нет в дз, но логисно предположить что кнопка гамбургер не должна сохранять свое состояние между desctop и mobile media query
  //    * Класс navbar-toggler - это кнопка открытия закрытия меню
  //    * Состояние классов меню в свернутом состоянии Application-Menu navbar-collapse
  //    * Состояние классов в развернутом состоянии Application-Menu navbar-collapse
  //    */
  //   await this.browser.url("http://127.0.0.1:3000/hw/store/");
  //   await this.browser.setWindowSize(width, 575);
  //   await this.browser.$(".navbar-toggler").$click();
  // });

  it("в шапке отображаются ссылки на страницы магазина, а также ссылка на корзину", async function () {
    /**
     * предполагается что .navbar это шапка
     */
    // удаляем куки предыдущих сессий
    this.browser.deleteAllCookies();
    await this.browser.url("http://localhost:3000/hw/store");

    // проверяем что элемент присутствует на странице
    const elementNavbar = await this.browser.$(".navbar .navbar-nav");

    expect(await elementNavbar.isExisting()).toEqual(true);

    // проверяем что стиль элемента .navbar-nav не display none
    const computedStyle = await this.browser.execute((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        display: computedStyle.display,
      };
    }, elementNavbar);

    expect(computedStyle).toEqual({ display: "flex" });

    // проверяем что свсе ссылки присутствуют на странице и находятся в шапке
    const navbarLinks = await this.browser
      .$$(".navbar-nav .nav-link")
      .map(async (link) => {
        return {
          url: await link.getAttribute("href"),
          text: await link.getText(),
        };
      });

    const expectedLinks = [
      { url: "/hw/store/catalog", text: "Catalog" },
      { url: "/hw/store/delivery", text: "Delivery" },
      { url: "/hw/store/contacts", text: "Contacts" },
      { url: "/hw/store/cart", text: "Cart" },
    ];

    expect(navbarLinks).toEqual(expectedLinks);
  });

  it("название магазина в шапке должно быть ссылкой на главную страницу", async function () {
    // удаляем куки предыдущих сессий
    this.browser.deleteAllCookies();
    await this.browser.url("http://localhost:3000/hw/store");

    // проверяем что элемент присутствует на странице
    const elementNavbar = await this.browser.$(
      ".navbar .Application-Brand.navbar-brand"
    );

    expect(await elementNavbar.isExisting()).toEqual(true);

    const result = await this.browser.execute(async (el) => {
      return {
        tag: el.tagName,
        href: await el.getAttribute("href"),
      };
    }, elementNavbar);

    expect(result).toEqual({
      tag: "A",
      href: "/hw/store/",
    });
  });

  it("на ширине меньше 576px навигационное меню должно скрываться за гамбургер", async function () {
    // удаляем куки предыдущих сессий
    this.browser.deleteAllCookies();
    await this.browser.url("http://localhost:3000/hw/store");

    await this.browser.setWindowSize(575, 400);

    // проверяем что элемент присутствует на странице
    const elementNavbar = await this.browser.$(".navbar .navbar-nav");

    expect(await elementNavbar.isExisting()).toEqual(true);

    // проверяем что стиль элемента .navbar-nav  не display none
    const computedStyle = await this.browser.execute((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        display: computedStyle.display,
      };
    }, elementNavbar);

    const title = await this.browser.$(".Application-Brand").getText();

    assert.equal(title, "Example store");
  });

  it("при выборе элемента из меню гамбургера, меню должно закрываться", async function () {
    // удаляем куки предыдущих сессий
    await this.browser.deleteAllCookies();

    await this.browser.url(
      "http://127.0.0.1:3000/hw/store?bug_id=" + process.env.BUG_ID ?? 0
    );

    // на ширине 575 должна появиться кнопка гамбургер
    await this.browser.setWindowSize(575, 400);

    // на скрине должно быть свернутое меню и кнопка гамбургер
    // await this.browser.assertView("menu-after-click-state", "body");

    // меню за кнопкой гамбургер, по умолчанию меню за кнопкой с классом collapse, класс collapse установлен когда меню свернуто
    let applicationMenu = await this.browser.$(
      ".Application-Menu.navbar-collapse"
    );

    // проверяем что меню свернуто
    let classAttributeValue = (
      await applicationMenu.getAttribute("class")
    ).split(" ");
    let isCollapsed = classAttributeValue.includes("collapse");

    expect(isCollapsed).toEqual(true);

    // await this.browser.assertView("menu-initial-state", "body");

    // кнопка гамбургер
    const elementNavbarToggler = await this.browser.$(
      ".Application-Toggler.navbar-toggler"
    );

    expect(await elementNavbarToggler.isExisting()).toEqual(true);

    // проверяем что гамбургер виден
    const computedStyle = await this.browser.execute((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        display: computedStyle.display,
      };
    }, elementNavbarToggler);

    expect(computedStyle).toEqual({ display: "block" });

    // клик по гамбургер меню должно развернуться =================
    await elementNavbarToggler.click();

    // проверяем что меню развернуто
    // classAttributeValue = await applicationMenu.getAttribute("class");
    // inCollapsed = classAttributeValue.includes("collapse");

    // почему то не работает и класс по прежнему присутствует на элементе ".Application-Menu.navbar-collapse"
    await this.browser.waitUntil(
      async () => {
        const classes = (await applicationMenu.getAttribute("class")).split(
          " "
        );
        return !classes.includes("collapse");
      },
      {
        timeout: 5000,
        timeoutMsg:
          "Класс collapse не удалился с элемента .Application-Menu, меню не развернулось.",
      }
    );

    classAttributeValue = (await applicationMenu.getAttribute("class")).split(
      " "
    );
    isCollapsed = classAttributeValue.includes("collapse");

    expect(isCollapsed).toEqual(false);

    // на скрине должно быть ращвернутое меню
    // await this.browser.assertView("menu-after-click-state", "body");

    // applicationMenu.hasClass("collapse");
    const link = await this.browser.$(
      ".Application-Menu .navbar-nav .nav-link"
    );

    await link.click();

    await this.browser.waitUntil(
      async () => {
        const classes = (await applicationMenu.getAttribute("class")).split(
          " "
        );
        return classes.includes("collapse");
      },
      {
        timeout: 5000,
        timeoutMsg:
          "Класс collapse не появился на элементе .Application-Menu, т.е. меню не свернулось",
      }
    );

    // expect(isCollapsed).toEqual(treu);
    // на скрине должно быть свернутое меню и кнопка гамбургер
    // await this.browser.assertView("menu-after-click-click-by-link", "body");
  });
});
