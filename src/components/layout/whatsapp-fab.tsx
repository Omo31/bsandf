
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { FooterSettings } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );
}

export function WhatsAppFAB() {
  const firestore = useFirestore();
  const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'footer_settings'), [firestore]);
  const { data: settings, isLoading } = useDoc<FooterSettings>(settingsDocRef);

  if (isLoading) {
    return <Skeleton className="fixed bottom-6 right-6 h-14 w-14 rounded-full" />;
  }

  if (!settings?.whatsappNumber) {
    return null;
  }

  // Basic validation/sanitization for the phone number
  const phoneNumber = settings.whatsappNumber.replace(/\D/g, '');
  if (!phoneNumber) return null;

  const whatsappLink = `https://wa.me/${phoneNumber}`;

  return (
    <Link
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#25D366] text-white',
        'flex items-center justify-center shadow-lg',
        'transition-transform hover:scale-110 active:scale-100'
      )}
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </Link>
  );
}
