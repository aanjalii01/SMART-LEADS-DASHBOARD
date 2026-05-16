import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Users } from "lucide-react";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { Button, Input } from "../components/ui";
import toast from "react-hot-toast";

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.password) e.password = "Password required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await authService.login(form.email, form.password);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success("Welcome back, " + res.data.user.name + "!");
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your SmartLeads account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input id="email" label="Email" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              error={errors.email} autoComplete="email" />
            <div className="relative">
              <Input id="password" label="Password" type={showPass ? "text" : "password"}
                placeholder="••••••••" value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                error={errors.password} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Sign In</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
