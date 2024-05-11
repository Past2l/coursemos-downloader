import { CoursemosPDF } from '../types';

export class Coursemos {
  static cookie?: string;

  static async login(url?: string, username?: string, password?: string) {
    if (
      !url ||
      !username ||
      !password ||
      !/(learn|eclass)\..*\.ac\.kr\/login\.php/g.test(url)
    )
      return false;
    const result = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
    });
    this.cookie = result.headers.get('Set-Cookie') || '';
    console.log(this.cookie);
    return true;
  }

  static async pdf(url: string): Promise<CoursemosPDF | null> {
    if (/(learn|eclass)\..*\.ac\.kr\/mod\/ubfile\/view\.php\?id=.*/g.test(url))
      url = `${url.split('/mod')[0]}/local/ubdoc/?id=${
        url.split('?id=')[1]
      }&tp=m&pg=ubfile`;
    if (!/(learn|eclass)\..*\.ac\.kr\/local\/ubdoc.*/g.test(url)) return null;
    const { id, tp, pg } = JSON.parse(
      `{"${decodeURI(
        url.split('?')[1].replace(/&/g, '","').replace(/=/g, '":"'),
      )}"}`,
    );
    if (!id || !tp || !pg) return null;
    const info = await fetch(
      `${url.split('/local')[0]}/local/ubdoc/worker.php`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ job: 'checkState', id, tp, pg }),
      },
    );
    const { file_url, file_name } = await info.json();
    return { name: file_name, url: file_url };
  }

  static async video(url: string) {
    console.log(url, this.cookie);
    const result = await fetch(url, {
      headers: { Cookie: this.cookie || '' },
    });
    console.log(await result.text());
  }
}
