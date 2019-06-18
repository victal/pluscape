import { element, by, ElementFinder } from 'protractor';

export default class ProductUpdatePage {
  pageTitle: ElementFinder = element(by.id('pluscapeApp.product.home.createOrEditLabel'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));
  nameInput: ElementFinder = element(by.css('input#product-name'));
  descriptionInput: ElementFinder = element(by.css('input#product-description'));
  currentPriceInput: ElementFinder = element(by.css('input#product-currentPrice'));
  standardPriceInput: ElementFinder = element(by.css('input#product-standardPrice'));
  linkInput: ElementFinder = element(by.css('input#product-link'));
  pictureInput: ElementFinder = element(by.css('input#file_picture'));
  sizesSelect: ElementFinder = element(by.css('select#product-sizes'));
  categoriesSelect: ElementFinder = element(by.css('select#product-categories'));

  getPageTitle() {
    return this.pageTitle;
  }

  async setNameInput(name) {
    await this.nameInput.sendKeys(name);
  }

  async getNameInput() {
    return this.nameInput.getAttribute('value');
  }

  async setDescriptionInput(description) {
    await this.descriptionInput.sendKeys(description);
  }

  async getDescriptionInput() {
    return this.descriptionInput.getAttribute('value');
  }

  async setCurrentPriceInput(currentPrice) {
    await this.currentPriceInput.sendKeys(currentPrice);
  }

  async getCurrentPriceInput() {
    return this.currentPriceInput.getAttribute('value');
  }

  async setStandardPriceInput(standardPrice) {
    await this.standardPriceInput.sendKeys(standardPrice);
  }

  async getStandardPriceInput() {
    return this.standardPriceInput.getAttribute('value');
  }

  async setLinkInput(link) {
    await this.linkInput.sendKeys(link);
  }

  async getLinkInput() {
    return this.linkInput.getAttribute('value');
  }

  async setPictureInput(picture) {
    await this.pictureInput.sendKeys(picture);
  }

  async getPictureInput() {
    return this.pictureInput.getAttribute('value');
  }

  async sizesSelectLastOption() {
    await this.sizesSelect
      .all(by.tagName('option'))
      .last()
      .click();
  }

  async sizesSelectOption(option) {
    await this.sizesSelect.sendKeys(option);
  }

  getSizesSelect() {
    return this.sizesSelect;
  }

  async getSizesSelectedOption() {
    return this.sizesSelect.element(by.css('option:checked')).getText();
  }

  async categoriesSelectLastOption() {
    await this.categoriesSelect
      .all(by.tagName('option'))
      .last()
      .click();
  }

  async categoriesSelectOption(option) {
    await this.categoriesSelect.sendKeys(option);
  }

  getCategoriesSelect() {
    return this.categoriesSelect;
  }

  async getCategoriesSelectedOption() {
    return this.categoriesSelect.element(by.css('option:checked')).getText();
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  getSaveButton() {
    return this.saveButton;
  }
}
