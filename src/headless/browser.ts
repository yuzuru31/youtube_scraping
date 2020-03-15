import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

/**
 * configファイルのパス
 */
const headless_json_path = `${process.cwd()}/config/headless.json`;

/**
 * ブラウザクラス
 * シングルトン
 */
export class Browser {
  private static browser: puppeteer.Browser = null;

  /**
   * コンストラクタ
   */
  constructor() {
    throw new Error('new禁止です');
  }

  /**
   * 初期処理
   */
  public static async get_browser() {
    if (this.browser !== null) {
      return this.browser;
    }

    // configファイル読み込み
    const _headless_json = JSON.parse(
      fs.readFileSync(headless_json_path, 'utf8')
    );

    // option設定
    const _option =
      _headless_json['os'] === 'windows'
        ? _headless_json['headless_option_windows']
        : _headless_json['headless_option_linux'];

    // ブラウザ開く
    this.browser = await puppeteer.launch(_option);

    return this.browser;
  }

  /**
   * ブラウザを閉じる
   */
  public static async close_browser() {
    if (this.browser === null) {
      throw new Error('ブラウザを開いていません');
    }
    await this.browser.close();
  }
}
