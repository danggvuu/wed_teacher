import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeachers, getRegistrations, updateRegistrationStatus } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LogOut, Users, BookOpen, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('registrations');
  const [registrations, setRegistrations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRow, setUpdatingRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    async function loadData() {
      try {
        const [regRes, teacherRes] = await Promise.all([
          getRegistrations(token).catch(() => ({ data: [] })),
          getTeachers().catch(() => ({ data: [] }))
        ]);
        
        setRegistrations(regRes.data || []);
        setTeachers(teacherRes.data || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu admin", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleUpdateStatus = async (rowId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    setUpdatingRow(rowId);
    try {
      const token = localStorage.getItem('adminToken');
      await updateRegistrationStatus(token, rowId, newStatus);
      // Update local state
      setRegistrations(prev => prev.map(r => 
        r.rowId === rowId ? { ...r, 'Trạng thái': newStatus } : r
      ));
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái", err);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setUpdatingRow(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  const filteredRegistrations = statusFilter === 'All' 
    ? registrations 
    : registrations.filter(r => (r['Trạng thái'] || 'Mới') === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Mới': return 'bg-blue-100 text-blue-700';
      case 'Chưa liên hệ': return 'bg-red-100 text-red-700';
      case 'Đã gọi (Đang suy nghĩ)': return 'bg-yellow-100 text-yellow-700';
      case 'Hẹn học thử': return 'bg-purple-100 text-purple-700';
      case 'Đã nộp học phí (Chính thức)': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-xl text-slate-900">Admin Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <Button 
              variant={activeTab === 'registrations' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('registrations')}
            >
              <Users className="w-4 h-4 mr-2" />
              Danh sách đăng ký ({registrations.length})
            </Button>
            <Button 
              variant={activeTab === 'teachers' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('teachers')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Quản lý giáo viên ({teachers.length})
            </Button>
          </div>
          
          {activeTab === 'registrations' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Lọc trạng thái:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border-slate-200 rounded-lg px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">Tất cả</option>
                <option value="Mới">Mới</option>
                <option value="Chưa liên hệ">🔴 Chưa liên hệ</option>
                <option value="Đã gọi (Đang suy nghĩ)">🟡 Đã gọi</option>
                <option value="Hẹn học thử">🔵 Hẹn học thử</option>
                <option value="Đã nộp học phí (Chính thức)">🟢 Đã nộp học phí</option>
              </select>
            </div>
          )}
        </div>

        {activeTab === 'registrations' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600">Thời gian</th>
                    <th className="p-4 font-semibold text-slate-600">Học sinh (Lớp)</th>
                    <th className="p-4 font-semibold text-slate-600">Phụ huynh (SĐT)</th>
                    <th className="p-4 font-semibold text-slate-600">Khung giờ</th>
                    <th className="p-4 font-semibold text-slate-600">Giáo viên</th>
                    <th className="p-4 font-semibold text-slate-600">Trạng thái (CRM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((r, idx) => {
                      const status = r['Trạng thái'] || 'Mới';
                      return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-4 text-slate-500">{new Date(r.Timestamp || Date.now()).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{r['Tên học sinh']}</div>
                          <div className="text-xs text-slate-500">Lớp {r['Lớp']} • {r['Trường']}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{r['Tên phụ huynh']}</div>
                          <div className="text-blue-600">{r['SĐT']}</div>
                        </td>
                        <td className="p-4 text-slate-600">{r['Khung giờ mong muốn']}</td>
                        <td className="p-4 text-slate-600">{r['Tên giáo viên']}</td>
                        <td className="p-4">
                          <div className="relative inline-block w-full min-w-[180px]">
                            <select
                              value={status}
                              onChange={(e) => handleUpdateStatus(r.rowId, status, e.target.value)}
                              disabled={updatingRow === r.rowId}
                              className={`appearance-none w-full border-none text-sm font-semibold rounded-full px-4 py-1.5 pr-8 focus:ring-2 focus:ring-slate-200 cursor-pointer transition-colors ${getStatusColor(status)} ${updatingRow === r.rowId ? 'opacity-50' : ''}`}
                            >
                              <option value="Mới">Mới</option>
                              <option value="Chưa liên hệ">🔴 Chưa liên hệ</option>
                              <option value="Đã gọi (Đang suy nghĩ)">🟡 Đã gọi</option>
                              <option value="Hẹn học thử">🔵 Hẹn học thử</option>
                              <option value="Đã nộp học phí (Chính thức)">🟢 Đã nộp học phí</option>
                            </select>
                            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${getStatusColor(status).split(' ')[1]}`} />
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        Chưa có lượt đăng ký nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'teachers' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button>+ Thêm giáo viên</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.length > 0 ? (
                teachers.map((t, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <img src={t['Ảnh']} alt={t['Tên']} className="w-16 h-16 rounded-full object-cover bg-slate-200" />
                        <div>
                          <h3 className="font-bold text-slate-900">{t['Tên']}</h3>
                          <p className="text-sm text-slate-500">{t['Môn dạy']}</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">Sửa</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                  Chưa có giáo viên nào hoặc chưa kết nối Google Sheets.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
