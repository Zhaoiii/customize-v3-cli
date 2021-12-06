const fse = require('fs-extra')
const ora = require('ora')
const chalk = require('chalk')
const symbols = require('log-symbols')
const inquirer = require('inquirer')
const handlebars = require('handlebars')

const path = require('path')

// 请求 download.js 文件，模板不在本地时执行该操作
const dlTemplate = require('./download')

async function initProject(projectName) {
	try {
		const exists = await fse.pathExists(projectName)
		if (exists) {
        	// 项目重名时提醒用户
			console.log(symbols.error, chalk.red('项目名已存在！'))
		} else {
        	// 执行控制台交互
			inquirer
				.prompt([
					{
						type: 'input', // 类型
						name: 'name',  // 名称
						message: 'Set a global name for javascript plugin?',
						default: 'Default',  // 默认值，用户不输入时用此值
					},
				])
				.then(async (answers) => {
                	// Spinner 初始设置
					const initSpinner = ora(chalk.cyan('初始化项目...'))
                    // 开始执行等待动画
					initSpinner.start()
                    
					// 拼接 template 文件夹路径
					const templatePath = path.resolve(__dirname, '../template/template-master/project')
                    // 返回 Node.js 进程的当前工作目录
					const processPath = process.cwd()
                    // 把项目名转小写
					const LCProjectName = projectName.toLowerCase()
                    // 拼接项目完整路径
					const targetPath = `${processPath}/${LCProjectName}`
                    
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
						console.log(symbols.error, chalk.red(`导入模板失败： ${err}`))
						process.exit()
					}
                    
          			// 把要替换的模板字符准备好
                    const multiMeta = {
                      project_name: LCProjectName,
                      global_name: answers.name
                    }
                    // 把要替换的文件准备好
                    const multiFiles = [
                      `${targetPath}/package.json`,
                    ]
                    
					// 用条件循环把模板字符替换到文件去
                    for (var i = 0;i < multiFiles.length;i++){
                        try {
                            console.log(multiFiles[i])
                        	// 等待读取文件
                            const multiFilesContent = await fse.readFile(multiFiles[i], 'utf8')
                            // 等待替换文件，handlebars.compile(原文件内容)(模板字符)
                            const multiFilesResult = await handlebars.compile(multiFilesContent)(multiMeta)
                            // 等待输出文件
                            await fse.outputFile(multiFiles[i], multiFilesResult)
                        } catch (err) {
                        	// 如果出错，Spinner 就改变文字信息
                            initSpinner.text = chalk.red(`创建项目失败： ${err}`)
                            // 终止等待动画并显示 X 标志
                            initSpinner.fail()
                            // 退出进程
                            process.exit()
                        }
                    }
                    
					// 如果成功，Spinner 就改变文字信息
					initSpinner.text = '创建项目成功！'
                    // 终止等待动画并显示 ✔ 标志
					initSpinner.succeed()
                    console.log(`
To get started:

	cd ${chalk.yellow(LCProjectName)}
	${chalk.yellow('npm install')} or ${chalk.yellow('yarn install')}
	${chalk.yellow('npm run dev')} or ${chalk.yellow('yarn run dev')}
					`)
				})
				.catch((error) => {
					if (error.isTtyError) {
						console.log(symbols.error,chalk.red("Prompt couldn't be rendered in the current environment."))
					} else {
						console.log(symbols.error, chalk.red(error))
					}
				})
		}
	} catch (err) {
		console.error(err)
		process.exit()
	}
}

module.exports = initProject