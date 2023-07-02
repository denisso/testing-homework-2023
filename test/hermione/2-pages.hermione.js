describe("Страницы", async function () {
  it("в магазине должны быть страницы: главная, каталог, условия доставки, контакты", async function () {
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
  
  it("страницы главная, условия доставки, контакты должны иметь статическое содержимое", async function () {
    /**
     * https://t.me/c/1640099527/6306/7275
     * проверять статичность не обязательно. эта фраза в ФТ дает информацию о том, 
     * что кроме внешнего вида, не нужно дополнительно проверять другую логику
     */
    // Занавигировать и сфотографировать
  } )

});
