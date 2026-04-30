export function resolvePath(basePath, routePath) {
  if (routePath.startsWith('/')) {
    return routePath
  }
  const base = basePath.endsWith('/') ? basePath : basePath + '/'
  return base + routePath
}
