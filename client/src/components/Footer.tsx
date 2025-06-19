import { Link } from "wouter";
import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  
  const footerLinks = {
    platform: [
      { 
        label: "Beranda", 
        href: "#hero",
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          const element = document.getElementById("hero");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      },
      { 
        label: "Tentang", 
        href: "#tentang",
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          const element = document.getElementById("tentang");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      },
      { label: "Laporan Saya", href: "/reports" },
      { label: "Peta Bencana", href: "/map" },
      { 
        label: "Laporkan Bencana", 
        href: "#quick-report",
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          const element = document.getElementById("quick-report");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      },
      { 
        label: "Mengapa Quick Aid", 
        href: "#mengapa",
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          const element = document.getElementById("mengapa");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      },
      { 
        label: "Tips Saat Terjadi Bencana", 
        href: "#tips",
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          const element = document.getElementById("tips");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      },
    ],
    help: [
      { label: "Cara Melaporkan", href: "#how-to-report" },
      { label: "FAQ", href: "#faq" },
      { label: "Panduan Pengguna", href: "#guide" },
      { label: "Kontak Kami", href: "#contact" },
    ],
    emergency: [
      { label: "BNPB: 117", href: "tel:117" },
      { label: "Basarnas: 115", href: "tel:115" },
      { label: "Ambulan: 118", href: "tel:118" },
      { label: "Pemadam: 113", href: "tel:113" },
    ]
  };

  return (
    <footer className="bg-background border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold">Quick Aid</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform pelaporan bencana berbasis teknologi cloud untuk membantu masyarakat Indonesia melaporkan dan memantau bencana alam secara real-time.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Facebook className="h-4 w-4 text-primary" />
              </a>
              <a href="#" className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Twitter className="h-4 w-4 text-primary" />
              </a>
              <a href="#" className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Instagram className="h-4 w-4 text-primary" />
              </a>
              <a href="#" className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Youtube className="h-4 w-4 text-primary" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  {link.onClick ? (
                    <a 
                      href={link.href} 
                      onClick={link.onClick}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Bantuan</h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Nomor Darurat</h3>
            <ul className="space-y-3">
              {footerLinks.emergency.map((contact) => (
                <li key={contact.href}>
                  <a href={contact.href} className="text-sm text-alert hover:text-alert/80 transition-colors font-medium">
                    {contact.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="py-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href="mailto:info@quickaid.id" className="text-sm text-muted-foreground hover:text-primary">
                  info@quickaid.id
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Telepon</p>
                <a href="tel:+622150001234" className="text-sm text-muted-foreground hover:text-primary">
                  (021) 5000-1234
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Alamat</p>
                <p className="text-sm text-muted-foreground">
                  Jakarta, Indonesia
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 Quick Aid. Semua hak dilindungi undang-undang.
            </p>
            <div className="flex space-x-6">
              <a href="#privacy" className="text-sm text-muted-foreground hover:text-primary">
                Kebijakan Privasi
              </a>
              <a href="#terms" className="text-sm text-muted-foreground hover:text-primary">
                Syarat & Ketentuan
              </a>
              <a href="#security" className="text-sm text-muted-foreground hover:text-primary">
                Keamanan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}