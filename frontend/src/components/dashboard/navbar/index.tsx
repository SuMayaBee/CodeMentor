import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { User } from '@/types/user';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import Image from 'next/image';
import Logo from "@/assets/logo.svg"
import VoiceButton from '@/components/voice-button';

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
          <Image
              src={Logo}
              alt="Logo"
              width={36}
              height={36}
              className="mr-2"
            />
            <h2 className="text-xl font-bold">
              CodeMentor
            </h2>
            <span className="text-sm font-medium text-muted-foreground pl-2">
              Welcome, {firstName}!
            </span>
          </div>
          <div className="flex items-center space-x-6 pr-2">
          <VoiceButton />
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