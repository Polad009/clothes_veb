const fs = require('fs');

let content = fs.readFileSync('components/Header.tsx', 'utf8');

// Find the mobile drawer categories container
const marker = '{t.nav.categories || "Kolleksiyalar"}';
const pos = content.lastIndexOf(marker);

if (pos !== -1) {
  const divMarker = '<div className="pt-2">';
  const divPos = content.lastIndexOf(divMarker, pos);
  
  if (divPos !== -1) {
    const mobileGenderBlock = `<div className="pt-2">
                  <div className="mb-3 pb-3 border-b border-[#E8E2D8]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A7B4F] px-1 pb-2">
                      Cins
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/collections?gender=men"
                        prefetch={true}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center py-2 px-3 rounded-full text-xs font-bold border border-[#E5DFD5] bg-[#FAF7F2] text-stone-900 hover:bg-stone-900 hover:text-white transition shadow-2xs"
                      >
                        Kişi (Men)
                      </Link>
                      <Link
                        href="/collections?gender=women"
                        prefetch={true}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center py-2 px-3 rounded-full text-xs font-bold border border-[#E5DFD5] bg-[#FAF7F2] text-stone-900 hover:bg-stone-900 hover:text-white transition shadow-2xs"
                      >
                        Qadın (Women)
                      </Link>
                    </div>
                  </div>`;
                  
    content = content.slice(0, divPos) + mobileGenderBlock + content.slice(divPos + divMarker.length);
    fs.writeFileSync('components/Header.tsx', content, 'utf8');
    console.log('Mobile menu updated with Gender selector successfully!');
  }
}
