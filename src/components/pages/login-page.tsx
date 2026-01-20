import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Receipt, Lock, User } from "lucide-react";
import logoImage from "figma:asset/9c281fd7f40d9fc8c08d2f76f2006a1e31355018.png";

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-green-100 relative z-10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <img 
                src={logoImage} 
                alt="Geo Billing" 
                className="h-16 w-16 object-contain"
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl text-gray-900">Geo Billing & POS</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to access the Point of Sale system
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                Username or Email
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-600" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-green-600 hover:text-green-700 font-medium">
              Forgot Password?
            </a>
          </div>

          <div className="pt-2">
            <Button 
              onClick={onLogin}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              size="lg"
            >
              <Receipt className="h-5 w-5 mr-2" />
              Sign In to POS
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>Authorized employees and cashiers only</p>
            <p className="mt-1">© 2024 Geo Billing. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}