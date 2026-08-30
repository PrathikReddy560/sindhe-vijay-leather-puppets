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
              { to: "/style-my-space", label: "Style My Space (AI Studio)" },
              { to: "/heritage", label: "Our Heritage" },
              { to: "/workshops", label: "Workshops" },
              { to: "/events", label: "Live Events" },
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
              href="https://www.google.com/maps/place/Sindhe+vijay+Leather+puppets/@13.8675952,77.9431707,17z/data=!3m1!4b1!4m6!3m5!1s0x3bb229e961a0bf8f:0xe83fb39e8a025224!8m2!3d13.8675952!4d77.9431707!16s%2Fg%2F11vz4qx090?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D"
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
