import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-serif text-xl font-bold text-foreground">Sindhe Vijay Leather Puppets</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Preserving the ancient art of Thogalu Gombe — traditional handcrafted leather shadow puppetry
            from Jeekavandlapalli, Karnataka. A legacy of art, culture, and storytelling.
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
            <span>Jeekavandlapalli Village</span>
            <span>Bagepalli, Chikkabalapur</span>
            <span>Karnataka 561207, India</span>
            <a href="mailto:sindhevijayleatherpuppets@gmail.com" className="transition-colors hover:text-primary">
              sindhevijayleatherpuppets@gmail.com
            </a>
            <a href="https://instagram.com/sindhe_vijay_leather_puppets" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary font-medium">
              Instagram: @sindhe_vijay_leather_puppets
            </a>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sindhe Vijay Leather Puppets. All rights reserved. Handmade with ❤️ in Jeekavandlapalli.
      </div>
    </div>
  </footer>
);

export default Footer;
