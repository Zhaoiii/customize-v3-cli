const download = require('download')
const chalk = require('chalk')
const ora = require('ora')
const fse = require('fs-extra')
const path = require('path')


const tplPath = path.resolve(__dirname,'../template')

async function dlTemplate() {

    try{await fse.remove(tplPath)}catch(err){
        console.log(err)
        process.exit()
    }
    const spinner = ora(chalk.cyan('下载模板...'))

    spinner.start()

    try {
        await download('https://github.com/Zhaoiii/template/archive/refs/heads/master.zip', path.resolve(__dirname, '../template/'), {extract: true})
    } catch (err) {
        spinner.text = `下载失败: ${err}`
        spinner.fail()
        process.exit()
    }

    spinner.text = '下载成功！'
    spinner.succeed()
}

module.exports = dlTemplate

