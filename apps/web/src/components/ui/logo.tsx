import Image from "next/image";
import * as React from "react";

export function Logo({ className }: React.ComponentProps<"input">) {
  return (
    <div className="flex gap-2 items-center h-full sm:gap-16">
      <h2
        className={`font-semibold text-blue-900 ${className}  w-fit flex items-center justify-center gap-2`}
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={150}
          height={150}
          className="w-[180px] h-fit"
        />
      </h2>
    </div>
  );
}
