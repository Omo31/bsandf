
'use client';

import Link from 'next/link';
import { Logo, Facebook, Twitter, Instagram } from '@/components/icons';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { FooterSettings } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Youtube } from 'lucide-react';

export default function Footer() {
    const firestore = useFirestore();
    const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'footer_settings'), [firestore]);
    const { data: settings, isLoading } = useDoc<FooterSettings>(settingsDocRef);

    const defaultSettings = {
        tagline: "Delivering freshness and quality right to your doorstep.",
        aboutUs: "",
        address: "123 Fresh Lane, Foodie City, 10101",
        email: "contact@bsfood.com",
        openingHours: "Mon - Fri: 9am - 7pm\nSat: 10am - 5pm",
        facebookUrl: "#",
        instagramUrl: "#",
        youtubeUrl: "#",
        productVideoId: "dQw4w9WgXcQ" // A classic placeholder
    };

    const content = isLoading ? defaultSettings : { ...defaultSettings, ...settings };


  return (
    <footer className="bg-[#3CB371] text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">BeautifulSoup&Food</span>
            </Link>
             {isLoading ? <Skeleton className="h-10 w-full" /> : <p className="text-sm text-primary-foreground/80">{content.tagline}</p>}
             {isLoading ? <Skeleton className="h-10 w-full" /> : <p className="text-sm text-primary-foreground/80">{content.aboutUs}</p>}

          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Follow Us On</h4>
            <div className="flex space-x-4">
              {isLoading ? <Skeleton className="h-5 w-20" /> : (
                <>
                 {content.facebookUrl && <Link href={content.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></Link>}
                 {content.instagramUrl && <Link href={content.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></Link>}
                 {content.youtubeUrl && <Link href={content.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-white transition-colors"><Youtube className="h-5 w-5" /></Link>}
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Our Details</h4>
            {isLoading ? <Skeleton className="h-24 w-full" /> : (
                <div className="text-sm text-primary-foreground/80 whitespace-pre-line">
                    <p>{content.address}</p>
                    <p>Email: {content.email}</p>
                    <p className="mt-2 font-medium text-white">Opening Hours:</p>
                    <p>{content.openingHours}</p>
                </div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Product Videos</h4>
            {isLoading ? <Skeleton className="aspect-video w-full rounded-lg" /> : (
                 <div className="aspect-video bg-black/20 rounded-lg">
                    {content.productVideoId ? (
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${content.productVideoId}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-primary-foreground/60">No video set</p>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center text-sm text-primary-foreground/80">
          © {new Date().getFullYear()} BeautifulSoup&Food. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

    