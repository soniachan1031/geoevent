import Image from "next/image";
import { FC } from "react";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
};

const Logo: FC<LogoProps> = ({ className, height = 50, width = 50 }) => {
  return (
    <Image
      className={className}
      src="/logo.png"
      alt="logo"
      width={height}
      height={width}
    />
  );
};

export default Logo;
