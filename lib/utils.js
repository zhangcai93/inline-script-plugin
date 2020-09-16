function getHeadAndBodyChunks(chunks) {
  const headChunks = []
  const bodyChunks = []

  chunks.forEach(chunk => {
    if (
      (chunk.attributes.src && chunk.attributes.src.includes('_inhead')) ||
      chunk.attributes.href
    ) {
      headChunks.push(chunk)
    } else {
      bodyChunks.push(chunk)
    }
  })

  return { headChunks, bodyChunks }
}

function inlineScript(compilation, tags, inlineName) {
  function getAssetByName(assets, tagSrc) {
    for (var key in assets) {
      if (tagSrc.includes(key)) {
        return assets[key].source()
      }
    }
  }
  tags.forEach(tag => {
    const tagSrc = tag.attributes.src
    console.log('tag.attributes.src========tagSrc', tagSrc)
    if (tagSrc && tagSrc.includes(inlineName)) {
      const assetContent = getAssetByName(compilation.assets, tagSrc)
      if (assetContent) {
        tag.innerHTML = assetContent
        delete tag.attributes.src
      }
    }
  })

  return tags
}

function addEntryPoint(originEntry, entryPoint) {
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

module.exports = {
  addEntryPoint,
  inlineScript,
  getHeadAndBodyChunks
}
