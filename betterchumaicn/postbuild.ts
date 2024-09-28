import fs from 'node:fs/promises'

const TEMPLATE = await fs.readFile('./betterchumaicn.js', 'utf-8')
const html = await fs.readFile('./dist/index.html', 'utf-8')

const b64Html = '"' + Buffer.from(html).toString('base64') + '"'

const result = TEMPLATE.replace('__CONTENT_HTML__', b64Html)

await fs.writeFile('../betterchumaicn.js', result)