import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Debug: Get current origin for Google OAuth setup
const getCurrentOrigin = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "unknown";
};

const Login = () => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ separate loading states
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const navigate = useNavigate();
const redirect =
  sessionStorage.getItem("post_login_redirect") || "/events";

  const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL;

  // ✅ Email validation for NITS & external users
  const isValidEmail = (emailValue) => {
    const nitsEmailPattern = /^[a-zA-Z0-9_]+_(ug|pg)_\d{2}@[a-zA-Z0-9]+\.nits\.ac\.in$/;
    const generalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return nitsEmailPattern.test(emailValue) || generalEmailPattern.test(emailValue);
  };

  const getEmailValidationMessage = (emailValue) => {
    const nitsEmailPattern = /^[a-zA-Z0-9_]+_(ug|pg)_\d{2}@[a-zA-Z0-9]+\.nits\.ac\.in$/;
    const generalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (nitsEmailPattern.test(emailValue)) return { valid: true, message: "NITS institute email" };
    if (generalEmailPattern.test(emailValue)) return { valid: true, message: "External email" };
    if (emailValue.includes("@nits.ac.in"))
      return { valid: false, message: "Invalid NITS email format. Use: name_ug_year@branch.nits.ac.in" };
    return { valid: false, message: "Invalid email format" };
  };

  // ✅ Check active session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(redirect, { replace: true });
    });
  }, [navigate, redirect]);

  // ✅ Google One Tap integration
  useEffect(() => {
    const loadGoogleOneTap = async () => {
      if (!window.google || !GOOGLE_CLIENT_ID) return;

      try {
        // Suppress GSI Logger console messages
        if (window.__GOOGLE_INITIALIZATION_STARTED__) return;
        window.__GOOGLE_INITIALIZATION_STARTED__ = true;

        // Log current origin for debugging
        const currentOrigin = getCurrentOrigin();
        console.log(
          `%c[NITS Esports Auth] %cCurrent Origin: ${currentOrigin}`,
          "background: #10b981; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
          "color: #10b981; font-weight: bold;"
        );
        console.log(
          "%c[NITS Esports Auth] If Google Sign-In shows origin error, add this URL to Google Cloud Console:",
          "color: #f59e0b; font-weight: bold;"
        );
        console.log(`%c${currentOrigin}`, "color: #3b82f6; font-weight: bold; font-size: 14px;");

        const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
        const encoder = new TextEncoder();
        const encodedNonce = encoder.encode(nonce);
        const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: response.credential,
                nonce,
              });
              if (error) throw error;
              toast.success("Signed in with Google");

              const target = redirect;
              sessionStorage.removeItem("post_login_redirect");

              navigate(target, { replace: true });

            } catch (err) {
              toast.error("Google sign-in failed");
              console.error(err);
            }
          },
          nonce: hashedNonce,
          use_fedcm_for_prompt: false,
        });

        try {
          window.google.accounts.id.prompt();
        } catch (err) {
          // Origin not authorized - expected during Google Cloud setup
          console.debug("Google One Tap unavailable - domain needs authorization in Google Cloud Console");
        }
      } catch (err) {
        console.error("Error loading Google One Tap:", err);
      }
    };

    const timeout = setTimeout(loadGoogleOneTap, 700);
    return () => clearTimeout(timeout);
  }, [navigate, redirect]);

  // ✅ Google login button
  const onGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error("Google login failed");
      console.error(err);
    } finally {
      setLoadingGoogle(false);
    }
  };

  // ✅ Email/password login
  const onLogin = async () => {
    if (!isValidEmail(email)) {
      const validation = getEmailValidationMessage(email);
      return toast.error(validation.message);
    }

    setLoadingLogin(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setLoadingLogin(false);

    if (error) return toast.error(error.message);

    if (role === "admin") {
      const userEmail = data?.user?.email ?? email;
      if (allowedEmail && userEmail !== allowedEmail) {
        await supabase.auth.signOut();
        return toast.error("Unauthorized admin account");
      }
      toast.success("Welcome admin");
      navigate("/admin", { replace: true });
      return;
    }

    toast.success("Welcome Again!");

const target = redirect;
sessionStorage.removeItem("post_login_redirect");

navigate(target, { replace: true });

  };

  // ✅ Register new user
  const onRegister = async () => {
    if (role === "admin") return toast.error("Admin registration not allowed");
    if (!isValidEmail(email)) {
      const validation = getEmailValidationMessage(email);
      return toast.error(validation.message);
    }
    if (!password || password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoadingSignup(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setLoadingSignup(false);
      return toast.error(signUpError.message);
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoadingSignup(false);

    if (signInError) {
      toast.error("Registration successful, but auto-login failed. Please sign in manually.");
      return;
    }

    toast.success("Welcome!");

const target = redirect;
sessionStorage.removeItem("post_login_redirect");

navigate(target, { replace: true });

  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <Card className="mx-auto w-full max-w-md glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl">Sign in</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Role Toggle */}
            <div className="flex gap-2">
              <Button variant={role === "user" ? "default" : "ghost"} className="flex-1" onClick={() => setRole("user")}>
                User
              </Button>
              <Button variant={role === "admin" ? "default" : "ghost"} className="flex-1" onClick={() => setRole("admin")}>
                Admin
              </Button>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <p className="text-xs text-muted-foreground">
                {email && getEmailValidationMessage(email).valid ? (
                  <span className="text-green-500">✓ {getEmailValidationMessage(email).message}</span>
                ) : (
                  <span>NIT Silchar students use their institutional email</span>
                )}
              </p>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button className="w-full" onClick={onLogin} disabled={loadingLogin || loadingSignup || loadingGoogle}>
                {loadingLogin ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Logging in...
                  </div>
                ) : role === "admin" ? (
                  "Login as Admin"
                ) : (
                  "Login"
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={onRegister}
                disabled={loadingSignup || role === "admin" || loadingLogin || loadingGoogle}
              >
                {loadingSignup ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Signing up...
                  </div>
                ) : role === "admin" ? (
                  "Disabled"
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>

            {/* Google Sign In */}
            <div className="pt-2 space-y-3">
              <Button variant="outline" className="w-full" onClick={onGoogleLogin} disabled={loadingGoogle}>
                {loadingGoogle ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Connecting...
                  </div>
                ) : (
                  "Continue with Google"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You can also use Google One Tap for instant login
              </p>
            </div>

            {role === "user" && (
              <p className="text-xs text-muted-foreground">
                Use your email and password. New here? Click Sign Up to create an account and sign in instantly.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
