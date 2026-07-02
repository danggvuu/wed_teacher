const SCRIPT_PROP = PropertiesService.getScriptProperties();

// Cấu hình (Thay đổi mật khẩu ở đây nếu cần)
const ADMIN_PASSWORD = 'admin123'; // Mật khẩu đăng nhập admin
const TOKEN_SECRET = 'token_secret_xyz_123'; // Chuỗi ký bí mật giả lập

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty("key", doc.getId());
  
  // Tạo sheet DangKy nếu chưa có
  if (!doc.getSheetByName("DangKy")) {
    const sheet = doc.insertSheet("DangKy");
    sheet.appendRow(["Timestamp", "Tên giáo viên", "Tên học sinh", "Lớp", "Trường", "Tên phụ huynh", "SĐT", "Khung giờ mong muốn", "Mục tiêu học", "Ghi chú", "Trạng thái"]);
  } else {
    // Thêm cột Trạng thái nếu chưa có (cập nhật sheet cũ)
    const sheet = doc.getSheetByName("DangKy");
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.indexOf("Trạng thái") === -1) {
      sheet.getRange(1, headers.length + 1).setValue("Trạng thái");
    }
  }
  
  // Tạo sheet GiaoVien nếu chưa có
  if (!doc.getSheetByName("GiaoVien")) {
    const sheet = doc.insertSheet("GiaoVien");
    sheet.appendRow(["ID", "Tên", "Ảnh", "Môn dạy", "Cấp lớp", "Kinh nghiệm", "Bằng cấp", "Thành tích", "Học phí", "Lịch dạy", "Địa điểm", "SĐT", "Zalo", "Facebook", "Trạng thái"]);
  }
  
  // Tạo sheet LichHoc nếu chưa có
  if (!doc.getSheetByName("LichHoc")) {
    const sheet = doc.insertSheet("LichHoc");
    sheet.appendRow(["ID_GiaoVien", "Mã Ca", "Mô tả", "Sĩ số hiện tại", "Trạng thái"]);
  }
  
  // Tạo sheet DanhGia nếu chưa có
  if (!doc.getSheetByName("DanhGia")) {
    const sheet = doc.insertSheet("DanhGia");
    sheet.appendRow(["ID_GiaoVien", "Tên", "Chi tiết", "Nội dung", "Số sao", "Trạng thái"]);
  }
}

// Xử lý các yêu cầu GET (dữ liệu công khai)
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getTeachers') {
      return handleGetTeachers();
    } else if (action === 'getTeacher') {
      return handleGetTeacher(e.parameter.slug);
    } else if (action === 'getRegistrations') {
      return handleGetRegistrations(e.parameter.token);
    } else if (action === 'getSchedule') {
      return handleGetSchedule(e.parameter.teacherId);
    } else if (action === 'getTestimonials') {
      return handleGetTestimonials(e.parameter.teacherId);
    }
    
    return jsonResponse({status: 'error', message: 'Action không hợp lệ'}, 400);
  } catch(error) {
    return jsonResponse({status: 'error', message: error.toString()}, 500);
  }
}

// Xử lý các yêu cầu POST (cập nhật dữ liệu hoặc yêu cầu bảo mật)
function doPost(e) {
  try {
    // Parser data từ POST body
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || e.parameter.action;
    
    if (action === 'register') {
      return handleRegister(postData.data);
    } else if (action === 'login') {
      return handleLogin(postData.password);
    } else if (action === 'addTeacher') {
      return handleAddTeacher(postData.token, postData.data);
    } else if (action === 'updateTeacher') {
      return handleUpdateTeacher(postData.token, postData.data);
    } else if (action === 'deleteTeacher') {
      return handleDeleteTeacher(postData.token, postData.id);
    } else if (action === 'updateRegistrationStatus') {
      return handleUpdateRegistrationStatus(postData.token, postData.rowId, postData.status);
    }
    
    return jsonResponse({status: 'error', message: 'Action không hợp lệ'}, 400);
  } catch(error) {
    return jsonResponse({status: 'error', message: error.toString()}, 500);
  }
}

// --- HANDLERS ---

function handleGetTeachers() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName("GiaoVien");
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return jsonResponse({status: 'success', data: []});
  
  const headers = data[0];
  const teachers = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[14] ? row[14].toString().toLowerCase().trim() : '';
    // Lấy giáo viên nếu trạng thái không phải là "ẩn" (bỏ trống = hiện)
    if (status !== 'ẩn') {
      let teacher = {};
      headers.forEach((header, index) => {
        teacher[header] = row[index];
      });
      teachers.push(teacher);
    }
  }
  
  return jsonResponse({status: 'success', data: teachers});
}

