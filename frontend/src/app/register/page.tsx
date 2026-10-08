"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi, ApiError } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Citizen'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // The API doesn't return a token on register, we might need to login right after
      const res = await fetchApi<{ message: string, user: any }>('/auth/register', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify(formData)
      });
      
      // Auto login after successful registration
      const loginRes = await fetchApi<{ token: string, user: any }>('/auth/login', {
        method: 'POST',
        requireAuth: false,
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      
      login(loginRes.token, loginRes.user);

      // Redirect based on role
      switch (loginRes.user.role) {
        case 'Administrator':
          router.push('/admin');
          break;
        case 'Citizen':
          router.push('/citizen');
          break;
        case 'Volunteer':
          router.push('/volunteer');
          break;
        case 'Donor':
          router.push('/donor');
          break;
        default:
          router.push('/');
      }

    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-8">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold mb-6">Create an Account</h2>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="form-control">
              <label className="label"><span className="label-text">Full Name</span></label>
              <input type="text" name="name" className="input input-bordered w-full" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" name="email" className="input input-bordered w-full" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Password</span></label>
              <input type="password" name="password" className="input input-bordered w-full" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Phone (Optional)</span></label>
              <input type="text" name="phone" className="input input-bordered w-full" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">I want to register as a:</span></label>
              <select name="role" className="select select-bordered w-full" value={formData.role} onChange={handleChange}>
                <option value="Citizen">Citizen (Report emergencies)</option>
                <option value="Volunteer">Volunteer (Help out)</option>
                <option value="Donor">Donor (Pledge resources)</option>
              </select>
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <Link href="/login" className="link link-primary">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
