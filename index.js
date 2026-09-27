const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const FILE_PATH = path.join(__dirname, 'data.json');

// Fungsi membaca data dari file
function bacaData() {
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    }
    const raw = fs.readFileSync(FILE_PATH);
    return JSON.parse(raw);
}

// Fungsi menyimpan data ke file
function simpanData(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

function getWaktuSekarang() {
    const sekarang = new Date();
    return sekarang.toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' WIB';
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
}

// Halaman Utama
app.get('/', (req, res) => {
    let catatanList = bacaData();
    let totalHarga = catatanList.reduce((acc, item) => acc + Number(item.harga || 0), 0);

    let htmlDaftar = catatanList.map((item, index) => 
        `<li style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 8px;">
            <div>
                <div><strong>${item.teks}</strong> - <span style="color: #28a745; font-weight: bold;">${formatRupiah(item.harga)}</span></div>
                <div style="font-size: 12px; color: #666; margin-top: 2px;">📅 <i>${item.waktu}</i></div>
            </div>
            <div>
                <a href="/hapus/${index}" style="color: red; text-decoration: none; font-weight: bold;">[Hapus]</a>
            </div>
        </li>`
    ).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Catatan Keuangan HP</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 15px; background-color: #f4f4f9; }
                .container { max-width: 500px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .form-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
                input[type="text"], input[type="number"] { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; }
                button { padding: 12px; background-color: #28a745; color: white; border: none; cursor: pointer; border-radius: 4px; font-size: 16px; font-weight: bold; }
                ul { padding-left: 0; list-style: none; }
                .total-box { background: #e9ecef; padding: 12px; border-radius: 6px; font-size: 16px; margin-top: 15px; text-align: right; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>📝 Catatan Keuangan</h2>
                <form action="/tambah" method="POST" class="form-group">
                    <input type="text" name="catatan" placeholder="Nama catatan/barang..." required />
                    <input type="number" name="harga" placeholder="Harga (Rp)" required />
                    <button type="submit">Tambah Catatan</button>
                </form>

                <h3>Daftar Pengeluaran:</h3>
                <ul>${htmlDaftar || '<li>Belum ada catatan.</li>'}</ul>

                <div class="total-box">
                    <strong>Total:</strong> 
                    <span style="color: #d9534f; font-size: 18px; font-weight: bold;">${formatRupiah(totalHarga)}</span>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Route Tambah Data
app.post('/tambah', (req, res) => {
    const { catatan, harga } = req.body;
    if (catatan) {
        let catatanList = bacaData();
        catatanList.push({
            teks: catatan,
            harga: Number(harga) || 0,
            waktu: getWaktuSekarang()
        });
        simpanData(catatanList);
    }
    res.redirect('/');
});

// Route Hapus Data
app.get('/hapus/:index', (req, res) => {
    let catatanList = bacaData();
    catatanList.splice(req.params.index, 1);
    simpanData(catatanList);
    res.redirect('/');
});

// Hanya jalankan app.listen di lokal (bukan di Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server aktif di port ${PORT}`);
  });
}

module.exports = app;