export function getHeadAndBodyChunks(chunks) {
  const headChunks = []
  const bodyChunks = []

  chunks.forEach(chunk => {
    if (
      (chunk.attributes.src && chunk.attributes.src.includes('_head')) ||
      chunk.attributes.href
    ) {
      headChunks.push(chunk)
    } else {
      bodyChunks.push(chunk)
    }
  })

  return { headChunks, bodyChunks }
}

export function inlineScript(compilation, tags, inlineName) {
  function getAssetByName(assets, src) {
    for (var key in assets) {
      if (src.includes(key)) {
        return assets[key].source()
      }
    }
  }
  tags.forEach(tag => {
    console.log('tag.attributes.src========', tag.attributes.src)
    if (tag.attributes.src && tag.attributes.src.includes(inlineName)) {
      const assetContent = getAssetByName(
        compilation.assets,
        tag.attributes.src
      )
      if (assetContent) {
        tag.innerHTML = assetContent
        delete tag.attributes.src
      }
    }
  })

  return tags
}

export function addEntryPoint(originEntry, entryPoint) {
  let finalEntry = originEntry
  try {
    if (typeof originEntry === 'string' || Array.isArray(originEntry)) {
      finalEntry = {
        main: Array.isArray(originEntry) ? originEntry : [originEntry],
        ...entryPoint
      }
    }
    if (typeof originEntry === 'object') {
      finalEntry = {
        ...originEntry,
        ...entryPoint
      }
    }
  } catch (err) {
    console.error('add entry fail')
  }
  return finalEntry
}