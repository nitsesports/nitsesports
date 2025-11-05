import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase.js";

const Login = () => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location && location.state && location.state.from) ?? "/";
  const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL;

  // Email validation for NITS institute and external users
  const isValidEmail = (emailValue) => {
    const nitsEmailPattern = /^[a-zA-Z0-9_]+_ug_\d{2}@[a-zA-Z0-9]+\.nits\.ac\.in$/;
    const generalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return nitsEmailPattern.test(emailValue) || generalEmailPattern.test(emailValue);
  };

  const getEmailValidationMessage = (emailValue) => {
    const nitsEmailPattern = /^[a-zA-Z0-9_]+_ug_\d{2}@[a-zA-Z0-9]+\.nits\.ac\.in$/;
    const generalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nitsEmailPattern.test(emailValue)) {
      return { valid: true, message: "NITS institute email" };
    }

    if (generalEmailPattern.test(emailValue)) {
      return { valid: true, message: "External email" };
    }

    if (emailValue.includes("@nits.ac.in")) {
      return { valid: false, message: 'Invalid NITS email format. Use: name_ug_year@branch.nits.ac.in' };
    }

    return { valid: false, message: "Invalid email format" };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(redirect, { replace: true });
    });
  }, [navigate, redirect]);

  const onLogin = async () => {
    if (!isValidEmail(email)) {
      const validation = getEmailValidationMessage(email);
      return toast.error(validation.message);
    }

    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast.error(error.message);

    // if logging in as admin, verify allowed email
    if (role === "admin") {
      const userEmail = data?.user?.email ?? email;
      if (allowedEmail && userEmail !== allowedEmail) {
        await supabase.auth.signOut();
        return toast.error("Unauthorized admin account");
      }
      // success, navigate to admin
      toast.success("Welcome admin");
      navigate("/admin", { replace: true });
      return;
    }

    toast.success("Welcome");
    navigate(redirect, { replace: true });
  };

  const onRegister = async () => {
    if (role === "admin") return toast.error("Admin registration not allowed");

    if (!isValidEmail(email)) {
      const validation = getEmailValidationMessage(email);
      return toast.error(validation.message);
    }

    if (!password || password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) return toast.error(signUpError.message);

    // Automatically sign in after registration
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      toast.error("Registration successful, but auto-login failed. Please sign in manually.");
      return;
    }

    toast.success("Welcome!");
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <Card className="mx-auto w-full max-w-md glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl">Sign in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant={role === 'user' ? 'default' : 'ghost'} className="flex-1" onClick={() => setRole('user')}>User</Button>
              <Button variant={role === 'admin' ? 'default' : 'ghost'} className="flex-1" onClick={() => setRole('admin')}>Admin</Button>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <p className="text-xs text-muted-foreground">
                {email && getEmailValidationMessage(email).valid ? (
                  <span className="text-green-500">✓ {getEmailValidationMessage(email).message}</span>
                ) : (
                  <span>NITS: name_ug_year@branch.nits.ac.in | External: any email</span>
                )}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••���•••••" />
            </div>
            <div className="flex gap-2">
              <Button className="w-full" onClick={onLogin}>{role === 'admin' ? 'Login as Admin' : 'Login'}</Button>
              <Button variant="outline" className="w-full" onClick={onRegister} disabled={role === 'admin'}>{role === 'admin' ? 'Disabled' : 'Sign Up'}</Button>
            </div>
            {role === 'admin' && (
              <p className="text-xs text-muted-foreground">Admin login requires the account set in VITE_ADMIN_EMAIL.</p>
            )}
            {role === 'user' && (
              <p className="text-xs text-muted-foreground">Use your email and password. New here? Click Register to create an account and sign in instantly.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
