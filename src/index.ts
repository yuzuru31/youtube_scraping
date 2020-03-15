import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

import { Browser } from 'src/headless/browser';
import { Page } from 'src/headless/page';
import { Scroll } from 'src/headless/scroll';

const save_path = `${process.cwd()}/comment`;

if (!fs.existsSync(save_path)) {
  fs.mkdirSync(save_path);
}

const youtube_func = async (page: puppeteer.Page): Promise<string[]> => {
  return await page.$$eval('#content #content-text', selector => {
    return selector.map(row => row.textContent);
  });
};

// コメント保存
const save_comment = async (list: string[], id: string) => {
  if (list.length === 0) {
    return;
  }

  if (!fs.existsSync(`${save_path}/${id}`)) {
    fs.mkdirSync(`${save_path}/${id}`);
  }

  // json形式で保存
  fs.writeFileSync(`${save_path}/${id}/${id}.json`, JSON.stringify(list));

  // txt形式で保存
  fs.writeFileSync(
    `${save_path}/${id}/${id}.txt`,
    list.reduce((ret: string, str, index) => {
      ret += `${index}\n${str}\n\n`;
      return ret;
    }, '')
  );
};

const main = async () => {
  const _instance = new Page(await Browser.get_browser());
  await _instance.init();

  // ページをget
  await _instance.page.goto(
    `https://www.youtube.com/watch?v=${process.argv[2]}`
  );
  // domが出現するまで待つ
  await _instance.page.waitForSelector('h1');

  const _scroll = new Scroll<string>();
  const _ret = await _scroll.scroll(
    _instance.page,
    _instance.page,
    youtube_func
  );
  save_comment(_ret, process.argv[2]);

  console.log('fin');
  process.exit(0);
};

if (process.argv[2] === undefined) {
  console.log('引数がない');
  process.exit(0);
}

main();
