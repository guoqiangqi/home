/* 临时脚本：整体置平肩章矩形区（含补丁缝边轮廓）的法线/粗糙度，并提亮颜色填充区 */
const sharp = require('/root/qi/qicheng/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp')
const fs = require('fs')

// 肩章整体矩形（含红块下的补丁缝边轮廓），避开下方红色饰边（y>1645）
const RECT = { x0: 1362, y0: 1425, x1: 1522, y1: 1648 }
const FEATHER = 8

async function main() {
  const meta = await sharp('/tmp/now_2.jpg').metadata()
  const W = meta.width, H = meta.height

  // alpha：矩形内=1，边缘 FEATHER 像素线性过渡
  const alpha = new Float32Array(W * H)
  for (let y = RECT.y0 - FEATHER; y < RECT.y1 + FEATHER; y++)
    for (let x = RECT.x0 - FEATHER; x < RECT.x1 + FEATHER; x++) {
      const dx = Math.max(RECT.x0 - x, 0, x - (RECT.x1 - 1))
      const dy = Math.max(RECT.y0 - y, 0, y - (RECT.y1 - 1))
      const d = Math.max(dx, dy)
      alpha[y * W + x] = Math.max(0, 1 - d / FEATHER)
    }

  // ---- 1. 法线 → 标准平面 (128,128,255) ----
  {
    const { data } = await sharp('/tmp/now_2.jpg').raw().toBuffer({ resolveWithObject: true })
    for (let idx = 0; idx < W * H; idx++) {
      const a = alpha[idx]
      if (!a) continue
      const i = idx * 3
      data[i] = data[i] * (1 - a) + 128 * a
      data[i + 1] = data[i + 1] * (1 - a) + 128 * a
      data[i + 2] = data[i + 2] * (1 - a) + 255 * a
    }
    const out = await sharp(data, { raw: { width: W, height: H, channels: 3 } })
      .jpeg({ quality: 92, mozjpeg: true }).toBuffer()
    fs.writeFileSync('/tmp/n_rect.jpg', out)
    console.log('normal:', out.length)
  }

  // ---- 2. 粗糙度 → 矩形外圈均值 ----
  {
    const { data } = await sharp('/tmp/now_1.jpg').raw().toBuffer({ resolveWithObject: true })
    let sr = 0, sg = 0, sb = 0, n = 0
    for (let y = RECT.y0 - 12; y < RECT.y1 + 12; y++)
      for (let x = RECT.x0 - 12; x < RECT.x1 + 12; x++) {
        if (x >= RECT.x0 - FEATHER && x < RECT.x1 + FEATHER && y >= RECT.y0 - FEATHER && y < RECT.y1 + FEATHER) continue
        const i = (y * W + x) * 3
        sr += data[i]; sg += data[i + 1]; sb += data[i + 2]; n++
      }
    const tr = sr / n, tg = sg / n, tb = sb / n
    console.log('MR target:', tr.toFixed(0), tg.toFixed(0), tb.toFixed(0))
    for (let idx = 0; idx < W * H; idx++) {
      const a = alpha[idx]
      if (!a) continue
      const i = idx * 3
      data[i] = data[i] * (1 - a) + tr * a
      data[i + 1] = data[i + 1] * (1 - a) + tg * a
      data[i + 2] = data[i + 2] * (1 - a) + tb * a
    }
    const out = await sharp(data, { raw: { width: W, height: H, channels: 3 } })
      .jpeg({ quality: 92, mozjpeg: true }).toBuffer()
    fs.writeFileSync('/tmp/mr_rect.jpg', out)
    console.log('mr:', out.length)
  }

  // ---- 3. 颜色：矩形内偏暗的中性像素提亮至周边布料水平 ----
  {
    const { data } = await sharp('/tmp/now_0.jpg').raw().toBuffer({ resolveWithObject: true })
    const isNeutral = (i) => {
      const mx = Math.max(data[i], data[i + 1], data[i + 2])
      const mn = Math.min(data[i], data[i + 1], data[i + 2])
      return mx - mn < 40
    }
    // 目标亮度：矩形上方一条布料的均值
    let s = 0, n = 0
    for (let y = RECT.y0 - 30; y < RECT.y0 - 10; y++)
      for (let x = RECT.x0; x < RECT.x1; x++) {
        const i = (y * W + x) * 3
        if (isNeutral(i)) { s += (data[i] + data[i + 1] + data[i + 2]) / 3; n++ }
      }
    const target = s / n
    let s2 = 0, n2 = 0
    for (let y = RECT.y0; y < RECT.y1; y++)
      for (let x = RECT.x0; x < RECT.x1; x++) {
        const i = (y * W + x) * 3
        if (isNeutral(i)) { s2 += (data[i] + data[i + 1] + data[i + 2]) / 3; n2++ }
      }
    const gain = Math.max(1, Math.min(1.12, target / (s2 / n2)))
    console.log('color target:', target.toFixed(1), 'core:', (s2 / n2).toFixed(1), 'gain:', gain.toFixed(3))
    for (let idx = 0; idx < W * H; idx++) {
      const a = alpha[idx]
      if (!a) continue
      const i = idx * 3
      if (!isNeutral(i)) continue // 不碰红色饰边
      const g = 1 + (gain - 1) * a
      data[i] = Math.min(255, data[i] * g)
      data[i + 1] = Math.min(255, data[i + 1] * g)
      data[i + 2] = Math.min(255, data[i + 2] * g)
    }
    // 矩形内轻度模糊中性像素，抹掉补丁矩形的亮度阶梯
    for (let pass = 0; pass < 3; pass++) {
      const upd = []
      for (let y = RECT.y0; y < RECT.y1; y++)
        for (let x = RECT.x0; x < RECT.x1; x++) {
          const i = (y * W + x) * 3
          if (!isNeutral(i)) continue
          let r = 0, g = 0, b = 0, nn = 0
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
              const j = ((y + dy) * W + (x + dx)) * 3
              if (!isNeutral(j)) continue
              r += data[j]; g += data[j + 1]; b += data[j + 2]; nn++
            }
          if (nn > 4) upd.push([i, r / nn, g / nn, b / nn])
        }
      for (const [i, r, g, b] of upd) { data[i] = r; data[i + 1] = g; data[i + 2] = b }
    }
    const out = await sharp(data, { raw: { width: W, height: H, channels: 3 } })
      .jpeg({ quality: 90, mozjpeg: true }).toBuffer()
    fs.writeFileSync('/tmp/bc_rect.jpg', out)
    console.log('base:', out.length)
  }

  // 验证图
  const box = { left: 1340, top: 1330, width: 220, height: 390 }
  const nImg = await sharp('/tmp/n_rect.jpg').extract(box).normalise().resize(330, 585, { kernel: 'nearest' }).toBuffer()
  const bImg = await sharp('/tmp/bc_rect.jpg').extract(box).resize(330, 585, { kernel: 'nearest' }).toBuffer()
  await sharp({ create: { width: 670, height: 585, channels: 3, background: '#111' } })
    .composite([{ input: bImg, left: 0, top: 0 }, { input: nImg, left: 340, top: 0 }])
    .png().toFile('/tmp/rect_chk.png')
  console.log('check written')
}

main().catch((e) => { console.error(e); process.exit(1) })
