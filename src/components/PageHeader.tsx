import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backLink?: string;
  onLogout?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  backLink,
  onLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
}) => {
  return (
    <div className="flex items-center justify-between border-b bg-background px-3 py-2 md:px-6 md:py-3">
  <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
    {backLink && (
      <Link
        to={backLink}
        className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
        Back
      </Link>
    )}
    <span className="text-sm md:text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[55vw] md:max-w-none">
      {title}
    </span>
  </div>

  <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
    {/* Ensure your ThemeToggle uses responsive sizes internally if needed */}
    <div className="scale-90 md:scale-100 origin-right">
      <ThemeToggle />
    </div>

    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 md:h-10 md:w-10"
      onClick={onLogout}
    >
      <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
    </Button>
  </div>
</div>

  );
};

export default PageHeader; 