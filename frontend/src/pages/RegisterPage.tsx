import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Users } from "lucide-react";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { Button, Input, Select } from "../components/ui";
import toast from "react-hot-toast";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "sales" });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await authService.register(form.name, form.email, form.password, form.role);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Registration failed";
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
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Start managing your leads today</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input id="name" label="Full Name" placeholder="Rahul Sharma"
              value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              error={errors.name} autoComplete="name" />
            <Input id="email" label="Email" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              error={errors.email} autoComplete="email" />
            <div className="relative">
              <Input id="password" label="Password" type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                error={errors.password} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Select id="role" label="Role" value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="sales">Sales User</option>
              <option value="admin">Admin</option>
            </Select>
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
