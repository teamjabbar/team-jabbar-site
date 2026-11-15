// Runs before every build, after fetch-assets. Makes a PDF brochure for each
// listing in src/content/listings/ and saves it to public/brochures/<file>.pdf.
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { parse } from 'yaml';

// Shown on the last page. Keep in step with src/site.ts.
const TEAM = {
  name: 'Team Jabbar',
  phone: '(647) 886-7355',
  email: 'M2jabbar@gmail.com',
  web: 'teamjabbar.com',
  brokerage: 'CENTURY 21 Green Realty Inc., Brokerage',
  brokerageNote: 'Independently owned and operated',
  office: '6980 Maritz Dr, Unit 8, Mississauga, ON L5W 1Z3',
  officePhone: '(905) 565-9565',
  people: [
    { name: 'Abdul-Jabbar Anjum', role: 'Team Lead', photo: 'https://ik.imagekit.io/remarketer/media/3759-20230123225913.jpg' },
    { name: 'Ali Jabbar', role: 'Real Estate Agent', photo: 'public/images/ali-jabbar.jpg' },
    { name: 'Umer Jabbar', role: 'Real Estate Agent', photo: 'public/images/umer-jabbar.jpg' },
  ],
};

const SRC = 'src/content/listings';
const OUT = 'public/brochures';
const manifest = existsSync('src/asset-manifest.json') ? JSON.parse(readFileSync('src/asset-manifest.json', 'utf8')) : {};
const F = (pkg, file) => `node_modules/@fontsource/${pkg}/files/${file}`;
const FONTS = {
  d7: F('bricolage-grotesque', 'bricolage-grotesque-latin-700-normal.woff'),
  d6: F('bricolage-grotesque', 'bricolage-grotesque-latin-600-normal.woff'),
  b4: F('hanken-grotesk', 'hanken-grotesk-latin-400-normal.woff'),
  b6: F('hanken-grotesk', 'hanken-grotesk-latin-600-normal.woff'),
};
const C = { black: '#2d2d2d', gold: '#b39b4f', goldDeep: '#77662a', paper: '#f8f6f0', ink: '#2d2d2d', muted: '#615c50', line: '#e4decf', soft: '#d9d3c2' };
const W = 612, H = 792, M = 48;

/** Local file for a picture: a path in the repo, or our saved copy of a web address. */
function localFile(src) {
  if (!src) return null;
  if (!/^https?:/.test(src)) return existsSync(src) ? src : null;
  const hit = manifest[src];
  const file = hit && path.join('public', hit.src);
  return file && existsSync(file) ? file : null;
}
async function picture(src, w, h, position = 'centre') {
  const file = localFile(src);
  if (!file) return null;
  return sharp(file).rotate().resize(Math.round(w * 2.6), Math.round(h * 2.6), { fit: 'cover', position }).jpeg({ quality: 82 }).toBuffer();
}

