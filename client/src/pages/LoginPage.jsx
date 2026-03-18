import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Tên đăng nhập không được để trống')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function LoginPage() {
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (formData) => {
    setSubmitError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
          Đăng nhập hệ thống
        </h1>

        {submitError ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tên đăng nhập
            </label>
            <input
              type="text"
              {...register('username')}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
              placeholder="Nhập tên đăng nhập"
            />
            <FieldError message={errors.username?.message} />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
              placeholder="Nhập mật khẩu"
            />
            <FieldError message={errors.password?.message} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-md bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
