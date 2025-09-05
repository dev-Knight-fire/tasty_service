"use client"
import Image from "next/image";
import Link from "next/link";
import LogoImg from "../../../../public/tastyservice_logo.png";

const Logo = () => {
  
  return (
    <div className="logo">
      <Link href="/" data-abc={true}>
        <Image src={LogoImg} width={270} alt="SeniorLink Home" />
      </Link>
    </div>
  );
};

export default Logo;
