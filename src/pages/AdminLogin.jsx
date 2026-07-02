import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BookOpen, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await loginAdmin(password);
      if (res.status === 'success') {
        localStorage.setItem('adminToken', res.token);
        navigate('/admin');
      } else {
        setError(res.message || 'Mật khẩu không đúng');
      }
    } catch (err) {
      // Fallback cho local dev khi chưa cài GAS
      if (password === 'admin123') {
        localStorage.setItem('adminToken', 'mock_token');
        navigate('/admin');
      } else {
        setError('Lỗi kết nối hoặc sai mật khẩu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Quản trị viên</h1>
          <p className="text-sm text-slate-500 mt-2">Vui lòng nhập mật khẩu để tiếp tục</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            autoFocus
          />
          
          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  );
}
