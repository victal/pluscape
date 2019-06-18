/* tslint:disable no-unused-expression */
import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import SizeComponentsPage from './size.page-object';
import { SizeDeleteDialog } from './size.page-object';
import SizeUpdatePage from './size-update.page-object';
import { waitUntilDisplayed, waitUntilHidden } from '../../util/utils';

const expect = chai.expect;

describe('Size e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let sizeUpdatePage: SizeUpdatePage;
  let sizeComponentsPage: SizeComponentsPage;
  let sizeDeleteDialog: SizeDeleteDialog;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.waitUntilDisplayed();

    await signInPage.username.sendKeys('admin');
    await signInPage.password.sendKeys('admin');
    await signInPage.loginButton.click();
    await signInPage.waitUntilHidden();
    await waitUntilDisplayed(navBarPage.entityMenu);
  });

  it('should load Sizes', async () => {
    await navBarPage.getEntityPage('size');
    sizeComponentsPage = new SizeComponentsPage();
    expect(await sizeComponentsPage.getTitle().getText()).to.match(/Sizes/);
  });

  it('should load create Size page', async () => {
    await sizeComponentsPage.clickOnCreateButton();
    sizeUpdatePage = new SizeUpdatePage();
    expect(await sizeUpdatePage.getPageTitle().getAttribute('id')).to.match(/pluscapeApp.size.home.createOrEditLabel/);
    await sizeUpdatePage.cancel();
  });

  it('should create and save Sizes', async () => {
    async function createSize() {
      await sizeComponentsPage.clickOnCreateButton();
      await sizeUpdatePage.setDescriptionInput('description');
      expect(await sizeUpdatePage.getDescriptionInput()).to.match(/description/);
      await waitUntilDisplayed(sizeUpdatePage.getSaveButton());
      await sizeUpdatePage.save();
      await waitUntilHidden(sizeUpdatePage.getSaveButton());
      expect(await sizeUpdatePage.getSaveButton().isPresent()).to.be.false;
    }

    await createSize();
    await sizeComponentsPage.waitUntilLoaded();
    const nbButtonsBeforeCreate = await sizeComponentsPage.countDeleteButtons();
    await createSize();

    await sizeComponentsPage.waitUntilDeleteButtonsLength(nbButtonsBeforeCreate + 1);
    expect(await sizeComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1);
  });

  it('should delete last Size', async () => {
    await sizeComponentsPage.waitUntilLoaded();
    const nbButtonsBeforeDelete = await sizeComponentsPage.countDeleteButtons();
    await sizeComponentsPage.clickOnLastDeleteButton();

    const deleteModal = element(by.className('modal'));
    await waitUntilDisplayed(deleteModal);

    sizeDeleteDialog = new SizeDeleteDialog();
    expect(await sizeDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/pluscapeApp.size.delete.question/);
    await sizeDeleteDialog.clickOnConfirmButton();

    await sizeComponentsPage.waitUntilDeleteButtonsLength(nbButtonsBeforeDelete - 1);
    expect(await sizeComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
