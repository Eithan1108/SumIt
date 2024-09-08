'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Mail, Lock, User } from "lucide-react"
import Link from 'next/link'

export default function Auth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically handle the login or signup logic
    console.log(isLogin ? 'Logging in' : 'Signing up', { email, password, username })
    
    // Simulate successful login/signup
    if (isLogin) {
      // Redirect to dashboard after successful login
      router.push('/dashboard')
    } else {
      // For signup, you might want to show a success message or log the user in automatically
      console.log('Signup successful')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col justify-center items-center p-4">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <BookOpen className="h-8 w-8 text-orange-500" />
        <span className="text-2xl font-bold text-orange-700">SummaryShare</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Log In' : 'Sign Up'}</CardTitle>
          <CardDescription>
            {isLogin
              ? 'Welcome back! Please log in to your account.'
              : 'Create a new account to start sharing summaries.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                  <Input
                    id="username"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
              {isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="outline"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full"
          >
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
          </Button>
          {isLogin && (
            <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
              Forgot your password?
            </Link>
          )}
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-orange-600">
        By {isLogin ? 'logging in' : 'signing up'}, you agree to SummaryShare's{' '}
        <Link href="/terms" className="font-medium text-orange-600 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="font-medium text-orange-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}