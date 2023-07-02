describe("Каталог", async function () {
  it("в каталоге должны отображаться товары, список которых приходит с сервера", async function () {
    // удаляем куки предыдущих сессий
    this.browser.deleteAllCookies();
    await this.browser.url("http://localhost:3000/hw/store/catalog");
    const product = await this.browser.$(".ProductItem[data-testid]");

    // будет исключение если в каталоге нет товаров
    await product.waitForDisplayed({ timeout: 3000 })
  });
});
