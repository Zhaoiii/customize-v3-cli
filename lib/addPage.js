const fse = require('fs-extra')
const ora = require('ora')
const chalk = require('chalk')
const symbols = require('log-symbols')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const path = require('path')

const dlTemplate = require('./download')

async function addPage(pageName) {
    try {
        const exists = await fse.pathExists('./src/views/' + pageName)
        if(exists) {
            console.log(symbols.error, chalk.red('页面已存在！'))
            process.exit()
        }
        const spinner = ora(chalk.cyan('正在添加...'))
        spinner.start()
        try {
            await fse.ensureDir(process.cwd() + `/src/views/${pageName}`)
            await fse.ensureDir(process.cwd() + `/src/components/${pageName}`)
            await fse.ensureDir(process.cwd() + `/src/store/${pageName}`)

            const templatePath = path.resolve(__dirname, '../template/template-master/page')
            const processPath = process.cwd()

            const targetPath = `${processPath}/src/views/${pageName}`
            
            // 先判断模板路径是否存在
            const exists = await fse.pathExists(templatePath)
            if (!exists) {
                // 不存在时，就先等待下载模板，下载完再执行下面的语句
                await dlTemplate()
            }
            
            // 等待复制好模板文件到对应路径去
            try {
                await fse.copy(templatePath, targetPath)
            } catch (err) {
                console.log(symbols.error, chalk.red(`导入页面失败： ${err}`))
                spinner.fail()
                process.exit()
            }
            
            const multiMeta = {
                page_name: pageName,
            }
            const multiFiles = `${targetPath}/index.vue`
            try {
                const multiFilesContent = await fse.readFile(multiFiles, 'utf8')
                const multiFilesResult = await handlebars.compile(multiFilesContent)(multiMeta)
                try {
                    const routerContent = await fse.readFile(`${processPath}/src/router/index.ts`, 'utf8')
                    const preI = routerContent.indexOf('[')
                    const lastI = routerContent.lastIndexOf("]")
                    const routerArray = routerContent.slice(preI, lastI+1)
                    // const finalArray = eval(routerArray)
                    // finalArray.push({
                    //     path: `/${pageName}`,
                    //     name: `${pageName}`,
                    //     component: () => import(`../views/${pageName}/index.vue`)
                    // })
                    console.log(routerContent)
                } catch (err) {
                    console.log('something error' + err)
                }
                await fse.outputFile(multiFiles, multiFilesResult)
            } catch (error) {
                spinner.text = chalk.red(`创建页面失败： ${err}`)
                spinner.fail()
                process.exit()
            }
                    
        } catch (err) {
            console.log(symbols.error, chalk.red(`创建页面出现错误：${err}`))
            spinner.fail()
            process.exit()
        }
        
        spinner.text = '添加完成'

        spinner.succeed()

    } catch (err) {
        
    }
}

module.exports = addPage