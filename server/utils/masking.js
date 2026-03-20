
function layDoDai(str) {
  var dem = 0;
  while (str[dem] !== undefined) {
    dem = dem + 1;
  }
  return dem;
}

function catChuoi(str, start, end) {
  var ketQua = '';
  for (var i = start; i < end; i = i + 1) {
    if (str[i] !== undefined) {
      ketQua = ketQua + str[i];
    }
  }
  return ketQua;
}

function lapKyTu(c, n) {
  var ketQua = '';
  for (var i = 0; i < n; i = i + 1) {
    ketQua = ketQua + c;
  }
  return ketQua;
}

function timViTriKyTu(str, kyTu) {
  var i = 0;
  while (str[i] !== undefined) {
    if (str[i] === kyTu) {
      return i;
    }
    i = i + 1;
  }
  return -1;
}

function timViTriKyTuCuoi(str, kyTu) {
  var viTri = -1;
  var i = 0;
  while (str[i] !== undefined) {
    if (str[i] === kyTu) {
      viTri = i;
    }
    i = i + 1;
  }
  return viTri;
}

function laChuSo(c) {
  return c >= '0' && c <= '9';
}

function demChuSo(str) {
  var dem = 0;
  var i = 0;
  while (str[i] !== undefined) {
    if (laChuSo(str[i])) {
      dem = dem + 1;
    }
    i = i + 1;
  }
  return dem;
}

function maskChuoiTheoChuSo(str, soDau, soCuoi) {
  var tongChuSo = demChuSo(str);
  if (tongChuSo < soDau + soCuoi) {
    return lapKyTu('*', 4);
  }

  var ketQua = '';
  var daGap = 0;
  var i = 0;

  while (str[i] !== undefined) {
    if (laChuSo(str[i])) {
      daGap = daGap + 1;
      if (daGap <= soDau || daGap > tongChuSo - soCuoi) {
        ketQua = ketQua + str[i];
      } else {
        ketQua = ketQua + '*';
      }
    } else {
      ketQua = ketQua + str[i];
    }

    i = i + 1;
  }

  return ketQua;
}

function maskPhone(phone) {
  if (demChuSo(phone) < 6) {
    return lapKyTu('*', 4);
  }

  return maskChuoiTheoChuSo(phone, 4, 2);
}

function maskIdNumber(idNumber) {
  if (demChuSo(idNumber) === 0) {
    return lapKyTu('*', 4);
  }

  return maskChuoiTheoChuSo(idNumber, 0, 0);
}

function maskEmail(email) {
  var len = layDoDai(email);
  var viTriA = timViTriKyTu(email, '@');

  if (viTriA <= 0 || viTriA >= len - 1) {
    return lapKyTu('*', 6);
  }

  var phanTen = catChuoi(email, 0, viTriA);
  var phanMien = catChuoi(email, viTriA + 1, len);
  var doDaiTen = layDoDai(phanTen);
  var doDaiMien = layDoDai(phanMien);

  if (doDaiTen === 0 || doDaiMien === 0) {
    return lapKyTu('*', 6);
  }

  var viTriChamCuoi = timViTriKyTuCuoi(phanMien, '.');
  var tenMien = viTriChamCuoi === -1 ? phanMien : catChuoi(phanMien, 0, viTriChamCuoi);
  var hauToMien = viTriChamCuoi === -1 ? '' : catChuoi(phanMien, viTriChamCuoi, doDaiMien);
  var dauTen = catChuoi(phanTen, 0, doDaiTen > 1 ? 2 : 1);
  var dauMien = layDoDai(tenMien) > 0 ? catChuoi(tenMien, 0, 1) : '';

  return dauTen + lapKyTu('*', 4) + '@' + dauMien + lapKyTu('*', 3) + hauToMien;
}

function maskAddress(address) {
  var len = layDoDai(address);
  if (len < 6) {
    return lapKyTu('*', 6);
  }

  var dau = catChuoi(address, 0, 6);
  return dau + lapKyTu('*', 6);
}

function maskSensitiveText(text) {
  if (!text) {
    return '';
  }

  var ketQua = text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, function (email) {
    return maskEmail(email);
  });

  ketQua = ketQua.replace(/\b0\d{11}\b/g, function (idNumber) {
    return maskIdNumber(idNumber);
  });

  ketQua = ketQua.replace(/\+?\d[\d\s.-]{6,}\d/g, function (phone) {
    var soChuSo = demChuSo(phone);
    if (soChuSo < 8 || soChuSo > 20) {
      return phone;
    }

    return maskPhone(phone);
  });

  return ketQua;
}

module.exports = {
  maskPhone,
  maskIdNumber,
  maskEmail,
  maskAddress,
  maskSensitiveText
};
