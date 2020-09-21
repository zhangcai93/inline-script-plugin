const {
  getHeadAndBodyChunks,
  getInlineChunks,
  addEntryPoint,
  modifySplitChunks
} = require('./lib/utils.js')

class InlineScriptPlugin {
  constructor(options = {}) {
    const { name, path, inhead = false, inline = false} = options
    if (!name || !path) {
      const message = 'either reuqired options name or path did not pass'
      throw new Error(message)
    }
    this.name = inhead ? `${name}_inhead` : name
    this.inline = inline
    this.entryPoint = {
      [this.name]: Array.isArray(path) ? path : [path]
    }
  }

  apply(compiler) {
    const selfName = this.constructor.name
    // 添加entry入口
    const originEntry = compiler.options.entry
    const finalEntry = addEntryPoint(originEntry, this.entryPoint)
    compiler.options.entry = finalEntry


    const splitChunks = compiler.options.optimization.splitChunks
    compiler.options.optimization.splitChunks = modifySplitChunks(splitChunks, this.name)

    // HtmlWebpackPlugin version 4.0.0-beta.5
    const HtmlWebpackPlugin = require('html-webpack-plugin')
    if (HtmlWebpackPlugin.getHooks) {
      compiler.hooks.compilation.tap(selfName, compilation => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          selfName,
          (data, callback) => {
            const tags = [...data.bodyTags, ...data.headTags]
            const chunks = getHeadAndBodyChunks(tags, this.name)

            const { headChunks, bodyChunks } = getInlineChunks(compilation, chunks, this.name, this.inline)

            data.headTags = headChunks
            data.bodyTags = bodyChunks

            callback(null, data)
          }
        )
      })
    } else {
      // HtmlWebpackPlugin version 3.2.x
      compiler.plugin('compilation', compilation => {
        compilation.plugin('html-webpack-plugin-alter-asset-tags', data => {
          const tags = [...data.body, ...data.head]
          // _inhead后缀script添加到头部
          const chunks = getHeadAndBodyChunks(tags, this.name)
          // 转为inline形式
          const { headChunks, bodyChunks } = getInlineChunks(compilation, chunks, this.name, this.inline)
      
          data.head = headChunks
          data.body = bodyChunks
        })
      })
    }
  }
}

module.exports = InlineScriptPlugin
