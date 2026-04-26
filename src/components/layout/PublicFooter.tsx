export function PublicFooter() {
  return (
    <footer className="bg-rhino text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h3 className="font-heading text-2xl font-bold">Sundo</h3>
          <p className="font-body text-akaroa/70 text-sm leading-relaxed max-w-xs">
            Connecting returning OFWs with verified consultants who've walked the same path.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-lg font-bold mb-6">Platform</h4>
          <ul className="space-y-4 font-body text-sm text-akaroa/70">
            <li><a href="#" className="hover:text-white transition-colors">Find a Consultant</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Become a Consultant</a></li>
            <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-lg font-bold mb-6">Company</h4>
          <ul className="space-y-4 font-body text-sm text-akaroa/70">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-lg font-bold mb-6">Support</h4>
          <p className="font-body text-sm text-akaroa/70 mb-4">
            Need help? Reach out to our team.
          </p>
          <a href="mailto:support@sundo.ph" className="font-body text-sm font-bold text-white hover:text-desert transition-colors">
            support@sundo.ph
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-akaroa/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body text-xs text-akaroa/40">
          &copy; {new Date().getFullYear()} Sundo. All rights reserved.
        </p>
        <div className="flex gap-6 font-body text-xs text-akaroa/40">
          <button className="hover:text-white transition-colors">English</button>
          <button className="hover:text-white transition-colors">Filipino</button>
        </div>
      </div>
    </footer>
  );
}
