const { getHeadAndBodyChunks, inlineScript, addEntryPoint } = require('./lib/utils.js')

class InlineScriptPlugin {
  constructor(options = {}) {
    console.log('InlineScriptPlugin=======options:', options)
    const { name, path, inhead } = options
    this.name = inhead ? `${name}_head` : name
    this.entryPoint = {
      [this.name]: Array.isArray(path) ? path : [path]
    }
    // this.inhead = inhead
  }

  apply(compiler) {
    const selfName = this.constructor.name
    const originEntry = compiler.options.entry
    const finalEntry = addEntryPoint(originEntry, this.entryPoint)
    compiler.options.entry = finalEntry

    // HtmlWebpackPlugin version 4.0.0-beta.5
    const HtmlWebpackPlugin = require('html-webpack-plugin')
    // if (HtmlWebpackPlugin.getHooks) {
    //   compiler.hooks.compilation.tap(selfName, compilation => {
    //     HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
    //       selfName,
    //       (data, callback) => {
    //         const tags = [...data.bodyTags, ...data.headTags]
    //         // handleChunksConfig(data, tags)
    //         const chunks = getHeadAndBodyChunks(tags)

    //         data.headTags = chunks.headChunks
    //         data.bodyTags = chunks.bodyChunks

    //         callback(null, data)
    //       }
    //     )
    //   })
    // } else {
      // HtmlWebpackPlugin version 3.2.0
      compiler.plugin('compilation', compilation => {
        compilation.plugin('html-webpack-plugin-alter-asset-tags', data => {
          const tags = [...data.body, ...data.head]
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
          data.head = headChunks
          data.body = bodyChunks
        })
      })
    // }
  }
}

module.exports = InlineScriptPlugin
