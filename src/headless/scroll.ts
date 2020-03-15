import * as puppeteer from 'puppeteer';
import * as _ from 'lodash';

export class Scroll<T> {
  readonly viewportHeight = 1200;
  private currentPosition = 0;
  private scrollNumber = 0;

  async scroll<U>(
    page: puppeteer.Page,
    param: U,
    func: (arg: U) => Promise<T[]>
  ): Promise<T[]> {
    // 現在の高さ
    let _scrollHeight = await page.evaluate(() => {
      return Promise.resolve(document.documentElement.scrollHeight);
    });

    let _ret: T[] = [];
    while (this.currentPosition < _scrollHeight) {
      this.scrollNumber++;
      const nextPosition = this.scrollNumber * this.viewportHeight;

      // スクロールする
      await page.evaluate(scrollTo => {
        return Promise.resolve(window.scrollTo(0, scrollTo));
      }, nextPosition);

      await page
        .waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })
        .catch(e => {});

      this.currentPosition = nextPosition;

      // 現在の高さ
      _scrollHeight = await page.evaluate(() => {
        return Promise.resolve(document.documentElement.scrollHeight);
      });

      _ret.push(..._.differenceBy(await func(param), _ret));
      _ret = [...new Set(_ret)];

      console.clear();
      const _p = Math.round((this.currentPosition / _scrollHeight) * 100);
      _p < 100 ? console.log(`${_p}%完了`) : '';
    }

    return _ret;
  }
}
