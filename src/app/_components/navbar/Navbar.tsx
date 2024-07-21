import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, ShoppingCart } from "lucide-react";

const Navbar = () => {
  return (
    <header className="h-[136px] w-full">
      <div className="flex h-[36px] w-full items-center justify-end px-[20px] md:px-[40px]">
        <div className="flex items-center space-x-[20px] text-[12px] text-light">
          <Link href="#">Help</Link>
          <Link href="#">Orders & Returns</Link>
          <Link href="#">Hi, John</Link>
        </div>
      </div>
      <div className="flex h-[64px] w-full items-center justify-between px-[20px] md:px-[40px]">
        <h1 className="text-[25px] font-bold md:text-[32px]">ECOMMERCE</h1>
        <nav className="hidden items-center space-x-[32px] font-semibold md:flex">
          <Link href="#">Categories</Link>
          <Link href="#">Sale</Link>
          <Link href="#">Clearance</Link>
          <Link href="#">New stock</Link>
          <Link href="#">Trending</Link>
        </nav>
        <div className="flex items-center space-x-[32px]">
          <Search strokeWidth={1.5} />
          <ShoppingCart strokeWidth={1.5} />
        </div>
      </div>
      <div className="flex h-[36px] w-full items-center justify-center bg-[#F4F4F4] px-[40px]">
        <div className="flex items-center justify-center space-x-[20px] md:ml-[100px]">
          <ChevronLeft strokeWidth={1.5} />
          <div className="text-[11px] font-medium md:text-[14px]">
            Get 10% off on business sign up
          </div>
          <ChevronRight strokeWidth={1.5} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
