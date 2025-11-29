import { SignupForm } from '@/components/auth/signup-form';
import { Logo } from '@/components/logo';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <Logo />
      <SignupForm />
    </div>
  );
}
