/*
 * @Author: liwenjing
 * @Description: webpack自定义插件，将公共样式common.css直接打到模板上，节省http请求
 * @Date: 2020-03-26 11:34:15
 * @LastEditors: liwenjing
 * @LastEditTime: 2020-04-13 16:53:35
 * @LastEditDetails: 
 */

class myPlugin{
    constructor(option){
        this.param = option.exclude || []
    }
    apply(compiler){ 
        compiler.plugin('compilation', (compilation) => { 
            compilation.plugin('html-webpack-plugin-before-html-generation', (htmlPluginData, callback) => {
                // compilation.assets['static/js/common.js?t=69881bc'].source() 编译好的代码
                // htmlPluginData.assets.css htmlPluginData.assets.js 是两个数组，最后要打到模板上的资源路径名
                Object.assign(htmlPluginData.plugin.options,{assets:{}}) //定义一个assets资源，把编译好的资源挂在上面
                for(let p in compilation.assets){
                    for(let q = 0;q < this.param.length;q ++){
                        if(p.indexOf(this.param[q]) >-1 ){
                            let originVal = compilation.assets[p] //把取到的编译好的代码存起来一份
                            let originKey = p //资源的路径 如static/js/common.js?t=69881bc 也存起来一份
                            p = p.split('?')[0] //把时间戳干掉
                            compilation.assets[p] = originVal //用没有时间戳的key重新赋值
                            htmlPluginData.plugin.options.assets[this.param[q]] = originVal.source() //把代码挂到htmlWebpackPlugin上
                            delete compilation.assets[originKey]//删除带时间戳的key
                        }
                    }
                }
                // 从资源列表中删除指定的资源，使其不会以标签的形式打到页面，节省http请求
                this.deleteResources(htmlPluginData)
                callback(null, htmlPluginData)
            })
        })
    }
    deleteResources(htmlPluginData){
        let type = ['css','js']
        for(let i = 0;i < type.length;i ++){
            for(let q = 0;q < this.param.length;q ++){
                htmlPluginData.assets[type[i]].forEach((item,index) => {
                    if(item.indexOf(this.param[q]) >-1 ){
                        htmlPluginData.assets[type[i]].splice(index,1)
                    }
                })
            }
        }
    }
}
module.exports = myPlugin