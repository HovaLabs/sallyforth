/** Describe the links present on this page of a collection or directory. */
export function listingEntity(items: Array<{name: string; path: string}>) {
  return (url: string, origin: string) => ({
    '@type': 'ItemList',
    '@id': `${url}#list`,
    itemListElement: items.map(({name, path}, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      url: new URL(path, origin).href,
    })),
  });
}