function handleGetTeacher(slug) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName("GiaoVien");
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return jsonResponse({status: 'error', message: 'Không tìm thấy giáo viên'});
  
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[14] ? row[14].toString().toLowerCase().trim() : '';
    // Fix: Chuyển id trong sheet về string để so sánh
    if (row[0] !== undefined && row[0].toString() === slug.toString() && status !== 'ẩn') {
      let teacher = {};
      headers.forEach((header, index) => {
        teacher[header] = row[index];
      });
      return jsonResponse({status: 'success', data: teacher});
    }
  }
  
  return jsonResponse({status: 'error', message: 'Không tìm thấy giáo viên'}, 404);
}

function handleRegister(data) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName("DangKy");
  
  const timestamp = new Date();
  
  // Row: ["Timestamp", "Tên giáo viên", "Tên học sinh", "Lớp", "Trường", "Tên phụ huynh", "SĐT", "Khung giờ mong muốn", "Mục tiêu học", "Ghi chú", "Trạng thái"]
  sheet.appendRow([
    timestamp,
    data.teacherName || '',
    data.studentName || '',
    data.grade || '',
    data.school || '',
    data.parentName || '',
    // Thêm dấu nháy đơn trước SĐT để Google Sheet hiểu là dạng Text, không bị mất số 0
    data.phone ? "'" + data.phone : '',
    data.timeSlot || '',
    data.goal || '',
    data.note || '',
    'Mới' // Trạng thái mặc định
  ]);
  
  return jsonResponse({status: 'success', message: 'Đăng ký thành công'});
}

function handleGetSchedule(teacherId) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName("LichHoc");
  if (!sheet) return jsonResponse({status: 'success', data: []});
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse({status: 'success', data: []});
  
  const headers = data[0];
  const schedules = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] !== undefined && row[0].toString() === teacherId.toString()) {
      let schedule = {};
      headers.forEach((header, index) => {
        schedule[header] = row[index];
      });
      schedules.push(schedule);
    }
  }
  
  return jsonResponse({status: 'success', data: schedules});
}

function handleGetTestimonials(teacherId) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName("DanhGia");
  if (!sheet) return jsonResponse({status: 'success', data: []});
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse({status: 'success', data: []});
  
  const headers = data[0];
  const testimonials = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[5] ? row[5].toString().toLowerCase().trim() : '';
    if (row[0] !== undefined && row[0].toString() === teacherId.toString() && status !== 'ẩn') {
      let testimonial = {};
      headers.forEach((header, index) => {
        testimonial[header] = row[index];
      });
      testimonials.push(testimonial);
    }
  }
  
  return jsonResponse({status: 'success', data: testimonials});
}

function handleLogin(password) {
  if (password === ADMIN_PASSWORD) {
    // Trả về token tĩnh đơn giản (do không có CSDL)
    return jsonResponse({status: 'success', token: TOKEN_SECRET});
  }
  return jsonResponse({status: 'error', message: 'Mật khẩu không đúng'}, 401);
}

function verifyToken(token) {
  return token === TOKEN_SECRET;
}

function handleGetRegistrations(token) {
  if (!verifyToken(token)) {
    return jsonResponse({status: 'error', message: 'Unauthorized'}, 401);
  }
  
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName("DangKy");
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return jsonResponse({status: 'success', data: []});
  
  const headers = data[0];
  const registrations = [];
  
  for (let i = data.length - 1; i >= 1; i--) { // Đảo ngược để lấy mới nhất lên đầu
    const row = data[i];
    let reg = { rowId: i + 1 }; // Lưu lại số thứ tự dòng để update
    headers.forEach((header, index) => {
      reg[header] = row[index];
    });
    registrations.push(reg);
  }
  
  return jsonResponse({status: 'success', data: registrations});
}

function handleUpdateRegistrationStatus(token, rowId, status) {
  if (!verifyToken(token)) {
    return jsonResponse({status: 'error', message: 'Unauthorized'}, 401);
  }
  
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName("DangKy");
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusColIndex = headers.indexOf("Trạng thái") + 1;
  
  if (statusColIndex <= 0) {
    return jsonResponse({status: 'error', message: 'Cột Trạng thái không tồn tại'}, 400);
  }
  
  sheet.getRange(rowId, statusColIndex).setValue(status);
  
  return jsonResponse({status: 'success', message: 'Cập nhật trạng thái thành công'});
}

// Hàm tiện ích
function jsonResponse(data, status = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// Xử lý thêm CORS cho các request preflight của trình duyệt
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);
  // Apps Script không cho set headers trực tiếp dễ dàng vào response object,
  // nên thông thường nó sẽ trả về tự động CORS từ domain Google.
  return output;
}
