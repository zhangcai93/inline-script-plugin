## inline-script-plugin

加强 `html-webpack-plugin `插件

将给定路径的script插入到所有js脚本的最前面, 或直接插入到head标签中

提供以inline的形式插入到html中

使用前确保有安装 `html-webpack-plugin `

### 安装

```javascript
npm i inline-script-plugin -D
```

### 使用

将`inline-script-plugin`添加到`webpack`插件配置当中：

```javascript
// vue.config.js为例
const InlineScriptPlugin = require('inline-script-plugin')

module.exports = {
  xxx,
  chainWebpack: config => {
    config
      .plugin('InlineScriptPlugin')
      .after('html')
      .use(InlineScriptPlugin, [
        {
          name: 'abc', // yourName
          path: './a/b.js', // yourPath
          inhead: true,
          inline: true
        }
      ])
      .end()
  }
}
```

有关 options 配置如下：

|字段名|参数类型|默认值|是否必填|说明|
|--|--|--|--|--|
| name | String | - | 是 | 文件名 | 
| path | String | - | 是 | 文件路径 |
| inline | Boolean | false | 否 | 是否以inline形式插入脚本 |
| inhead | Boolean | false | 否 | 是否将脚本插入到head标签里 |
