import React from "react";
import { Facebook, Linkedin, Twitter, Instagram } from "lucide-react";
import Image from "next/image";
import LanguageSwitcher from "../language-switcher";
import Link from "next/link";

function Footer() {
  return (
    <footer className="bg-[#FEFAEF] border-t border-gray-200">
      <div className="container mx-auto px-6 pt-10 pb-8">

        {/* Main Content */}
        <div className="flex flex-col md:flex-row justify-between">
          {/* Brand Section */}
          <div className="text-center md:text-left ">
            <div className="mb-6 flex justify-center md:justify-start">
              <div className="w-[116px] h-[89px] rounded-full flex items-center justify-center">
                <Image src="/images/chedsnyoLogo.png" width={200} height={200} alt="logo" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              Amsterdam, Nederland
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">E-mail:</span> info@dealclosed.com
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-10 lg:gap-[300px] text-center sm:text-left mx-auto md:mx-0">
            <div className="flex lg:gap-[250px] gap-[50px] mt-10 lg:mt-0">

              {/* Useful Links */}
              <div>
                <h4 className="font-bold text-gray-900 mb-6">Handige links</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/explore-freelancers" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Ontdek freelancers
                    </Link>
                  </li>
                  <li>
                    <Link href="/assignments" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Opdrachten
                    </Link>
                  </li>
                  <li>
                    <Link href="/leaderboard" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Ranglijst
                    </Link>
                  </li>
                  {/* <li>
                    <Link href="/about" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Over ons
                    </Link>
                  </li> */}
                  <li>
                    <Link href="/blogs" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Other Links */}
              <div>
                <h4 className="font-bold text-gray-900 mb-6">Andere links</h4>
                <ul className="space-y-3">
                  {/* <li>
                    <Link href="/contact" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Neem contact op
                    </Link>
                  </li> */}
                  <li>
                    <Link href="/find-business" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Vind bedrijven
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Cursussen
                    </Link>
                  </li>
                  {/* <li>
                    <Link href="/privacy-policy" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Privacybeleid
                    </Link>
                  </li> */}
                  {/* <li>
                    <Link href="/terms-of-service" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      Servicevoorwaarden
                    </Link>
                  </li> */}
                </ul>
              </div>

            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Volg ons</h4>
              <div className="flex justify-center sm:justify-start gap-4">
                <a
                  href="https://www.facebook.com"
                  className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-green-600 hover:bg-green-600 hover:text-white transition-all"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://www.linkedin.com"
                  className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-green-600 hover:bg-green-600 hover:text-white transition-all"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://www.twitter.com"
                  className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-green-600 hover:bg-green-600 hover:text-white transition-all"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://www.instagram.com"
                  className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-green-600 hover:bg-green-600 hover:text-white transition-all"
                >
                  <Instagram size={18} />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6 mt-10">
            <p className="text-center text-gray-600 text-sm">
            © 2025 <span className="font-bold">Deal Closed</span>. Alle rechten voorbehouden
          </p>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="bg-gray-50">
        <LanguageSwitcher />
      </div>
    </footer>
  );
}

export default Footer;
