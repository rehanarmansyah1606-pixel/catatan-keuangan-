const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS sebagai view engine (jika menggunakan EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Jalur file yang aman untuk Vercel Serverless
const FILE_PATH = process.env.VERCEL || process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'catatan.json')
  : path.join(__dirname, 'catatan.json');

// Fungsi membaca data aman
function bacaData() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return [];
  }
}

// Fungsi menyimpan data aman
function simpanData(data) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
  }
}

// Route Utama
app.get('/', (req, res) => {
  const catatanList = bacaData();
  res.render('index', { catatanList });
});

// Route Tambah Data
app.post('/tambah', (req, res) => {
  const catatanList = bacaData();
  const dataBaru = req.body;
  catatanList.push(dataBaru);
  simpanData(catatanList);
  res.redirect('/');
});

// Route Hapus Data
app.get('/hapus/:index', (req, res) => {
  const catatanList = bacaData();
  const index = parseInt(req.params.index, 10);
  if (!isNaN(index) && index >= 0 && index < catatanList.length) {
    catatanList.splice(index, 1);
    simpanData(catatanList);
  }
  res.redirect('/');
});

// Menjalankan server secara lokal
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server aktif di port ${PORT}`);
  });
}

// Export aplikasi untuk Vercel
module.exports = app;