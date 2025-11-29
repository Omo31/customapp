import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <Logo />
      <LoginForm />
    </div>
  );
}
