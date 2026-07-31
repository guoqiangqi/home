/* 临时脚本：写回置平后的三张贴图（image 0/1/2） */
const fs = require('fs')

const GLB = '/root/qi/qicheng/public/models/astronaut_texture.glb'
const REPLACE = [
  { imageIndex: 0, file: '/tmp/bc_rect.jpg' },
  { imageIndex: 1, file: '/tmp/mr_rect.jpg' },
  { imageIndex: 2, file: '/tmp/n_rect.jpg' },
]

const buf = fs.readFileSync(GLB)
const jsonLen = buf.readUInt32LE(12)
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString())
const binHeaderOfs = 20 + jsonLen
const binLen = buf.readUInt32LE(binHeaderOfs)
let bin = buf.slice(binHeaderOfs + 8, binHeaderOfs + 8 + binLen)

for (const { imageIndex, file } of REPLACE) {
  const bv = json.bufferViews[json.images[imageIndex].bufferView]
  const off = bv.byteOffset || 0
  const oldLen = bv.byteLength

  const newData = fs.readFileSync(file)
  let newPadded = newData
  while ((oldLen - newPadded.length) % 4 !== 0) newPadded = Buffer.concat([newPadded, Buffer.from([0])])
  if (newPadded.length > oldLen) throw new Error(file + ' 比旧图大，需改用追加方案')
  const delta = oldLen - newPadded.length

  bin = Buffer.concat([bin.slice(0, off), newPadded, bin.slice(off + oldLen)])
  bv.byteLength = newData.length
  for (const view of json.bufferViews) {
    if (view !== bv && (view.byteOffset || 0) > off) view.byteOffset -= delta
  }
  console.log('replaced image', imageIndex, oldLen, '->', newData.length)
}
json.buffers[0].byteLength = bin.length

let jsonBuf = Buffer.from(JSON.stringify(json))
while (jsonBuf.length % 4 !== 0) jsonBuf = Buffer.concat([jsonBuf, Buffer.from(' ')])
let binOut = bin
while (binOut.length % 4 !== 0) binOut = Buffer.concat([binOut, Buffer.from([0])])

const total = 12 + 8 + jsonBuf.length + 8 + binOut.length
const out = Buffer.alloc(total)
out.write('glTF', 0)
out.writeUInt32LE(2, 4)
out.writeUInt32LE(total, 8)
out.writeUInt32LE(jsonBuf.length, 12)
out.write('JSON', 16)
jsonBuf.copy(out, 20)
out.writeUInt32LE(binOut.length, 20 + jsonBuf.length)
out.write('BIN\0', 24 + jsonBuf.length)
binOut.copy(out, 28 + jsonBuf.length)

fs.writeFileSync(GLB, out)
console.log('written:', out.length, 'bytes')

// 校验：bufferView 边界 + 每张图 JPEG 魔数
const chk = fs.readFileSync(GLB)
const jl = chk.readUInt32LE(12)
const j2 = JSON.parse(chk.slice(20, 20 + jl).toString())
const blen = j2.buffers[0].byteLength
for (const [i, v] of j2.bufferViews.entries()) {
  if ((v.byteOffset || 0) + v.byteLength > blen) throw new Error('bufferView ' + i + ' 越界')
}
const bin2 = chk.slice(20 + jl + 8)
for (const [i, im] of j2.images.entries()) {
  const v = j2.bufferViews[im.bufferView]
  const o = v.byteOffset || 0
  if (bin2[o] !== 0xff || bin2[o + 1] !== 0xd8) throw new Error('image ' + i + ' 非 JPEG 头')
}
console.log('GLB verify OK')
