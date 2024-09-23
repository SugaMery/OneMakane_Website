import { DefaultUrlSerializer, UrlTree } from '@angular/router';

export class TrailingSlashUrlSerializer extends DefaultUrlSerializer {
  override parse(url: string): UrlTree {
    // If the URL does not end with a slash and is not empty, add a trailing slash
    if (url && !url.endsWith('/')) {
      url += '/';
    }
    return super.parse(url);
  }
}
