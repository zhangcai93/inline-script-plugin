const { SHARE_SUFFIX, INHEAD_SUFFIX } = require('./constants.js')

function getHeadAndBodyChunks(chunks) {
  const headChunks = []
  const bodyChunks = []

  chunks.forEach(chunk => {
    if (
      (chunk.attributes.src && chunk.attributes.src.includes(INHEAD_SUFFIX)) ||
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
  share: {
    test: /[\\/]node_modules[\\/]/,
    priority: 20,
    chunks: 'all',
    name: `${entryPointName}${SHARE_SUFFIX}`,
    minChunks: 2
  },
  vendors: {
    test: /[\\/]node_modules[\\/]/,
    priority: 10,
    reuseExistingChunk: true,
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


function sortJsChunks(JsChunks = [], entryPointName = '') {
  if (!JsChunks.length || !entryPointName) return jsArr
  let left = []
  let right = []
  JsChunks.forEach(jsItem => {
    if (jsItem.includes(entryPointName)) {
      if (jsItem.includes(SHARE_SUFFIX)) {
        left.unshift(jsItem)
      } else {
        left.push(jsItem)
      }
    } else {
      right.push(jsItem)
    }
  })
  return left.concat(right)
}

module.exports = {
  addEntryPoint,
  modifySplitChunks,
  getHeadAndBodyChunks,
  getInlineChunks,
  sortJsChunks
}