async function brochure(slug, d) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 0, info: { Title: `${d.address}, ${d.city}`, Author: TEAM.name } });
  const done = new Promise((res) => doc.pipe(createWriteStream(path.join(OUT, slug + '.pdf'))).on('finish', res));
  for (const [k, v] of Object.entries(FONTS)) doc.registerFont(k, v);
  const where = `${d.city} (${d.community}), Ontario ${d.postal}`;
  const pattern = doc.openImage(await sharp('public/images/c21-pattern.webp').resize(760).tint(C.gold).png({ compressionLevel: 9 }).toBuffer());
  let pageNo = 1;

  const place = async (src, x, y, w, h, radius = 0, position) => {
    const buf = await picture(src, w, h, position);
    doc.save();
    if (radius) doc.roundedRect(x, y, w, h, radius).clip();
    if (buf) doc.image(buf, x, y, { width: w, height: h });
    else doc.rect(x, y, w, h).fill(C.line);
    doc.restore();
    return !!buf;
  };
  const inner = (title) => {
    doc.addPage(); pageNo++;
    doc.font('b6').fontSize(8.5).fillColor(C.goldDeep).text(`${d.address}, ${d.city}`, M, 34, { lineBreak: false });
    doc.font('b4').fillColor(C.muted).text(`${d.status}  |  ${d.price}`, M, 34, { width: W - 2 * M, align: 'right' });
    doc.moveTo(M, 50).lineTo(W - M, 50).lineWidth(0.6).strokeColor(C.line).stroke();
    doc.moveTo(M, H - 46).lineTo(W - M, H - 46).stroke();
    doc.font('b4').fontSize(8.5).fillColor(C.muted).text(`${TEAM.name}  |  ${TEAM.phone}  |  ${TEAM.web}`, M, H - 36, { lineBreak: false });
    doc.text(String(pageNo), M, H - 36, { width: W - 2 * M, align: 'right' });
    doc.font('d7').fontSize(25).fillColor(C.ink).text(title, M, 70);
    doc.rect(M, 106, 38, 3).fill(C.gold);
    return 128;
  };

  // 1. Cover
  doc.rect(0, 0, W, H).fill(C.black);
  doc.save().opacity(0.09).image(pattern, W - 330, 430, { width: 520 }).restore();
  await place(d.photos[0]?.src, 0, 0, W, 408);
  doc.rect(0, 408, W, 4).fill(C.gold);
  doc.font('b6').fontSize(11).fillColor(C.gold).text(d.status, M, 444);
  doc.font('d7').fontSize(40).fillColor('#ffffff').text(d.address, M, 462, { width: W - 2 * M });
  doc.font('b4').fontSize(14).fillColor(C.soft).text(where, M, doc.y + 2);
  doc.font('d7').fontSize(30).fillColor(C.gold).text(d.price, M, doc.y + 16);
  const facts = [[d.beds, 'Bedrooms'], [d.baths, 'Washrooms'], [d.size, 'Living space'], [d.lot, 'Lot']];
  const fy = 632, fw = (W - 2 * M) / 4;
  doc.moveTo(M, fy - 16).lineTo(W - M, fy - 16).lineWidth(0.6).strokeColor('#555555').stroke();
  facts.forEach(([v, l], i) => {
    doc.font('d7').fontSize(v.length > 9 ? 13 : 19).fillColor('#ffffff').text(v, M + i * fw, v.length > 9 ? fy + 5 : fy, { width: fw - 8 });
    doc.font('b4').fontSize(9).fillColor(C.soft).text(l, M + i * fw, fy + 28, { width: fw - 8 });
  });
  doc.image('public/images/logo-white.png', M, 712, { width: 112 });
  doc.font('b4').fontSize(8.5).fillColor(C.soft).text(`${TEAM.brokerage}\nMLS® ${d.mls}`, M, 716, { width: W - 2 * M, align: 'right', lineGap: 3 });

  // 2. About this home
  let y = inner('About this home');
  const colW = 276, rightX = M + colW + 24, rightW = W - M - rightX;
  doc.font('b4').fontSize(11).fillColor(C.ink);
  let ty = y;
  for (const para of d.description) { doc.text(para, M, ty, { width: colW, lineGap: 4.5 }); ty = doc.y + 10; }
  let py = y + 2;
  for (const p of d.photos.slice(1, 3)) {
    await place(p.src, rightX, py, rightW, 172, 8);
    doc.font('b4').fontSize(8.5).fillColor(C.muted).text(p.caption, rightX, py + 177);
    py += 202;
  }
  y = Math.max(ty, py) + 14;
  doc.font('d7').fontSize(15).fillColor(C.ink).text('Highlights', M, y);
  y = doc.y + 8;
  const half = Math.ceil(d.highlights.length / 2), hw = (W - 2 * M - 24) / 2;
  let rowY = y;
  for (let i = 0; i < half; i++) {
    let rowH = 0;
    [d.highlights[i], d.highlights[i + half]].forEach((text, c) => {
      if (!text) return;
      const x = M + c * (hw + 24);
      doc.circle(x + 3, rowY + 6.5, 2.5).fill(C.gold);
      doc.font('b4').fontSize(10.5).fillColor(C.ink).text(text, x + 14, rowY, { width: hw - 14 });
      rowH = Math.max(rowH, doc.y - rowY);
    });
    rowY += rowH + 7;
  }

  // 3. Photos
  const gallery = d.photos.slice(3);
  for (let i = 0; i < gallery.length; i += 6) {
    y = inner(i === 0 ? 'Photo gallery' : 'More photos');
    const page = gallery.slice(i, i + 6);
    const gw = (W - 2 * M - 16) / 2, gh = page.length <= 4 ? 250 : 166;
    for (const [n, p] of page.entries()) {
      const x = M + (n % 2) * (gw + 16), gy = y + Math.floor(n / 2) * (gh + 30);
      await place(p.src, x, gy, gw, gh, 8);
      doc.font('b4').fontSize(8.5).fillColor(C.muted).text(p.caption, x, gy + gh + 6);
    }
  }

  // 4. Details
  y = inner('Property details');
  const tw = (W - 2 * M - 28) / 2, perCol = Math.ceil(d.details.length / 2);
  let maxY = y;
  d.details.forEach(([label, value], i) => {
    const c = Math.floor(i / perCol), x = M + c * (tw + 28);
    if (i % perCol === 0) rowY = y;
    doc.font('b4').fontSize(9.5).fillColor(C.muted).text(label, x, rowY + 6, { width: 92 });
    doc.font('b6').fontSize(9.5).fillColor(C.ink).text(String(value), x + 96, rowY + 6, { width: tw - 96 });
    rowY = Math.max(doc.y, rowY + 18) + 5;
    doc.moveTo(x, rowY).lineTo(x + tw, rowY).lineWidth(0.5).strokeColor(C.line).stroke();
    maxY = Math.max(maxY, rowY);
  });
  y = maxY + 20;
  // taxes callout + rooms
  doc.roundedRect(M, y, 196, 78, 8).fill(C.black);
  doc.font('b4').fontSize(9).fillColor(C.soft).text('Annual property taxes', M + 16, y + 15);
  doc.font('d7').fontSize(22).fillColor(C.gold).text(d.taxes, M + 16, y + 30);
  doc.font('b4').fontSize(7.5).fillColor(C.soft).text('As shown on the MLS® listing', M + 16, y + 58);
  const rx = M + 220, rw = (W - M - rx - 16) / 2;
  let roomsBottom = y + 78;
  d.rooms.forEach((group, i) => {
    const x = rx + i * (rw + 16);
    doc.font('d6').fontSize(11.5).fillColor(C.ink).text(group.level, x, y);
    doc.font('b4').fontSize(9.5).fillColor(C.ink).text(group.rooms.join('\n'), x, doc.y + 4, { width: rw, lineGap: 2.5 });
    roomsBottom = Math.max(roomsBottom, doc.y);
  });
  y = roomsBottom + 24;
  doc.font('d7').fontSize(15).fillColor(C.ink).text(`The neighbourhood: ${d.neighbourhood.name}`, M, y, { width: W - 2 * M });
  y = doc.y + 8;
  doc.font('b4').fontSize(10.5).fillColor(C.ink);
  for (const para of d.neighbourhood.text) { doc.text(para, M, y, { width: W - 2 * M, lineGap: 4 }); y = doc.y + 8; }

  // 5. Contact
  doc.addPage(); pageNo++;
  doc.rect(0, 0, W, H).fill(C.black);
  doc.save().opacity(0.08).image(pattern, W - 330, -80, { width: 520 }).restore();
  doc.image('public/images/logo-white.png', M, 52, { width: 120 });
  doc.font('d7').fontSize(38).fillColor('#ffffff').text('Book a showing', M, 128);
  doc.font('b4').fontSize(13).fillColor(C.soft).text(`To see ${d.address} in person, or to ask a question about it, call or text us. You will reach one of us directly.`, M, doc.y + 8, { width: 400, lineGap: 4 });
  doc.font('d7').fontSize(34).fillColor(C.gold).text(TEAM.phone, M, doc.y + 22);
  doc.font('b4').fontSize(12).fillColor('#ffffff').text(`${TEAM.email}   |   ${TEAM.web}`, M, doc.y + 6);
  const size = 132, gap = (W - 2 * M - 3 * size) / 2;
  const hy = 392;
  for (const [i, p] of TEAM.people.entries()) {
    const x = M + i * (size + gap);
    const buf = await picture(p.photo, size, size, 'top');
    doc.save().circle(x + size / 2, hy + size / 2, size / 2).clip();
    if (buf) doc.image(buf, x, hy, { width: size, height: size }); else doc.rect(x, hy, size, size).fill('#444444');
    doc.restore();
    doc.circle(x + size / 2, hy + size / 2, size / 2).lineWidth(2).strokeColor(C.gold).stroke();
    doc.font('d6').fontSize(13).fillColor('#ffffff').text(p.name, x - 20, hy + size + 14, { width: size + 40, align: 'center' });
    doc.font('b4').fontSize(9.5).fillColor(C.soft).text(p.role, x - 20, doc.y + 2, { width: size + 40, align: 'center' });
  }
  doc.moveTo(M, 624).lineTo(W - M, 624).lineWidth(0.6).strokeColor('#555555').stroke();
  doc.font('d6').fontSize(12).fillColor('#ffffff').text(TEAM.brokerage, M, 640);
  doc.font('b4').fontSize(9.5).fillColor(C.soft).text(`${TEAM.brokerageNote}\n${TEAM.office}\nOffice: ${TEAM.officePhone}`, M, doc.y + 3, { lineGap: 2.5 });
  doc.font('b4').fontSize(7).fillColor('#a9a392').text(
    `Listed by ${d.listedBy}, ${TEAM.brokerage}. MLS® ${d.mls}. Information is believed to be accurate but is not guaranteed and should be independently verified. Buyers should verify measurements, taxes and the permitted use of the lower level. Not intended to solicit buyers or sellers currently under contract with a brokerage. The trademarks MLS®, REALTOR® and the associated logos are owned or controlled by The Canadian Real Estate Association. Prepared ${new Date(d.updated).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}.`,
    M, 716, { width: W - 2 * M, lineGap: 1.5 });

  doc.end();
  await done;
  const missing = d.photos.filter((p) => !localFile(p.src)).length;
  console.log(`[brochure] ${slug}.pdf, ${pageNo} pages${missing ? `, ${missing} photos not available yet` : ''}`);
}

await mkdir(OUT, { recursive: true });
for (const file of existsSync(SRC) ? await readdir(SRC) : []) {
  if (!file.endsWith('.md')) continue;
  const data = parse((await readFile(path.join(SRC, file), 'utf8')).split(/^---$/m)[1]);
  if (data.draft) continue;
  await brochure(file.replace(/\.md$/, ''), data);
}
