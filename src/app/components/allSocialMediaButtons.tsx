import { Button } from '@/components/ui/button';

// Use relative paths for icons (assume this file is in components/ and icons/ is a sibling)
import Facebook from './icons/facebook';
import Instagram from './icons/instagram';
import Linkedin from './icons/linkedin';
import Twitter from './icons/twitter';
import Link from 'next/link';

// Social media link variables
const facebookUrl =
  'https://www.facebook.com/people/Finanstidning-Nyheter/pfbid02SvfPjub9ZZjT86PukPpdM2m59eCyQNMXqrRy43yHcK2b8huV5sjE7FVGJGpSEFpTl/';
const instagramUrl = 'https://www.instagram.com/finanstidning/';
const linkedinUrl =
  'https://www.linkedin.com/in/finanstidning-nyheter-b32662377/';
const xUrl = 'https://x.com/Finanstidning1';

const socialButtons = [
  { Icon: Facebook, label: 'Facebook', url: facebookUrl },
  { Icon: Instagram, label: 'Instagram', url: instagramUrl },
  { Icon: Linkedin, label: 'LinkedIn', url: linkedinUrl },
  { Icon: Twitter, label: 'X', url: xUrl },
];

const SocialMediaButtons = ({ className }: { className?: string }) => (
  <div
    className={`flex flex-row gap-2 justify-center md:justify-end ${className || ''}`}
  >
    {socialButtons.map(({ Icon, label, url }) => (
      <Button
        key={label}
        variant="ghost"
        size="iconSmall"
        className="h-9 w-9 flex items-center justify-center p-0 rounded-xs border border-transparent hover:bg-neutral-100 transition-colors"
        asChild
        aria-label={label}
      >
        <Link href={url} target="_blank" rel="noopener noreferrer" prefetch={false}>
          <Icon className="w-5 h-5 text-neutral-500" />
        </Link>
      </Button>
    ))}
  </div>
);

export default SocialMediaButtons;
