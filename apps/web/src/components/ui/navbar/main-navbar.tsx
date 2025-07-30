"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { Logo } from "../logo";
import { LogOut } from "lucide-react";
import DialogLogout from "./_components/dialog";

const Navbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { location?: string }
>(({ className, location }, ref) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <div
      className={`${className} sticky top-0 z-50 bg-white flex justify-between items-center w-full h-[64px]  sm:px-[32px] py-[16px] px-[20px] ${
        location == "homepage" ? "bg-transparent sm:flex hidden" : ""
      }`}
      ref={ref}
    >
      <div className="flex items-center h-full gap-2 sm:gap-16">
        <Logo />
      </div>
      <div className="flex gap-[6px] items-center justify-center">
        <>
          {isOpen && (
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-blue-200 text-blue-900 focus:outline-none"
            >
              {session?.email?.charAt(0).toUpperCase()}
            </button>
            {isOpen && (
              <div className="border-slate-200 border-[1px] absolute right-[-10px] mt-2 text-[14px] p-[5px] w-[224px]  rounded-[6px] bg-white shadow-lg  z-50">
                <div className="py-[6px] px-[8px] gap-[8px] font-medium text-red flex items-center hover:bg-transparent cursor-pointer">
                  <LogOut className="w-4 h-4 text-red-500" />
                  <div
                    className="w-full text-left text-red-500 hover:bg-transparent"
                    onClick={() => {
                      setIsDialogOpen(true);
                      setIsOpen(false);
                    }}
                  >
                    Log Out
                  </div>
                </div>
              </div>
            )}
            {isDialogOpen && (
              <DialogLogout
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
              />
            )}
          </div>
        </>
      </div>
    </div>
  );
});

Navbar.displayName = "Navbar";

export { Navbar };
