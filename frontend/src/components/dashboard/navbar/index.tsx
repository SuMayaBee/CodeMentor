import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { User } from '@/types/user';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

interface NavbarProps {
  userData: User;
}

const Navbar = ({ userData }: NavbarProps) => {
  const firstName = userData.name?.split(' ')[0] ?? 'User';
  
  return (
    <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-6">
            <h2 className="text-xl font-bold">
              CodeMentor
            </h2>
            <span className="text-sm font-medium text-muted-foreground pl-2">
              Welcome, {firstName}!
            </span>
          </div>
          <div className="flex items-center space-x-6 pr-2">
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <ThemeSwitcher />
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;