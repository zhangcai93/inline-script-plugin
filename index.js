const {
  getHeadAndBodyChunks,
  inlineScript,
  addEntryPoint
} = require('./lib/utils.js')

class InlineScriptPlugin {
  constructor(options = {}) {
    console.log('TestWebpackPlugin=======options:', options)
    const { name, path, inhead = false } = options
    if (!name || !path) {
      const message = 'either reuqired options name or path did not pass'
      throw new Error(message)
    }
    this.name = inhead ? `${name}_inhead` : name
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

    // HtmlWebpackPlugin version 4.0.0-beta.5
    const HtmlWebpackPlugin = require('html-webpack-plugin')
    if (HtmlWebpackPlugin.getHooks) {
      compiler.hooks.compilation.tap(selfName, compilation => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          selfName,
          (data, callback) => {
            const tags = [...data.bodyTags, ...data.headTags]
            const chunks = getHeadAndBodyChunks(tags)

            const headChunks = inlineScript(
              compilation,
              chunks.headChunks,
              this.name
            )
            const bodyChunks = inlineScript(
              compilation,
              chunks.bodyChunks,
              this.name
            )

            data.headTags = headChunks
            data.bodyTags = bodyChunks

            callback(null, data)
          }
        )
      })
    } else {
      // HtmlWebpackPlugin version 3.2.0
      compiler.plugin('compilation', compilation => {
        compilation.plugin('html-webpack-plugin-alter-asset-tags', data => {
          const tags = [...data.body, ...data.head]
          // _inhead后缀script添加到头部
          const chunks = getHeadAndBodyChunks(tags)
          // 转为inline形式
          const headChunks = inlineScript(
            compilation,
            chunks.headChunks,
            this.name
          )
          const bodyChunks = inlineScript(
            compilation,
            chunks.bodyChunks,
            this.name
          )
          data.head = headChunks
          data.body = bodyChunks
        })
      })
    }
  }
}

module.exports = InlineScriptPlugin
