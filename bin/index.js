#!/usr/bin/env node

const program = require("commander")


const dlTemplate = require('../lib/download')

const initProject = require('../lib/init')

const addPage = require('../lib/addPage')

// 解析版本 参数为-v 或者 --version
program.version(require('../package.json').version, '-v, --version')

// 下载模板
program.command('template').action(() => {
    dlTemplate()
})
 
program.usage('<commands> [options]')
        .command('init <project_name>')
        .description('Create a javascript plugin project.')
        .action(project => {
            initProject(project)
        })

program.usage('<commands> [options]')
        .command('page <page_name>')
        .description('添加一个新的页面')
        .action(pageName => {
            addPage(pageName)
        })

// 解析命令行参数
program.parse(process.argv)