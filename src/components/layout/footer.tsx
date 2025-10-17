import Link from 'next/link';
import { Logo, Facebook, Twitter, Instagram } from '@/components/icons';

export default function Footer() {
  return (
    <footer className="bg-[#3CB371] text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">BeautifulSoup&Food</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Delivering freshness and quality right to your doorstep.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-primary-foreground/80 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-primary-foreground/80 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-primary-foreground/80 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Information</h4>
            <ul className="space-y-1">
              <li><Link href="#" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">Legal</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Our Details</h4>
            <div className="text-sm text-primary-foreground/80">
              <p>123 Fresh Lane, Foodie City, 10101</p>
              <p>Email: contact@bsfood.com</p>
              <p className="mt-2 font-medium text-white">Opening Hours:</p>
              <p>Mon - Fri: 9am - 7pm</p>
              <p>Sat: 10am - 5pm</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Product Videos</h4>
            <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center">
              <p className="text-sm text-primary-foreground/60">Video Placeholder</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center text-sm text-primary-foreground/80">
          © {new Date().getFullYear()} BeautifulSoup&Food. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
