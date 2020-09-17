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

function inlineScript(compilation, tags, entryPointName) {
  function getAssetByName(assets, tagSrc) {
    for (var key in assets) {
      if (tagSrc.includes(key)) {
        return assets[key].source()
      }
    }
  }
  function sortTags(a, b) {
    const inFrontSrc = `${entryPointName}_share`
    // 保证entryPointName_share 在最前面
    if (a.includes(inFrontSrc)) {
      return -1
    } else if (b.includes(inFrontSrc)) {
      return 1
    }
    return 0
  }

  tags.sort((tag1, tag2) => {
    const tagSrc1 = tag1.attributes.src
    const tagSrc2 = tag2.attributes.src
    if (!tagSrc1 || !tagSrc2) return 0
    return sortTags(tagSrc1, tagSrc2)
  })

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
  share: {
    test: /[\\/]node_modules[\\/]/,
    priority: 20,
    chunks: 'initial',
    name: `${entryPointName}_share`,
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
  inlineScript,
  getHeadAndBodyChunks,
  modifySplitChunks
}
