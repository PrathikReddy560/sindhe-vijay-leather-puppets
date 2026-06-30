import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-stone-950 text-stone-300 dark:bg-stone-950 dark:text-stone-300">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-serif text-xl font-bold text-stone-50">Sindhe Vijay Leather Puppets</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-400">
            Preserving the ancient art of Thogalu Gombe — traditional handcrafted leather shadow puppetry
            from Jeekavandlapalli, Karnataka. A legacy of art, culture, and storytelling.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold text-stone-50">Quick Links</h4>
          <nav className="mt-3 flex flex-col gap-2">
            {[
              { to: "/shop", label: "Shop All" },
              { to: "/heritage", label: "Our Heritage" },
              { to: "/contact", label: "Custom Orders" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-stone-400 underline underline-offset-4 transition-colors hover:text-amber-500">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold text-stone-50">Contact</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-stone-400">
            <a
              href="https://maps.google.com/?q=Jeekavandlapalli+Village,Bagepalli,Chikkabalapur,Karnataka+561207,India"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-amber-500"
            >
              Jeekavandlapalli Village<br />
              Bagepalli, Chikkabalapur<br />
              Karnataka 561207, India
            </a>
            <a href="mailto:sindhevijayleatherpuppets@gmail.com" className="mt-2 underline underline-offset-4 transition-colors hover:text-amber-500">
              sindhevijayleatherpuppets@gmail.com
            </a>
            <a href="https://instagram.com/sindhe_vijay_leather_puppets" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4 transition-colors hover:text-amber-500">
              <ul>Instagram: @sindhe_vijay_leather_puppets</ul>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-stone-800 pt-6 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Sindhe Vijay Leather Puppets. All rights reserved. Handmade with ❤️ in Jeekavandlapalli.
      </div>
    </div>
  </footer>
);

export default Footer;
