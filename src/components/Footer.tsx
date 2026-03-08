import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-serif text-xl font-bold text-foreground">Sindhe Vijay Leather Puppets</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Preserving the ancient art of Tholu Bommalata — handcrafted leather shadow puppetry
            from Nimmalakunta, Andhra Pradesh. An 8th-generation legacy of art, culture, and storytelling.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold text-foreground">Quick Links</h4>
          <nav className="mt-3 flex flex-col gap-2">
            {[
              { to: "/shop", label: "Shop All" },
              { to: "/heritage", label: "Our Heritage" },
              { to: "/contact", label: "Custom Orders" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold text-foreground">Contact</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Nimmalakunta Village</span>
            <span>Dharmavaram, Anantapur</span>
            <span>Andhra Pradesh, India</span>
            <a href="mailto:info@sindhevijay.com" className="transition-colors hover:text-primary">
              info@sindhevijay.com
            </a>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sindhe Vijay Leather Puppets. All rights reserved. Handmade with ❤️ in Nimmalakunta.
      </div>
    </div>
  </footer>
);

export default Footer;
