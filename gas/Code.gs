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
    sheet.appendRow(["Timestamp", "Tên giáo viên", "Tên học sinh", "Lớp", "Trường", "Tên phụ huynh", "SĐT", "Khung giờ mong muốn", "Mục tiêu học", "Ghi chú"]);
  }
  
  // Tạo sheet GiaoVien nếu chưa có
  if (!doc.getSheetByName("GiaoVien")) {
    const sheet = doc.insertSheet("GiaoVien");
    sheet.appendRow(["ID", "Tên", "Ảnh", "Môn dạy", "Cấp lớp", "Kinh nghiệm", "Bằng cấp", "Thành tích", "Học phí", "Lịch dạy", "Địa điểm", "SĐT", "Zalo", "Facebook", "Trạng thái"]);
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
    } else if (action === 'getRegistrations') { // Nên dùng POST cho bảo mật, nhưng để GET cho dễ gọi cũng được nếu truyền token
      return handleGetRegistrations(e.parameter.token);
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
    // Chỉ lấy giáo viên có trạng thái "Hiện"
    if (row[14] && row[14].toString().toLowerCase() !== 'ẩn') {
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
    if (row[0] === slug && row[14].toString().toLowerCase() !== 'ẩn') {
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
  
  // Row: ["Timestamp", "Tên giáo viên", "Tên học sinh", "Lớp", "Trường", "Tên phụ huynh", "SĐT", "Khung giờ mong muốn", "Mục tiêu học", "Ghi chú"]
  sheet.appendRow([
    timestamp,
    data.teacherName || '',
    data.studentName || '',
    data.grade || '',
    data.school || '',
    data.parentName || '',
    data.phone || '',
    data.timeSlot || '',
    data.goal || '',
    data.note || ''
  ]);
  
  return jsonResponse({status: 'success', message: 'Đăng ký thành công'});
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
    let reg = {};
    headers.forEach((header, index) => {
      reg[header] = row[index];
    });
    registrations.push(reg);
  }
  
  return jsonResponse({status: 'success', data: registrations});
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
