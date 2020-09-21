function getHeadAndBodyChunks(chunks, entryPointName) {
  const headChunks = []
  const bodyChunks = []
  
  // 保证 entryPointName 在最前面
  const sortTags = (a, b) => {
    if (a.includes(entryPointName)) {
      return -1
    } else if (b.includes(entryPointName)) {
      return 1
    }
    return 0
  }
  chunks.sort((tag1, tag2) => {
    const tagSrc1 = tag1.attributes.src
    const tagSrc2 = tag2.attributes.src
    if (!tagSrc1 || !tagSrc2) return 0
    return sortTags(tagSrc1, tagSrc2)
  })

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

function getInlineChunks(compilation, chunks, entryPointName, inline) {
  let headChunks = chunks.headChunks
  let bodyChunks = chunks.bodyChunks

  if (inline) {
    headChunks = inlineScript(
      compilation,
      headChunks,
      entryPointName
    )
    bodyChunks = inlineScript(
      compilation,
      bodyChunks,
      entryPointName
    )
  }

  return { headChunks, bodyChunks }
}

function inlineScript(compilation, tags, entryPointName) {
  function getAssetByName(assets, tagSrc) {
    for (var key in assets) {
      if (tagSrc.includes(key)) {
        return assets[key].source()
      }
    }
  }
  

  tags.forEach(tag => {
    const tagSrc = tag.attributes.src
    if (tagSrc && tagSrc.includes(entryPointName)) {
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

const getShareGroups = (entryPointName) => ({
  [entryPointName]: {
    test: /[\\/]node_modules[\\/]/,
    priority: 20,
    chunks: 'initial',
    name: entryPointName,
    minChunks: 2
  },
  vendors: {
    test: /[\\/]node_modules[\\/]/,
    priority: 10,
    chunks(chunk) {
      return chunk.name !== entryPointName
    },
    name: 'chunk-vendors'
  }
})

function modifySplitChunks(originalConfig, entryPointName) {
  const { cacheGroups } = originalConfig

  return {
    ...originalConfig,
    cacheGroups: {
      ...cacheGroups,
      ...getShareGroups(entryPointName)
    }
  }
}

module.exports = {
  addEntryPoint,
  getInlineChunks,
  getHeadAndBodyChunks,
  modifySplitChunks
}
