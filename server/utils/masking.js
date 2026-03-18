// ============================================================
// Masking - Che dữ liệu nhạy cảm (không dùng hàm có sẵn)
// ============================================================

// Đếm độ dài chuỗi (không dùng .length)
function layDoDai(str) {
  var dem = 0;
  while (str[dem] !== undefined) {
    dem = dem + 1;
  }
  return dem;
}

// Cắt chuỗi từ vị trí start đến end (không bao gồm end)
function catChuoi(str, start, end) {
  var ketQua = '';
  for (var i = start; i < end; i = i + 1) {
    if (str[i] !== undefined) {
      ketQua = ketQua + str[i];
    }
  }
  return ketQua;
}

// Lặp ký tự c đúng n lần
function lapKyTu(c, n) {
  var ketQua = '';
  for (var i = 0; i < n; i = i + 1) {
    ketQua = ketQua + c;
  }
  return ketQua;
}

// "0987654321" → "0987****21"
function maskPhone(phone) {
  var len = layDoDai(phone);
  if (len < 6) return lapKyTu('*', 4);
  var dau = catChuoi(phone, 0, 4);
  var cuoi = catChuoi(phone, len - 2, len);
  return dau + lapKyTu('*', 4) + cuoi;
}

// "012345678901" → "********8901"
function maskIdNumber(idNumber) {
  var len = layDoDai(idNumber);
  if (len < 4) return lapKyTu('*', 4);
  var cuoi = catChuoi(idNumber, len - 4, len);
  return lapKyTu('*', 8) + cuoi;
}

// "123 Đường ABC, Quận 1" → "123 Đường ****"
function maskAddress(address) {
  var len = layDoDai(address);
  if (len < 10) return lapKyTu('*', 4);
  var dau = catChuoi(address, 0, 10);
  return dau + lapKyTu('*', 4);
}

module.exports = { maskPhone, maskIdNumber, maskAddress };
