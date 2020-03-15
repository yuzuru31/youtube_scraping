import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as jquery from 'jquery';
import { JSDOM } from 'jsdom';

/**
 * configファイルのパス
 */
const headless_json_path = `${process.cwd()}/config/headless.json`;

/**
 * ページクラス
 * インスタンス作成後init関数を読んで初期化してください
 */
export class Page {
  private browser: puppeteer.Browser = null;
  public page: puppeteer.Page = null;

  /**
   * コンストラクタ
   * @param browser
   */
  constructor(browser: puppeteer.Browser) {
    this.browser = browser;
  }

  /**
   * 初期処理
   */
  public async init() {
    // 新しいタブを開く
    this.page = await this.browser.newPage();

    // 今後 alert confirmが出たら自動でyesにするようにする
    this.set_dialog_accept(this.page);

    // pageオプション設定
    await this.set_page_option(this.page);
  }

  /**
   * 今後 alert confirmが出たら自動でyesにするようにする
   * @param page
   */
  private set_dialog_accept(page: puppeteer.Page) {
    page.on('dialog', dialog => {
      // console.log(dialog.message());
      dialog.accept();
    });

    // page.on('filedialog', async input => {
    //   await input.uploadFile(`${process.cwd()}/abc.png`);
    // });
  }

  /**
   * pageオプション設定
   * @param page
   */
  private async set_page_option(page: puppeteer.Page) {
    await page.emulate(
      JSON.parse(fs.readFileSync(headless_json_path, 'utf8'))['page_option']
    );
  }

  /**
   * domを返す
   */
  public async get_dom() {
    const _dom = new JSDOM(
      await this.page.$eval('html', item => {
        return item.innerHTML;
      })
    );

    const _$: JQueryStatic = <any>jquery(_dom.window);
    return _$;
  }

  /**
   * ローカルストレージsetItem
   */
  public async set_localStorage(key: string, value: any) {
    return await this.page.evaluate(
      (key, value) => {
        localStorage.setItem(key, value);
      },
      key,
      value
    );
  }

  /**
   * ローカルストレージgetItem
   */
  public async get_localStorage(key: string) {
    return await this.page.evaluate(key => {
      return {
        [key]: localStorage.getItem(key)
      };
    }, key);
  }
}
