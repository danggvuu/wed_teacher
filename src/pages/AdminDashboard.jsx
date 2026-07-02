import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeachers, getRegistrations } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LogOut, Users, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('registrations');
  const [registrations, setRegistrations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

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
        <div className="flex space-x-4 mb-8">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {registrations.length > 0 ? (
                    registrations.map((r, idx) => (
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">
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
