import fs from 'fs'

let content = fs.readFileSync('dist/shared.js', 'utf-8')

content = content.replace(/\bnode\:(\w+)/g, '$1')

fs.writeFileSync('dist/shared.cjs', content, 'utf-8')
fs.unlinkSync('dist/shared.js')
