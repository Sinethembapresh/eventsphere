import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-lg bg-white/80 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-pink-500 to-blue-400 text-transparent bg-clip-text mb-2">EventSphere</h1>
          <p className="text-gray-600">College Event Management System</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
